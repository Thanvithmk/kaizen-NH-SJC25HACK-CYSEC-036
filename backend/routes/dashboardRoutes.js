const express = require("express");
const router = express.Router();
const LoginActivity = require("../models/LoginActivity");
const ActiveThreat = require("../models/ActiveThreat");
const BulkDownloadAlert = require("../models/BulkDownloadAlert");
const GeographicAlert = require("../models/GeographicAlert");
const EmployeePattern = require("../models/EmployeePattern");

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get("/stats", async (req, res) => {
  try {
    // Active users (unique employees currently logged in)
    const activeUsersResult = await LoginActivity.distinct("employee_token", {
      logout_timestamp: null,
      success_status: "Success",
    });
    const activeUsers = activeUsersResult.length;

    // Active threats (unsolved)
    const activeThreats = await ActiveThreat.countDocuments({
      solved: "N",
    });

    // Solved threats
    const solvedThreats = await ActiveThreat.countDocuments({
      solved: "Y",
    });

    // Total employees
    const totalEmployees = await EmployeePattern.countDocuments({
      status: 1,
    });

    // Recent alerts (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlertsCount = await ActiveThreat.countDocuments({
      alert_date_time: { $gte: last24Hours },
    });

    // High risk alerts (score >= 50)
    const highRiskAlerts = await ActiveThreat.countDocuments({
      risk_score: { $gte: 50 },
      solved: "N",
    });

    // Medium risk alerts (25 <= score < 50)
    const mediumRiskAlerts = await ActiveThreat.countDocuments({
      risk_score: { $gte: 25, $lt: 50 },
      solved: "N",
    });

    // Low risk alerts (score < 25)
    const lowRiskAlerts = await ActiveThreat.countDocuments({
      risk_score: { $lt: 25 },
      solved: "N",
    });

    // Alert type distribution
    const alertDistribution = await ActiveThreat.aggregate([
      { $match: { solved: "N" } },
      { $group: { _id: "$alert_type", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        activeUsers,
        activeThreats,
        solvedThreats,
        totalEmployees,
        recentAlertsCount,
        highRiskAlerts,
        mediumRiskAlerts,
        lowRiskAlerts,
        systemStatus: "Online",
        lastUpdated: new Date(),
      },
      alertDistribution: alertDistribution.map((item) => ({
        type: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/dashboard/high-risk-employees
 * @desc    Get top high-risk employees
 * @access  Private
 */
router.get("/high-risk-employees", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Aggregate threats by employee
    const highRiskEmployees = await ActiveThreat.aggregate([
      { $match: { solved: "N" } },
      {
        $group: {
          _id: "$employee_token",
          totalRiskScore: { $sum: "$risk_score" },
          threatCount: { $sum: 1 },
          maxRiskScore: { $max: "$risk_score" },
          alertTypes: { $addToSet: "$alert_type" },
        },
      },
      { $sort: { totalRiskScore: -1 } },
      { $limit: limit },
    ]);

    // Get employee details
    const enrichedEmployees = await Promise.all(
      highRiskEmployees.map(async (emp) => {
        const employee = await EmployeePattern.findOne({ emp_token: emp._id });
        return {
          employee_token: emp._id,
          employee_name: employee?.emp_name || "Unknown",
          total_risk_score: emp.totalRiskScore,
          threat_count: emp.threatCount,
          max_risk_score: emp.maxRiskScore,
          alert_types: emp.alertTypes,
        };
      })
    );

    res.json({
      success: true,
      employees: enrichedEmployees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Get recent login activity
 * @access  Private
 */
router.get("/recent-activity", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentActivity = await LoginActivity.find()
      .sort({ login_timestamp: -1 })
      .limit(limit)
      .lean();

    // Enrich with employee names
    const enrichedActivity = await Promise.all(
      recentActivity.map(async (activity) => {
        const employee = await EmployeePattern.findOne({
          emp_token: activity.employee_token,
        });
        return {
          ...activity,
          employee_name: employee?.emp_name || "Unknown",
        };
      })
    );

    res.json({
      success: true,
      activity: enrichedActivity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
