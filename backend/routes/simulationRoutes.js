const express = require("express");
const router = express.Router();
const LoginActivity = require("../models/LoginActivity");
const BulkDownloadAlert = require("../models/BulkDownloadAlert");
const GeographicAlert = require("../models/GeographicAlert");
const ActiveThreat = require("../models/ActiveThreat");
const EmployeePattern = require("../models/EmployeePattern");
const {
  evaluateLoginActivity,
  evaluateBulkDownload,
  evaluateGeographicAnomaly,
} = require("../utils/ruleEngine");

// Simulate Login Threat
router.post("/login-threat", async (req, res) => {
  try {
    const {
      employee_token,
      threat_type, // "failed_attempts", "odd_hours", "rapid_succession"
      severity = "Medium",
    } = req.body;

    // Find or create employee pattern
    let employeePattern = await EmployeePattern.findOne({ employee_token });
    if (!employeePattern) {
      employeePattern = await EmployeePattern.create({
        employee_token,
        employee_name: `Employee ${employee_token}`,
        department: "Demo Department",
        typical_login_hours: { start: 9, end: 17 },
        typical_locations: [{ country: "United States", city: "New York" }],
        risk_score: 0,
        alert_count: 0,
      });
    }

    // Create login activity based on threat type
    const loginData = {
      employee_token,
      ip_address: generateRandomIP(),
      login_timestamp: new Date(),
      location: {
        country: "United States",
        city: "New York",
        latitude: 40.7128,
        longitude: -74.006,
      },
      success_status: "Success",
    };

    if (threat_type === "failed_attempts") {
      loginData.success_status = "Failed";
      loginData.failure_reason = "Invalid credentials";
    } else if (threat_type === "odd_hours") {
      const oddHour = new Date();
      oddHour.setHours(2, 30, 0); // 2:30 AM
      loginData.login_timestamp = oddHour;
    } else if (threat_type === "rapid_succession") {
      // Create multiple rapid logins
      for (let i = 0; i < 5; i++) {
        const rapidLogin = { ...loginData };
        rapidLogin.login_timestamp = new Date(Date.now() + i * 1000);
        await LoginActivity.create(rapidLogin);
      }
    }

    const loginActivity = await LoginActivity.create(loginData);

    // Evaluate and create alert
    const riskAnalysis = evaluateLoginActivity(loginActivity, employeePattern);

    if (riskAnalysis.total_risk_score > 30) {
      const threat = await ActiveThreat.create({
        employee_token,
        threat_type: "Login Anomaly",
        severity_level: riskAnalysis.severity,
        risk_score: riskAnalysis.total_risk_score,
        detected_at: new Date(),
        alert_date_time: new Date(),
        details: {
          ip_address: loginData.ip_address,
          location: loginData.location,
          anomalies: riskAnalysis.anomalies_detected,
          success_status: loginData.success_status,
        },
        status: "Active",
        is_resolved: false,
      });

      // Update employee pattern
      employeePattern.risk_score += riskAnalysis.total_risk_score;
      employeePattern.alert_count += 1;
      await employeePattern.save();

      // Emit real-time update via Socket.IO
      const io = req.app.get("io");
      if (io) {
        io.emit("new_threat", threat);
      }

      return res.status(201).json({
        success: true,
        message: "Login threat simulated successfully",
        threat,
        loginActivity,
      });
    }

    res.json({
      success: true,
      message: "Login activity created (no threat detected)",
      loginActivity,
    });
  } catch (error) {
    console.error("Error simulating login threat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to simulate login threat",
      error: error.message,
    });
  }
});

// Simulate Bulk Download Threat
router.post("/bulk-download-threat", async (req, res) => {
  try {
    const {
      employee_token,
      threat_type, // "large_files", "many_files", "odd_hours"
      severity = "High",
    } = req.body;

    let employeePattern = await EmployeePattern.findOne({ employee_token });
    if (!employeePattern) {
      employeePattern = await EmployeePattern.create({
        employee_token,
        employee_name: `Employee ${employee_token}`,
        department: "Demo Department",
        typical_download_size: 50, // MB
        typical_download_count: 10,
        risk_score: 0,
        alert_count: 0,
      });
    }

    const downloadData = {
      employee_token,
      file_path: "C:\\Users\\Demo\\Downloads",
      file_count: 15,
      total_size_mb: 150,
      download_timestamp: new Date(),
      file_types: [".pdf", ".docx", ".xlsx"],
      is_sensitive: true,
    };

    if (threat_type === "large_files") {
      downloadData.total_size_mb = 5000; // 5 GB
      downloadData.file_count = 10;
    } else if (threat_type === "many_files") {
      downloadData.file_count = 500;
      downloadData.total_size_mb = 500;
    } else if (threat_type === "odd_hours") {
      const oddHour = new Date();
      oddHour.setHours(3, 0, 0); // 3:00 AM
      downloadData.download_timestamp = oddHour;
      downloadData.total_size_mb = 2000;
    }

    const bulkDownload = await BulkDownloadAlert.create(downloadData);

    // Evaluate risk
    const riskAnalysis = evaluateBulkDownload(bulkDownload, employeePattern);

    if (riskAnalysis.total_risk_score > 30) {
      const threat = await ActiveThreat.create({
        employee_token,
        threat_type: "Bulk Download",
        severity_level: riskAnalysis.severity,
        risk_score: riskAnalysis.total_risk_score,
        detected_at: new Date(),
        alert_date_time: new Date(),
        details: {
          file_count: downloadData.file_count,
          total_size_mb: downloadData.total_size_mb,
          file_path: downloadData.file_path,
          anomalies: riskAnalysis.anomalies_detected,
          is_sensitive: downloadData.is_sensitive,
        },
        status: "Active",
        is_resolved: false,
      });

      employeePattern.risk_score += riskAnalysis.total_risk_score;
      employeePattern.alert_count += 1;
      await employeePattern.save();

      const io = req.app.get("io");
      if (io) {
        io.emit("new_threat", threat);
      }

      return res.status(201).json({
        success: true,
        message: "Bulk download threat simulated successfully",
        threat,
        bulkDownload,
      });
    }

    res.json({
      success: true,
      message: "Bulk download created (no threat detected)",
      bulkDownload,
    });
  } catch (error) {
    console.error("Error simulating bulk download threat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to simulate bulk download threat",
      error: error.message,
    });
  }
});

