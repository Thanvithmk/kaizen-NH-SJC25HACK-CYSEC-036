require("dotenv").config();
const mongoose = require("mongoose");
const BulkDownloadAlert = require("../models/BulkDownloadAlert");
const ActiveThreat = require("../models/ActiveThreat");
const EmployeePattern = require("../models/EmployeePattern");
const { evaluateBulkDownload } = require("../utils/ruleEngine");

// MongoDB Connection - use the same as server
const MONGO_URI = process.env.MONGODB_URI;

async function testFileDownloadFlow() {
  try {
    console.log("🧪 Testing File Download Risk Analysis Flow...\n");

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Test employee token
    const testEmployeeToken = "EMP001";

    // Ensure test employee exists
    let employee = await EmployeePattern.findOne({
      emp_token: testEmployeeToken,
    });
    if (!employee) {
      console.log("⚠️  Employee EMP001 not found, creating...");
      employee = await EmployeePattern.create({
        emp_token: testEmployeeToken,
        emp_name: "John Doe",
        password: "$2a$10$hashedpassword",
        typical_login_hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
        typical_locations: ["New York, USA"],
      });
      console.log("✅ Test employee created\n");
    }

    // Test scenarios with different file sizes
    const testScenarios = [
      {
        name: "Small File (Low Risk)",
        filename: "Employee_Handbook_2024.pdf",
        sizeMB: 2.5,
        expectedRisk: "Low",
      },
      {
        name: "Medium File (Medium Risk)",
        filename: "Customer_Database_Report.xlsx",
        sizeMB: 250,
        expectedRisk: "Medium",
      },
      {
        name: "Large File (High Risk)",
        filename: "Payroll_Records_2024.xlsx",
        sizeMB: 1200,
        expectedRisk: "High/Critical",
      },
      {
        name: "Huge File (Critical Risk)",
        filename: "Backup_Database_Full.zip",
        sizeMB: 5000,
        expectedRisk: "Critical",
      },
    ];

    for (const scenario of testScenarios) {
      console.log(`\n📦 Testing: ${scenario.name}`);
      console.log(`   File: ${scenario.filename}`);
      console.log(`   Size: ${scenario.sizeMB} MB`);
      console.log(`   Expected Risk: ${scenario.expectedRisk}\n`);

      // 1. Create BulkDownloadAlert record
      const downloadAlert = await BulkDownloadAlert.create({
        employee_token: testEmployeeToken,
        folder_path: `/datafiles/${scenario.filename}`,
        total_files: 1,
        total_size_mb: scenario.sizeMB,
        timestamp: new Date(),
        risk_level:
          scenario.sizeMB >= 1000
            ? "Critical"
            : scenario.sizeMB >= 500
            ? "High"
            : scenario.sizeMB >= 200
            ? "Medium"
            : "Low",
      });

      console.log(`   ✅ BulkDownloadAlert created:`);
      console.log(`      ID: ${downloadAlert._id}`);
      console.log(`      Risk Level: ${downloadAlert.risk_level}`);
      console.log(`      Total Size: ${downloadAlert.total_size_mb} MB`);

      // 2. Evaluate risk using Rule Engine
      const riskAnalysis = evaluateBulkDownload(downloadAlert, employee);

      console.log(`\n   📊 Rule Engine Analysis:`);
      console.log(`      Risk Score: ${riskAnalysis.total_risk_score}`);
      console.log(`      Severity: ${riskAnalysis.severity}`);
      console.log(`      Anomalies Detected:`);
      riskAnalysis.anomalies_detected.forEach((anomaly) => {
        console.log(`         - ${anomaly}`);
      });

      // 3. Create ActiveThreat if risk is significant
      if (riskAnalysis.total_risk_score > 30) {
        const threat = await ActiveThreat.create({
          employee_token: testEmployeeToken,
          alert_type: "bulk",
          risk_score: riskAnalysis.total_risk_score,
          original_alert_id: downloadAlert._id,
          alert_date_time: new Date(),
          solved: "N",
          details: {
            file_count: 1,
            total_size_mb: scenario.sizeMB,
            filename: scenario.filename,
            anomalies: riskAnalysis.anomalies_detected,
            severity_level: riskAnalysis.severity,
          },
        });

        console.log(`\n   🚨 ActiveThreat created:`);
        console.log(`      Threat ID: ${threat._id}`);
        console.log(`      Risk Score: ${threat.risk_score}`);
        console.log(`      Alert Type: ${threat.alert_type}`);
        console.log(`      Solved: ${threat.solved}`);
      } else {
        console.log(`\n   ✅ No threat created (risk score below threshold)`);
      }

      console.log(`\n   ${"=".repeat(60)}`);
    }

    // Display summary from database
    console.log(`\n\n📊 DATABASE SUMMARY:`);
    console.log(`${"=".repeat(60)}\n`);

    const totalAlerts = await BulkDownloadAlert.countDocuments({
      employee_token: testEmployeeToken,
    });
    const totalThreats = await ActiveThreat.countDocuments({
      employee_token: testEmployeeToken,
      alert_type: "bulk",
      solved: "N",
    });

    console.log(`   Total BulkDownloadAlerts: ${totalAlerts}`);
    console.log(`   Total ActiveThreats: ${totalThreats}`);

    // Show recent alerts
    const recentAlerts = await BulkDownloadAlert.find({
      employee_token: testEmployeeToken,
    })
      .sort({ timestamp: -1 })
      .limit(5);

    console.log(`\n   Recent Download Alerts:`);
    recentAlerts.forEach((alert, index) => {
      console.log(
        `      ${index + 1}. ${alert.total_size_mb} MB - Risk: ${
          alert.risk_level
        }`
      );
    });

    // Show recent threats
    const recentThreats = await ActiveThreat.find({
      employee_token: testEmployeeToken,
      alert_type: "bulk",
    })
      .sort({ alert_date_time: -1 })
      .limit(5);

    console.log(`\n   Recent Active Threats:`);
    recentThreats.forEach((threat, index) => {
      console.log(
        `      ${index + 1}. Risk Score: ${threat.risk_score} - Details: ${
          threat.details?.filename || "N/A"
        }`
      );
    });

    console.log(`\n\n✨ Test completed successfully!\n`);
  } catch (error) {
    console.error("❌ Error during test:", error);
  } finally {
    await mongoose.connection.close();
    console.log("📊 MongoDB connection closed");
  }
}

// Run the test
testFileDownloadFlow();
