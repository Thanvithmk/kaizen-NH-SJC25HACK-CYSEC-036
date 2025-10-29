const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const LoginActivity = require("../models/LoginActivity");
const EmployeePattern = require("../models/EmployeePattern");
const ActiveThreat = require("../models/ActiveThreat");
const GeographicAlert = require("../models/GeographicAlert");
const ruleEngine = require("../utils/ruleEngine");
const locationService = require("./locationService");
const folderMonitoringService = require("./folderMonitoringService");

class AuthService {
  constructor() {
    this.activeSessions = new Map();
    this.sessionTimeout =
      (process.env.SESSION_TIMEOUT_MINUTES || 30) * 60 * 1000;
  }

  /**
   * Generate employee token
   * @returns {String} - Employee token (EMP001, EMP002, etc.)
   */
  async generateEmployeeToken() {
    const lastEmployee = await EmployeePattern.findOne().sort({
      emp_token: -1,
    });

    if (!lastEmployee) {
      return "EMP001";
    }

    const lastNumber = parseInt(lastEmployee.emp_token.replace("EMP", ""));
    const newNumber = lastNumber + 1;
    return `EMP${String(newNumber).padStart(3, "0")}`;
  }

  /**
   * Register new employee
   * @param {Object} employeeData - Employee registration data
   * @returns {Object} - Created employee pattern
   */
  async registerEmployee(employeeData) {
    try {
      const token = await this.generateEmployeeToken();

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(
        employeeData.password || "password123",
        10
      );

      const employee = await EmployeePattern.create({
        emp_name: employeeData.emp_name || "",
        emp_id: employeeData.emp_id || "",
        emp_token: token,
        password: hashedPassword,
        location_type: employeeData.location_type || "Office",
        ip_range: employeeData.ip_range || "",
        usual_login_time: employeeData.usual_login_time || "09:00",
        usual_logout_time: employeeData.usual_logout_time || "17:00",
        country: employeeData.country || "",
        city: employeeData.city || "",
        status: 1,
      });

      return employee;
    } catch (error) {
      throw new Error(`Failed to register employee: ${error.message}`);
    }
  }

