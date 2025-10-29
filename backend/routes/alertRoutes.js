const express = require("express");
const router = express.Router();
const ActiveThreat = require("../models/ActiveThreat");
const BulkDownloadAlert = require("../models/BulkDownloadAlert");
const GeographicAlert = require("../models/GeographicAlert");
const LoginActivity = require("../models/LoginActivity");
const EmployeePattern = require("../models/EmployeePattern");

/**
 * @route   GET /api/alerts
 * @desc    Get all alerts with filters
 * @access  Private
 */
router.get("/", async (req, res) => {
  try {
    const {
      alert_type,
      solved,
      employee_token,
      risk_level,
      limit = 50,
      skip = 0,
    } = req.query;

    // Build query
    const query = {};
    if (alert_type) query.alert_type = alert_type;
    if (solved) query.solved = solved;
    if (employee_token) query.employee_token = employee_token;
    if (risk_level) {
      // Map risk level to score ranges
      const riskScoreMap = {
        Critical: { $gte: 75 },
        High: { $gte: 50, $lt: 75 },
        Medium: { $gte: 25, $lt: 50 },
        Low: { $lt: 25 },
      };
      if (riskScoreMap[risk_level]) {
        query.risk_score = riskScoreMap[risk_level];
      }
    }

    // Get alerts
    const alerts = await ActiveThreat.find(query)
      .sort({ alert_date_time: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    // Get total count
    const totalCount = await ActiveThreat.countDocuments(query);

    // Enrich with employee details
    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        const employee = await EmployeePattern.findOne({
          emp_token: alert.employee_token,
        });

        // Determine risk level from score
        let riskLevel = "Low";
        if (alert.risk_score >= 75) riskLevel = "Critical";
        else if (alert.risk_score >= 50) riskLevel = "High";
        else if (alert.risk_score >= 25) riskLevel = "Medium";

        return {
          ...alert,
          employee_name: employee?.emp_name || "Unknown",
          risk_level: riskLevel,
        };
      })
    );

    res.json({
      success: true,
      count: enrichedAlerts.length,
      total: totalCount,
      alerts: enrichedAlerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/alerts/:id
 * @desc    Get specific alert details
 * @access  Private
 */
router.get("/:id", async (req, res) => {
  try {
    const alert = await ActiveThreat.findById(req.params.id).lean();

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // Get original alert details
    let originalAlert = null;
    if (alert.alert_type === "bulk") {
      originalAlert = await BulkDownloadAlert.findById(alert.original_alert_id);
    } else if (alert.alert_type === "geo") {
      originalAlert = await GeographicAlert.findById(alert.original_alert_id);
    } else if (alert.alert_type === "login") {
      originalAlert = await LoginActivity.findById(alert.original_alert_id);
    }

    // Get employee details
    const employee = await EmployeePattern.findOne({
      emp_token: alert.employee_token,
    });

    res.json({
      success: true,
      alert: {
        ...alert,
        employee_name: employee?.emp_name || "Unknown",
        original_alert: originalAlert,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   PUT/PATCH /api/alerts/:id/solve
 * @desc    Mark alert as solved
 * @access  Private
 */
const markAsSolved = async (req, res) => {
  try {
    const alert = await ActiveThreat.findByIdAndUpdate(
      req.params.id,
      {
        solved: "Y",
        last_reviewed: new Date(),
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.json({
      success: true,
      message: "Alert marked as solved",
      alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

router.put("/:id/solve", markAsSolved);
router.patch("/:id/solve", markAsSolved);

/**
 * @route   DELETE /api/alerts/:id
 * @desc    Delete alert
 * @access  Private
 */
router.delete("/:id", async (req, res) => {
  try {
    const alert = await ActiveThreat.findByIdAndDelete(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