// Simulate Geographic Threat
router.post("/geographic-threat", async (req, res) => {
  try {
    const {
      employee_token,
      threat_type, // "impossible_travel", "high_risk_country", "new_location"
      severity = "Critical",
    } = req.body;

    let employeePattern = await EmployeePattern.findOne({ employee_token });
    if (!employeePattern) {
      employeePattern = await EmployeePattern.create({
        employee_token,
        employee_name: `Employee ${employee_token}`,
        department: "Demo Department",
        typical_locations: [
          {
            country: "United States",
            city: "New York",
            latitude: 40.7128,
            longitude: -74.006,
          },
        ],
        risk_score: 0,
        alert_count: 0,
      });
    }

    // Define threat locations
    const threatLocations = {
      impossible_travel: {
        current_location: {
          country: "China",
          city: "Beijing",
          latitude: 39.9042,
          longitude: 116.4074,
        },
        previous_location: {
          country: "United States",
          city: "New York",
          latitude: 40.7128,
          longitude: -74.006,
        },
      },
      high_risk_country: {
        current_location: {
          country: "North Korea",
          city: "Pyongyang",
          latitude: 39.0392,
          longitude: 125.7625,
        },
        previous_location: employeePattern.typical_locations[0] || {
          country: "United States",
          city: "New York",
        },
      },
      new_location: {
        current_location: {
          country: "Russia",
          city: "Moscow",
          latitude: 55.7558,
          longitude: 37.6173,
        },
        previous_location: employeePattern.typical_locations[0] || {
          country: "United States",
          city: "New York",
        },
      },
    };

    const locationData =
      threatLocations[threat_type] || threatLocations.impossible_travel;

    const geoAlert = await GeographicAlert.create({
      employee_token,
      current_location: locationData.current_location,
      previous_location: locationData.previous_location,
      time_difference_hours: 0.5, // 30 minutes
      distance_km: threat_type === "impossible_travel" ? 11000 : 5000,
      travel_speed_kmh: threat_type === "impossible_travel" ? 22000 : 1000,
      is_impossible_travel: threat_type === "impossible_travel",
      is_high_risk_country: threat_type === "high_risk_country",
      alert_timestamp: new Date(),
      ip_address: generateRandomIP(),
    });

    // Evaluate risk
    const riskAnalysis = evaluateGeographicAnomaly(geoAlert, employeePattern);

    if (riskAnalysis.total_risk_score > 30) {
      const threat = await ActiveThreat.create({
        employee_token,
        threat_type: "Geographic Anomaly",
        severity_level: riskAnalysis.severity,
        risk_score: riskAnalysis.total_risk_score,
        detected_at: new Date(),
        alert_date_time: new Date(),
        details: {
          current_location: locationData.current_location,
          previous_location: locationData.previous_location,
          distance_km: geoAlert.distance_km,
          travel_speed_kmh: geoAlert.travel_speed_kmh,
          is_impossible_travel: geoAlert.is_impossible_travel,
          is_high_risk_country: geoAlert.is_high_risk_country,
          anomalies: riskAnalysis.anomalies_detected,
        },
        status: "Active",
        is_resolved: false,
      });

      employeePattern.risk_score += riskAnalysis.total_risk_score;
      employeePattern.alert_count += 1;
      await employeePattern.save();

      const io = req.app.get("io");
      if (io) {
        io.emit("new_threat", threat);
      }

      return res.status(201).json({
        success: true,
        message: "Geographic threat simulated successfully",
        threat,
        geoAlert,
      });
    }

    res.json({
      success: true,
      message: "Geographic alert created (no threat detected)",
      geoAlert,
    });
  } catch (error) {
    console.error("Error simulating geographic threat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to simulate geographic threat",
      error: error.message,
    });
  }
});

// Get simulation statistics
router.get("/stats", async (req, res) => {
  try {
    const totalThreats = await ActiveThreat.countDocuments();
    const loginThreats = await ActiveThreat.countDocuments({
      threat_type: "Login Anomaly",
    });
    const bulkDownloadThreats = await ActiveThreat.countDocuments({
      threat_type: "Bulk Download",
    });
    const geoThreats = await ActiveThreat.countDocuments({
      threat_type: "Geographic Anomaly",
    });

    res.json({
      success: true,
      stats: {
        total: totalThreats,
        login: loginThreats,
        bulkDownload: bulkDownloadThreats,
        geographic: geoThreats,
      },
    });
  } catch (error) {
    console.error("Error fetching simulation stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
});

// Helper function to generate random IP
function generateRandomIP() {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(
    Math.random() * 256
  )}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

module.exports = router;
