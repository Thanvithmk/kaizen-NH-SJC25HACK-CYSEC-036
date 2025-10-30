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
 * @desc    Get recent activity (logins, downloads, geo alerts)
 * @access  Private
 */
router.get("/recent-activity", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Fetch login activities
    const loginActivities = await LoginActivity.find()
      .sort({ login_timestamp: -1 })
      .limit(limit)
      .lean();

    // Fetch bulk download alerts
    const bulkDownloads = await BulkDownloadAlert.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Fetch geographic alerts
    const geoAlerts = await GeographicAlert.find()
      .sort({ alert_timestamp: -1 })
      .limit(limit)
      .lean();

    // Normalize and combine all activities
    const allActivities = [];

    // Add login activities
    for (const activity of loginActivities) {
      const employee = await EmployeePattern.findOne({
        emp_token: activity.employee_token,
      });
      allActivities.push({
        _id: activity._id,
        activity_type: "login",
        employee_token: activity.employee_token,
        employee_name: employee?.emp_name || "Unknown",
        timestamp: activity.login_timestamp,
        status: activity.success_status,
        ip_address: activity.ip_address,
        location: activity.location,
        city: activity.city,
        country: activity.country,
        details: {
          logout_timestamp: activity.logout_timestamp,
        },
      });
    }

    // Add bulk download activities
    for (const download of bulkDownloads) {
      const employee = await EmployeePattern.findOne({
        emp_token: download.employee_token,
      });
      allActivities.push({
        _id: download._id,
        activity_type: "bulk_download",
        employee_token: download.employee_token,
        employee_name: employee?.emp_name || "Unknown",
        timestamp: download.timestamp,
        status: download.risk_level,
        ip_address: "N/A",
        location: "File Download",
        city: "N/A",
        country: "N/A",
        details: {
          total_files: download.total_files,
          total_size_mb: download.total_size_mb,
          folder_path: download.folder_path,
          risk_level: download.risk_level,
        },
      });
    }

    // Add geographic alerts
    for (const geoAlert of geoAlerts) {
      const employee = await EmployeePattern.findOne({
        emp_token: geoAlert.employee_token,
      });
      allActivities.push({
        _id: geoAlert._id,
        activity_type: "geographic",
        employee_token: geoAlert.employee_token,
        employee_name: employee?.emp_name || "Unknown",
        timestamp: geoAlert.alert_timestamp,
        status: geoAlert.is_impossible_travel
          ? "Impossible Travel"
          : geoAlert.is_high_risk_country
          ? "Risk Country"
          : "Location Change",
        ip_address: "N/A",
        location: geoAlert.current_location?.city || "Unknown",
        city: geoAlert.current_location?.city || "Unknown",
        country: geoAlert.current_location?.country || "Unknown",
        details: {
          previous_location: geoAlert.previous_location,
          distance_km: geoAlert.distance_km,
          is_impossible_travel: geoAlert.is_impossible_travel,
        },
      });
    }

    // Sort all activities by timestamp (most recent first)
    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit to requested number
    const limitedActivities = allActivities.slice(0, limit);

    res.json({
      success: true,
      activity: limitedActivities,
      total: allActivities.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
