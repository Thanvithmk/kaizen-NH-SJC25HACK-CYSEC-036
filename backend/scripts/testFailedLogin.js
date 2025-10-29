require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");

const API_URL = "http://localhost:5000/api";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected\n");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

const testFailedLogins = async () => {
  console.log("🧪 Testing Failed Login Recording...\n");

  const LoginActivity = require("../models/LoginActivity");

  // Test scenarios
  const scenarios = [
    {
      name: "Valid format, wrong employee",
      data: { employeeId: "EMP999", password: "wrongpass" },
      expectedResult: "Should create failed login record",
    },
    {
      name: "Correct employee, wrong password",
      data: { employeeId: "EMP001", password: "wrongpassword" },
      expectedResult: "Should create failed login record",
    },
    {
      name: "Invalid format - lowercase",
      data: { employeeId: "emp001", password: "test" },
      expectedResult: "Should create failed login record with normalized token",
    },
    {
      name: "Invalid format - no prefix",
      data: { employeeId: "001", password: "test" },
      expectedResult: "Should create failed login record with EMP001",
    },
  ];

  for (const scenario of scenarios) {
    console.log(`\n📋 Test: ${scenario.name}`);
    console.log(`   Input: ${JSON.stringify(scenario.data)}`);
    console.log(`   Expected: ${scenario.expectedResult}`);

    try {
      // Get count before
      const countBefore = await LoginActivity.countDocuments({});

      // Attempt login
      try {
        await axios.post(`${API_URL}/employees/login`, scenario.data);
        console.log(`   ❌ Login succeeded (should have failed)`);
      } catch (error) {
        if (error.response && error.response.status >= 400) {
          console.log(
            `   ✅ Login failed as expected (${error.response.status})`
          );
        } else {
          throw error;
        }
      }

      // Check if record was created
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for DB write
      const countAfter = await LoginActivity.countDocuments({});

      if (countAfter > countBefore) {
        console.log(`   ✅ Login activity record created!`);

        // Get the latest record
        const latestRecord = await LoginActivity.findOne().sort({
          login_timestamp: -1,
        });
        console.log(`   📊 Record details:`);
        console.log(`      - Employee Token: ${latestRecord.employee_token}`);
        console.log(`      - Status: ${latestRecord.success_status}`);
        console.log(`      - IP: ${latestRecord.ip_address}`);
        console.log(
          `      - Location: ${latestRecord.city}, ${latestRecord.country}`
        );
      } else {
        console.log(`   ❌ NO login activity record created!`);
      }
    } catch (error) {
      console.error(`   ❌ Test failed with error:`, error.message);
    }
  }

  console.log("\n\n📊 Total LoginActivity records in database:");
  const totalRecords = await LoginActivity.countDocuments({});
  const failedRecords = await LoginActivity.countDocuments({
    success_status: "Failed",
  });
  console.log(`   Total: ${totalRecords}`);
  console.log(`   Failed: ${failedRecords}`);
  console.log(`   Success: ${totalRecords - failedRecords}`);

  console.log("\n\n🔍 Recent Failed Logins:");
  const recentFailed = await LoginActivity.find({ success_status: "Failed" })
    .sort({ login_timestamp: -1 })
    .limit(5)
    .lean();

  recentFailed.forEach((record, index) => {
    console.log(`\n   ${index + 1}. ${record.employee_token}`);
    console.log(`      Time: ${record.login_timestamp.toISOString()}`);
    console.log(`      IP: ${record.ip_address}`);
    console.log(`      Location: ${record.city}, ${record.country}`);
  });
};

const run = async () => {
  try {
    console.log("╔════════════════════════════════════════════════╗");
    console.log("║   Failed Login Recording Test                  ║");
    console.log("╚════════════════════════════════════════════════╝\n");

    console.log("⚠️  Make sure the backend server is running on port 5000!\n");

    await connectDB();
    await testFailedLogins();

    console.log("\n\n✨ Test completed!\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