  /**
   * Handle employee login (secondary security login)
   * @param {Object} loginData - Login data
   * @returns {Object} - Login result with token
   */
  async handleLogin(loginData) {
    const { employee_token, password, ip_address } = loginData;

    try {
      // Verify employee exists
      const employee = await EmployeePattern.findOne({
        emp_token: employee_token,
        status: 1,
      });

      if (!employee) {
        // Record failed attempt
        await this.recordFailedLogin(employee_token, ip_address);
        throw new Error("Invalid employee ID or password");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, employee.password);
      if (!isPasswordValid) {
        // Record failed attempt
        await this.recordFailedLogin(employee_token, ip_address);
        throw new Error("Invalid employee ID or password");
      }

      // Get previous login for geographic analysis
      const previousLogin = await LoginActivity.findOne({
        employee_token,
        success_status: "Success",
        logout_timestamp: { $ne: null },
      }).sort({ login_timestamp: -1 });

      // Create login activity record
      const loginActivity = await LoginActivity.create({
        employee_token,
        login_timestamp: new Date(),
        ip_address,
        success_status: "Success",
        failed_attempts_count: 0,
        risk_level: "Low",
      });

      // Analyze geographic anomaly
      if (previousLogin) {
        const anomaly = await locationService.analyzeGeographicAnomaly(
          { ip_address, login_timestamp: loginActivity.login_timestamp },
          previousLogin
        );

        if (anomaly && anomaly.risk_score >= 25) {
          // Create geographic alert
          const geoAlert = await GeographicAlert.create({
            employee_token,
            alert_timestamp: new Date(),
            current_country: anomaly.current_country,
            current_city: anomaly.current_city,
            previous_country: anomaly.previous_country,
            previous_city: anomaly.previous_city,
            time_between_logins_hours: anomaly.time_between_logins_hours,
            minimum_travel_time_hours: anomaly.minimum_travel_time_hours,
            anomaly_type: anomaly.anomaly_type,
            risk_level: anomaly.risk_level,
            verified: "No",
          });

          // Create active threat
          const geoThreat = await ActiveThreat.create({
            alert_date_time: new Date(),
            risk_score: anomaly.risk_score,
            alert_type: "geo",
            employee_token,
            solved: "N",
            original_alert_id: geoAlert._id,
            details: {
              anomaly_type: anomaly.anomaly_type,
              current_location: `${anomaly.current_city}, ${anomaly.current_country}`,
              previous_location: `${anomaly.previous_city}, ${anomaly.previous_country}`,
              reasons: anomaly.reasons,
            },
          });

          console.log(`🚨 Geographic alert created for ${employee_token}`);

          // Emit real-time update
          if (global.emitAlert) {
            global.emitAlert({
              type: "geo",
              threat: geoThreat,
              message: `Geographic anomaly: ${anomaly.current_city}, ${anomaly.current_country}`,
              employee_token,
            });
          }
        }
      }

      // Check login time anomaly
      const loginRisk = ruleEngine.calculateLoginRisk({
        failed_attempts_count: 0,
        login_timestamp: loginActivity.login_timestamp,
        success_status: "Success",
        previousFailedAttempts: false,
      });

      if (loginRisk.riskScore >= 25) {
        loginActivity.risk_level = loginRisk.riskLevel;
        await loginActivity.save();

        // Create active threat for suspicious login time
        const loginThreat = await ActiveThreat.create({
          alert_date_time: new Date(),
          risk_score: loginRisk.riskScore,
          alert_type: "login",
          employee_token,
          solved: "N",
          original_alert_id: loginActivity._id,
          details: {
            login_time: loginActivity.login_timestamp,
            reasons: loginRisk.reasons,
          },
        });

        console.log(`🚨 Login time alert created for ${employee_token}`);

        // Emit real-time update
        if (global.emitAlert) {
          global.emitAlert({
            type: "login",
            threat: loginThreat,
            message: `Suspicious login time detected`,
            employee_token,
          });
        }
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { employee_token, loginId: loginActivity._id },
        process.env.JWT_SECRET || "default_secret_change_this",
        { expiresIn: "8h" }
      );

      // Store active session
      this.activeSessions.set(employee_token, {
        loginId: loginActivity._id,
        loginTime: Date.now(),
        lastActivity: Date.now(),
      });

      // Start folder monitoring
      folderMonitoringService.startMonitoring(employee_token);

      // Setup auto-logout timer
      this.setupAutoLogout(employee_token);

      return {
        success: true,
        token: jwtToken,
        employee_token,
        employee_name: employee.emp_name,
        login_id: loginActivity._id,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Record failed login attempt
   * @param {String} employee_token - Employee token
   * @param {String} ip_address - IP address
   */
  async recordFailedLogin(employee_token, ip_address) {
    // Get recent failed attempts
    const recentFailed = await LoginActivity.countDocuments({
      employee_token,
      success_status: "Failed",
      login_timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
    });

    const failedCount = recentFailed + 1;

    // Calculate risk
    const riskData = ruleEngine.calculateLoginRisk({
      failed_attempts_count: failedCount,
      login_timestamp: new Date(),
      success_status: "Failed",
      previousFailedAttempts: false,
    });

    // Create failed login record
    const loginActivity = await LoginActivity.create({
      employee_token,
      login_timestamp: new Date(),
      ip_address,
      success_status: "Failed",
      failed_attempts_count: failedCount,
      risk_level: riskData.riskLevel,
    });

    // Create threat if high risk
    if (riskData.riskScore >= 25) {
      const failedLoginThreat = await ActiveThreat.create({
        alert_date_time: new Date(),
        risk_score: riskData.riskScore,
        alert_type: "login",
        employee_token,
        solved: "N",
        original_alert_id: loginActivity._id,
        details: {
          failed_attempts: failedCount,
          reasons: riskData.reasons,
        },
      });

      // Emit real-time update
      if (global.emitAlert) {
        global.emitAlert({
          type: "login",
          threat: failedLoginThreat,
          message: `Failed login attempts: ${failedCount}`,
          employee_token,
        });
      }
    }
  }

  /**
   * Handle employee logout
   * @param {String} employee_token - Employee token
   */
  async handleLogout(employee_token) {
    try {
      // Update login activity
      const session = this.activeSessions.get(employee_token);

      if (session) {
        await LoginActivity.findByIdAndUpdate(session.loginId, {
          logout_timestamp: new Date(),
        });

        // Stop folder monitoring
        await folderMonitoringService.stopMonitoring(employee_token);

        // Remove session
        this.activeSessions.delete(employee_token);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Setup auto-logout after inactivity
   * @param {String} employee_token - Employee token
   */
  setupAutoLogout(employee_token) {
    const checkInterval = 60000; // Check every minute

    const intervalId = setInterval(async () => {
      const session = this.activeSessions.get(employee_token);

      if (session) {
        const inactiveTime = Date.now() - session.lastActivity;

        if (inactiveTime >= this.sessionTimeout) {
          console.log(`Auto-logout for ${employee_token} due to inactivity`);
          await this.handleLogout(employee_token);
          clearInterval(intervalId);
        }
      } else {
        clearInterval(intervalId);
      }
    }, checkInterval);
  }

  /**
   * Update session activity
   * @param {String} employee_token - Employee token
   */
  updateActivity(employee_token) {
    const session = this.activeSessions.get(employee_token);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token
   * @returns {Object} - Decoded token
   */
  verifyToken(token) {
    try {
      return jwt.verify(
        token,
        process.env.JWT_SECRET || "default_secret_change_this"
      );
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  /**
   * Get active sessions count
   * @returns {Number}
   */
  getActiveSessionsCount() {
    return this.activeSessions.size;
  }

  /**
   * Get all active sessions
   * @returns {Array}
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.entries()).map(
      ([token, session]) => ({
        employee_token: token,
        login_time: new Date(session.loginTime),
        last_activity: new Date(session.lastActivity),
      })
    );
  }
}

module.exports = new AuthService();
