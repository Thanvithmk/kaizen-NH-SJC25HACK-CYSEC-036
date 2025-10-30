require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");

const BulkDownloadAlert = require("../models/BulkDownloadAlert");
const ActiveThreat = require("../models/ActiveThreat");

async function testFileDownload() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Test employee token
    const employeeToken = "EMP001";
    const testFile = "Employee_Handbook_2024.pdf";

    console.log("=".repeat(60));
    console.log("FILE DOWNLOAD TEST");
    console.log("=".repeat(60));

    // Check current alerts
    console.log("\n📊 BEFORE DOWNLOAD:");
    const beforeAlerts = await BulkDownloadAlert.find({
      employee_token: employeeToken,
    });
    const beforeThreats = await ActiveThreat.find({
      employee_token: employeeToken,
      alert_type: "bulk",
    });
    console.log(`   Bulk Download Alerts: ${beforeAlerts.length}`);
    console.log(`   Active Threats (bulk): ${beforeThreats.length}`);

    // Simulate file download by calling the API
    console.log("\n📥 SIMULATING DOWNLOAD:");
    console.log(`   File: ${testFile}`);
    console.log(`   Employee: ${employeeToken}`);

    try {
      const downloadUrl = `http://localhost:5000/api/files/download/${testFile}?employee_token=${employeeToken}`;
      console.log(`   URL: ${downloadUrl}`);

      const response = await axios.get(downloadUrl, {
        responseType: "stream",
        timeout: 5000,
      });

      console.log(
        `   ✅ API Response: ${response.status} ${response.statusText}`
      );

      // Wait a moment for database writes
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (apiError) {
      if (apiError.code === "ECONNREFUSED") {
        console.log("   ⚠️  Backend server not running!");
        console.log("   Run: cd backend && npm start");
      } else {
        console.log(`   ⚠️  API Error: ${apiError.message}`);
      }
    }

    // Check alerts after download
    console.log("\n📊 AFTER DOWNLOAD:");
    const afterAlerts = await BulkDownloadAlert.find({
      employee_token: employeeToken,
    });
    const afterThreats = await ActiveThreat.find({
      employee_token: employeeToken,
      alert_type: "bulk",
    });

    console.log(
      `   Bulk Download Alerts: ${afterAlerts.length} (${
        afterAlerts.length - beforeAlerts.length > 0
          ? "+" + (afterAlerts.length - beforeAlerts.length)
          : "no change"
      })`
    );
    console.log(
      `   Active Threats (bulk): ${afterThreats.length} (${
        afterThreats.length - beforeThreats.length > 0
          ? "+" + (afterThreats.length - beforeThreats.length)
          : "no change"
      })`
    );

    // Show most recent alert
    if (afterAlerts.length > 0) {
      const latestAlert = afterAlerts[afterAlerts.length - 1];
      console.log("\n📋 LATEST ALERT:");
      console.log(`   ID: ${latestAlert._id}`);
      console.log(`   Employee: ${latestAlert.employee_token}`);
      console.log(`   Files: ${latestAlert.total_files}`);
      console.log(`   Size: ${latestAlert.total_size_mb.toFixed(2)} MB`);
      console.log(`   Risk Level: ${latestAlert.risk_level}`);
      console.log(`   Date: ${latestAlert.alert_date_time}`);

      if (latestAlert.details) {
        console.log(`   Filename: ${latestAlert.details.filename}`);
        console.log(
          `   Cumulative Files: ${latestAlert.details.cumulative_files}`
        );
        console.log(
          `   Cumulative Size: ${latestAlert.details.cumulative_size_mb?.toFixed(
            2
          )} MB`
        );
      }
    }

    // Show most recent threat
    if (afterThreats.length > 0) {
      const latestThreat = afterThreats[afterThreats.length - 1];
      console.log("\n🚨 LATEST THREAT:");
      console.log(`   ID: ${latestThreat._id}`);
      console.log(`   Employee: ${latestThreat.employee_token}`);
      console.log(`   Risk Score: ${latestThreat.risk_score}`);
      console.log(`   Alert Type: ${latestThreat.alert_type}`);
      console.log(`   Solved: ${latestThreat.solved}`);
      console.log(`   Date: ${latestThreat.alert_date_time}`);

      if (latestThreat.details) {
        console.log(`   Total Files: ${latestThreat.details.total_files}`);
        console.log(
          `   Total Size: ${latestThreat.details.total_size_mb?.toFixed(2)} MB`
        );
        console.log(`   Current File: ${latestThreat.details.current_file}`);
        console.log(
          `   Risk Factors: ${latestThreat.details.risk_factors?.join(", ")}`
        );
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Test Complete");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

testFileDownload();
