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

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Invalid employee ID or password",
      });
    }

    // Check if employee is active
    if (employee.status !== 1) {
      return res.status(403).json({
        success: false,
        message: "Employee account is inactive",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.password);

    const loginData = {
      employee_token: employee.emp_token,
      ip_address: ip_address || "127.0.0.1",
      login_timestamp: new Date(),
      location: location || {
        country: employee.country || "Unknown",
        city: employee.city || "Unknown",
        latitude: 0,
        longitude: 0,
      },
      success_status: isPasswordValid ? "Success" : "Failed",
      failure_reason: isPasswordValid ? null : "Invalid credentials",
    };

    // Create login activity record
    const loginActivity = await LoginActivity.create(loginData);

    if (!isPasswordValid) {
      // Count recent failed attempts (last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentFailedAttempts = await LoginActivity.countDocuments({
        employee_token: employee.emp_token,
        success_status: "Failed",
        login_timestamp: { $gte: thirtyMinutesAgo },
      });

      // Calculate risk level based on failed attempts
      let riskScore = 0;
      let severityLevel = "Low";
      const anomalies = [];

      if (recentFailedAttempts >= 5) {
        riskScore = 70;
        severityLevel = "High";
        anomalies.push(
          `Critical: ${recentFailedAttempts} failed login attempts in 30 minutes`
        );
      } else if (recentFailedAttempts >= 3) {
        riskScore = 50;
        severityLevel = "Medium";
        anomalies.push(
          `Warning: ${recentFailedAttempts} failed login attempts in 30 minutes`
        );
      } else if (recentFailedAttempts >= 2) {
        riskScore = 30;
        severityLevel = "Low";
        anomalies.push(`${recentFailedAttempts} failed login attempts`);
      }

      // Create threat alert if risk is significant
      if (riskScore >= 30) {
        const threat = await ActiveThreat.create({
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

        // Emit real-time update via Socket.IO
        const io = req.app.get("io");
        if (io) {
          io.emit("new_threat", threat);
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

    // Emit successful login
    const io = req.app.get("io");
    if (io) {
      io.emit("new_threat", threat);
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
