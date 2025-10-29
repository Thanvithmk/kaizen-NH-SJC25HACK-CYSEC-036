const express = require("express");
const router = express.Router();
const EmployeePattern = require("../models/EmployeePattern");
const LoginActivity = require("../models/LoginActivity");
const ActiveThreat = require("../models/ActiveThreat");
const bcrypt = require("bcryptjs");

/**
 * @route   POST /api/employees/login
 * @desc    Employee login with off-hours detection
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { employeeId, password, ip_address } = req.body;

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

    // Mock location data
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
      return res.status(404).json({
        success: false,
        message: "Invalid employee ID or password",
      });
    }

    if (employee.status !== 1) {
      return res.status(403).json({
        success: false,
        message: "Employee account is inactive",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid employee ID or password",
      });
    }

    // Create login activity record
    const loginData = {
      employee_token: employee.emp_token,
      ip_address: ip_address || req.ip || "127.0.0.1",
      login_timestamp: new Date(),
      city: randomLocation.city,
      country: randomLocation.country,
      location: randomLocation.location,
      success_status: "Success",
    };

    const loginActivity = await LoginActivity.create(loginData);
    console.log(`✅ Login successful for ${employee.emp_token}`);

    // Check if login is during off-hours
    const loginHour = loginActivity.login_timestamp.getHours();
    const loginMinute = loginActivity.login_timestamp.getMinutes();
    const loginTimeInMinutes = loginHour * 60 + loginMinute;

    // Parse employee's usual hours (format: "HH:MM")
    const [usualLoginHour, usualLoginMinute] = (
      employee.usual_login_time || "09:00"
    )
      .split(":")
      .map(Number);
    const [usualLogoutHour, usualLogoutMinute] = (
      employee.usual_logout_time || "17:00"
    )
      .split(":")
      .map(Number);

    const usualStartTime = usualLoginHour * 60 + usualLoginMinute;
    const usualEndTime = usualLogoutHour * 60 + usualLogoutMinute;

    // Check if login is outside usual hours (with 1 hour buffer)
    const bufferMinutes = 60; // 1 hour grace period
    const isOffHours =
      loginTimeInMinutes < usualStartTime - bufferMinutes ||
      loginTimeInMinutes > usualEndTime + bufferMinutes;

    let riskScore = 5;
    let severityLevel = "Low";
    let anomalies = ["Normal login activity"];

    if (isOffHours) {
      // Off-hours login detected - Medium risk
      riskScore = 40;
      severityLevel = "Medium";
      anomalies = [
        `Login outside usual hours: ${loginHour
          .toString()
          .padStart(2, "0")}:${loginMinute.toString().padStart(2, "0")}`,
        `Expected hours: ${employee.usual_login_time} - ${employee.usual_logout_time}`,
      ];
      console.log(
        `⚠️  Off-hours login detected for ${employee.emp_token} at ${loginHour}:${loginMinute}`
      );
    }

    // Create threat (low risk for normal, medium for off-hours)
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
        success_status: "Success",
        severity_level: severityLevel,
        login_time: `${loginHour.toString().padStart(2, "0")}:${loginMinute
          .toString()
          .padStart(2, "0")}`,
        is_off_hours: isOffHours,
      },
    });

    // Emit alert (more prominent for off-hours)
    if (global.emitAlert) {
      global.emitAlert({
        type: "login",
        threat,
        message: isOffHours
          ? `⚠️ Off-hours login: ${employee.emp_name} at ${loginHour}:${loginMinute}`
          : `Successful login: ${employee.emp_name}`,
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
      isOffHours: isOffHours,
      riskLevel: severityLevel,
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
