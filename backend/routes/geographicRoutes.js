const express = require("express");
const router = express.Router();
const GeographicAlert = require("../models/GeographicAlert");
const EmployeePattern = require("../models/EmployeePattern");
const ActiveThreat = require("../models/ActiveThreat");

/**
 * @route   GET /api/geographic/overview
 * @desc    Get geographic overview for map visualization
 * @access  Private
 */
router.get("/overview", async (req, res) => {
  try {
    // Get all geographic alerts
    const geoAlerts = await GeographicAlert.find()
      .sort({ alert_timestamp: -1 })
      .limit(100)
      .lean();

    // Group by country
    const countryDistribution = await GeographicAlert.aggregate([
      {
        $group: {
          _id: "$current_country",
          count: { $sum: 1 },
          cities: { $addToSet: "$current_city" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get high-risk countries
    const riskCountries = await GeographicAlert.aggregate([
      { $match: { risk_level: { $in: ["High", "Critical"] } } },
      {
        $group: {
          _id: "$current_country",
          alertCount: { $sum: 1 },
          maxRiskLevel: { $max: "$risk_level" },
        },
      },
      { $sort: { alertCount: -1 } },
    ]);

    // Get active employee locations
    const activeEmployees = await EmployeePattern.find({ status: 1 })
      .select("emp_token country city")
      .lean();

    res.json({
      success: true,
      overview: {
        totalAlerts: geoAlerts.length,
        countryDistribution,
        riskCountries,
        activeEmployeeLocations: activeEmployees,
        recentAlerts: geoAlerts.slice(0, 10),
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
 * @route   GET /api/geographic/alerts
 * @desc    Get geographic alerts with filters
 * @access  Private
 */
router.get("/alerts", async (req, res) => {
  try {
    const { anomaly_type, verified, employee_token } = req.query;

    const query = {};
    if (anomaly_type) query.anomaly_type = anomaly_type;
    if (verified) query.verified = verified;
    if (employee_token) query.employee_token = employee_token;

    const alerts = await GeographicAlert.find(query)
      .sort({ alert_timestamp: -1 })
      .limit(50)
      .lean();

    // Enrich with employee names
    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        const employee = await EmployeePattern.findOne({
          emp_token: alert.employee_token,
        });
        return {
          ...alert,
          employee_name: employee?.emp_name || "Unknown",
        };
      })
    );

    res.json({
      success: true,
      count: enrichedAlerts.length,
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
 * @route   PUT /api/geographic/:id/verify
 * @desc    Verify geographic alert
 * @access  Private
 */
router.put("/:id/verify", async (req, res) => {
  try {
    const { verified } = req.body; // 'Yes' or 'No'

    if (!["Yes", "No"].includes(verified)) {
      return res.status(400).json({
        success: false,
        message: 'Verified must be "Yes" or "No"',
      });
    }

    const alert = await GeographicAlert.findByIdAndUpdate(
      req.params.id,
      { verified },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // If verified as legitimate, mark corresponding threat as solved
    if (verified === "Yes") {
      await ActiveThreat.updateOne(
        { original_alert_id: alert._id, alert_type: "geo" },
        { solved: "Y", last_reviewed: new Date() }
      );
    }

    res.json({
      success: true,
      message: "Alert verified successfully",
      alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;

