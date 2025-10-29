const express = require("express");
const router = express.Router();
const EmployeePattern = require("../models/EmployeePattern");
const LoginActivity = require("../models/LoginActivity");
const ActiveThreat = require("../models/ActiveThreat");
const bcrypt = require("bcryptjs");

/**
 * @route   POST /api/employees/login
 * @desc    Employee login with risk tracking
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { employeeId, password, ip_address, location } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and password are required",
      });
    }

    // Find employee
    const employee = await EmployeePattern.findOne({
      emp_token: employeeId.toUpperCase(),
    });

    // Mock location data (in production, use IP geolocation service)
    const mockLocations = [
      { city: "New York", country: "United States", location: "New York, US" },
      { city: "London", country: "United Kingdom", location: "London, UK" },
      { city: "Tokyo", country: "Japan", location: "Tokyo, JP" },
      { city: "Sydney", country: "Australia", location: "Sydney, AU" },
      { city: "Mumbai", country: "India", location: "Mumbai, IN" },
      { city: "Toronto", country: "Canada", location: "Toronto, CA" },
    ];
    const randomLocation =
      mockLocations[Math.floor(Math.random() * mockLocations.length)];

    if (!employee) {
      // Create failed login record even if employee doesn't exist
      // Ensure employee token is in valid format, or use placeholder
      let normalizedToken = employeeId.toUpperCase();

      // If format is invalid, create a sanitized version
      if (!normalizedToken.match(/^EMP\d{3,}$/)) {
        console.log(`Invalid employee token format: ${employeeId}`);
        // Try to extract numbers and create valid format
        const numbers = employeeId.replace(/\D/g, "");
        if (numbers) {
          normalizedToken = `EMP${numbers.padStart(3, "0")}`;
        } else {
          normalizedToken = "EMP999"; // Placeholder for invalid formats
        }
      }

      const loginData = {
        employee_token: normalizedToken,
        ip_address: ip_address || req.ip || "127.0.0.1",
        login_timestamp: new Date(),
        city: randomLocation.city,
        country: randomLocation.country,
        location: randomLocation.location,
        success_status: "Failed",
      };

      try {
        await LoginActivity.create(loginData);
        console.log(`Failed login recorded for ${normalizedToken}`);
      } catch (error) {
        console.error("Error creating failed login record:", error.message);
      }

      return res.status(404).json({
        success: false,
        message: "Invalid employee ID or password",
        failedAttempts: 1,
        riskLevel: "Low",
      });
    }

    // Check if employee is active
    if (employee.status !== 1) {
      // Create failed login record for inactive employee
      const loginData = {
        employee_token: employee.emp_token,
        ip_address: ip_address || req.ip || "127.0.0.1",
        login_timestamp: new Date(),
        city: randomLocation.city,
        country: randomLocation.country,
        location: randomLocation.location,
        success_status: "Failed",
      };

      try {
        await LoginActivity.create(loginData);
        console.log(
          `Failed login recorded for inactive employee ${employee.emp_token}`
        );
      } catch (error) {
        console.error("Error creating failed login record:", error.message);
      }

      return res.status(403).json({
        success: false,
        message: "Employee account is inactive",
        failedAttempts: 1,
        riskLevel: "Low",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.password);

    const loginData = {
      employee_token: employee.emp_token,
      ip_address: ip_address || req.ip || "127.0.0.1",
      login_timestamp: new Date(),
      city: randomLocation.city,
      country: randomLocation.country,
      location: randomLocation.location,
      success_status: isPasswordValid ? "Success" : "Failed",
      failure_reason: isPasswordValid ? null : "Invalid credentials",
    };

    // Create login activity record
    let loginActivity;
    try {
      loginActivity = await LoginActivity.create(loginData);
      console.log(
        `Login activity created: ${loginData.success_status} for ${employee.emp_token}`
      );
    } catch (error) {
      console.error("Error creating login activity:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to record login activity",
        error: error.message,
      });
    }

    if (!isPasswordValid) {
      // Count recent failed attempts (last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentFailedAttempts = await LoginActivity.countDocuments({
        employee_token: employee.emp_token,
        success_status: "Failed",
        login_timestamp: { $gte: thirtyMinutesAgo },
      });

      // Calculate risk level based on failed attempts
      // Dashboard categorizes: High >= 50, Medium 25-49, Low < 25
      let riskScore = 0;
      let severityLevel = "Low";
      const anomalies = [];

      if (recentFailedAttempts >= 5) {
        riskScore = 70;
        severityLevel = "High";
        anomalies.push(
          `High: ${recentFailedAttempts} failed login attempts in 30 minutes`
        );
      } else if (recentFailedAttempts >= 3) {
        riskScore = 45; // Medium (was 50, which is High threshold)
        severityLevel = "Medium";
        anomalies.push(
          `Warning: ${recentFailedAttempts} failed login attempts in 30 minutes`
        );
      } else if (recentFailedAttempts >= 2) {
        riskScore = 30; // Low/Medium boundary
        severityLevel = "Low";
        anomalies.push(`${recentFailedAttempts} failed login attempts`);
      }

      // Create or update threat alert if risk is significant (>= 25 is Medium threshold)
      if (riskScore >= 25) {
        // Check if there's already an active threat for this employee's failed logins
        // within the last 30 minutes
        const existingThreat = await ActiveThreat.findOne({
          employee_token: employee.emp_token,
          alert_type: "login",
          solved: "N",
          "details.success_status": "Failed",
          alert_date_time: { $gte: thirtyMinutesAgo },
        });

        let threat;
        if (existingThreat) {
          // Update existing threat with new risk score and attempt count
          existingThreat.risk_score = riskScore;
          existingThreat.alert_date_time = new Date();
          existingThreat.details.failed_attempts = recentFailedAttempts;
          existingThreat.details.severity_level = severityLevel;
          existingThreat.details.anomalies = anomalies;
          existingThreat.details.ip_address = loginData.ip_address;
          existingThreat.details.location = loginData.location;

          threat = await existingThreat.save();
          console.log(
            `Updated existing threat for ${employee.emp_token}: ${recentFailedAttempts} attempts, score ${riskScore}`
          );
        } else {
          // Create new threat
          threat = await ActiveThreat.create({
            employee_token: employee.emp_token,
            alert_type: "login",
            risk_score: riskScore,
            original_alert_id: loginActivity._id,
            alert_date_time: new Date(),
            solved: "N",
            details: {
              ip_address: loginData.ip_address,
              location: loginData.location,
              anomalies: anomalies,
              failed_attempts: recentFailedAttempts,
              success_status: "Failed",
              severity_level: severityLevel,
            },
          });
          console.log(
            `Created new threat for ${employee.emp_token}: ${recentFailedAttempts} attempts, score ${riskScore}`
          );
        }

        // Emit real-time update
        if (global.emitAlert) {
          global.emitAlert({
            type: "login",
            threat,
            message: `Failed login attempts: ${recentFailedAttempts}`,
            employee_token: employee.emp_token,
          });
        }
      }

      return res.status(401).json({
        success: false,
        message: "Invalid employee ID or password",
        failedAttempts: recentFailedAttempts,
        riskLevel: severityLevel,
      });
    }

    // Successful login - calculate low risk
    const threat = await ActiveThreat.create({
      employee_token: employee.emp_token,
      alert_type: "login",
      risk_score: 5,
      original_alert_id: loginActivity._id,
      alert_date_time: new Date(),
      solved: "N",
      details: {
        ip_address: loginData.ip_address,
        location: loginData.location,
        anomalies: ["Normal login activity"],
        success_status: "Success",
        severity_level: "Low",
      },
    });

    // Emit successful login (low risk, but logged)
    if (global.emitAlert) {
      global.emitAlert({
        type: "login",
        threat,
        message: `Successful login: ${employee.emp_name}`,
        employee_token: employee.emp_token,
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      employee: {
        emp_token: employee.emp_token,
        emp_name: employee.emp_name,
        emp_id: employee.emp_id,
      },
      loginActivity: loginActivity._id,
      riskLevel: "Low",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/employees/register
 * @desc    Register new employee
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    const { emp_token, emp_name, emp_id, password, country, city } = req.body;

    // Validate required fields
    if (!emp_token || !password) {
      return res.status(400).json({
        success: false,
        message: "Employee token and password are required",
      });
    }

    // Check if employee already exists
    const existingEmployee = await EmployeePattern.findOne({ emp_token });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create employee
    const employee = await EmployeePattern.create({
      emp_token,
      emp_name: emp_name || `Employee ${emp_token}`,
      emp_id: emp_id || emp_token,
      password: hashedPassword,
      country: country || "United States",
      city: city || "New York",
      status: 1,
    });

    res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      employee: {
        emp_token: employee.emp_token,
        emp_name: employee.emp_name,
        emp_id: employee.emp_id,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/employees
 * @desc    Get all employees
 * @access  Private
 */
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status !== undefined) query.status = parseInt(status);

    const employees = await EmployeePattern.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/employees/active
 * @desc    Get currently active (logged in) employees
 * @access  Private
 */
