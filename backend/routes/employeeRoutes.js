const express = require("express");
const router = express.Router();
const EmployeePattern = require("../models/EmployeePattern");
const LoginActivity = require("../models/LoginActivity");
const ActiveThreat = require("../models/ActiveThreat");

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