router.get("/active", async (req, res) => {
  try {
    // Find login activities without logout timestamp
    const activeLogins = await LoginActivity.find({
      logout_timestamp: null,
      success_status: "Success",
    })
      .sort({ login_timestamp: -1 })
      .lean();

    // Get unique employee tokens
    const employeeTokens = [
      ...new Set(activeLogins.map((l) => l.employee_token)),
    ];

    // Get employee details
    const employees = await EmployeePattern.find({
      emp_token: { $in: employeeTokens },
      status: 1,
    }).lean();

    // Combine data
    const activeEmployees = employees.map((emp) => {
      const login = activeLogins.find(
        (l) => l.employee_token === emp.emp_token
      );
      return {
        ...emp,
        login_time: login?.login_timestamp,
        ip_address: login?.ip_address,
      };
    });

    res.json({
      success: true,
      count: activeEmployees.length,
      employees: activeEmployees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/employees/:token
 * @desc    Get employee details
 * @access  Private
 */
router.get("/:token", async (req, res) => {
  try {
    const employee = await EmployeePattern.findOne({
      emp_token: req.params.token,
    }).lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Get threat statistics
    const threatStats = await ActiveThreat.aggregate([
      { $match: { employee_token: req.params.token } },
      {
        $group: {
          _id: "$solved",
          count: { $sum: 1 },
          totalRisk: { $sum: "$risk_score" },
        },
      },
    ]);

    // Get recent login history
    const recentLogins = await LoginActivity.find({
      employee_token: req.params.token,
    })
      .sort({ login_timestamp: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      employee,
      threatStats,
      recentLogins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   PUT /api/employees/:token
 * @desc    Update employee pattern
 * @access  Private
 */
router.put("/:token", async (req, res) => {
  try {
    const allowedUpdates = [
      "emp_name",
      "location_type",
      "ip_range",
      "usual_login_time",
      "usual_logout_time",
      "country",
      "city",
      "status",
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const employee = await EmployeePattern.findOneAndUpdate(
      { emp_token: req.params.token },
      updates,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
