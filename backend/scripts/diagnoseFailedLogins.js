require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
    return true;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    return false;
  }
};

const diagnose = async () => {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║   Failed Login Diagnostic Tool                 ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  // Check 1: MongoDB Connection
  console.log("1️⃣  Checking MongoDB Connection...");
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.log("   ⛔ Cannot proceed without database connection\n");
    process.exit(1);
  }
  console.log();

  // Check 2: LoginActivity Model
  console.log("2️⃣  Checking LoginActivity Model...");
  try {
    const LoginActivity = require("../models/LoginActivity");
    console.log("   ✅ LoginActivity model loaded");

    const schema = LoginActivity.schema.paths.employee_token;
    console.log(`   📋 employee_token validation: ${schema.options.match}`);
    console.log(`   📋 employee_token required: ${schema.isRequired}`);
  } catch (error) {
    console.log(`   ❌ Error loading model: ${error.message}`);
  }
  console.log();

  // Check 3: Existing Records
  console.log("3️⃣  Checking Existing Login Records...");
  try {
    const LoginActivity = require("../models/LoginActivity");

    const totalCount = await LoginActivity.countDocuments({});
    const successCount = await LoginActivity.countDocuments({
      success_status: "Success",
    });
    const failedCount = await LoginActivity.countDocuments({
      success_status: "Failed",
    });

    console.log(`   📊 Total records: ${totalCount}`);
    console.log(`   ✅ Successful logins: ${successCount}`);
    console.log(`   ❌ Failed logins: ${failedCount}`);

    if (failedCount === 0) {
      console.log(`   ⚠️  NO failed login records found!`);
    }
  } catch (error) {
    console.log(`   ❌ Error querying database: ${error.message}`);
  }
  console.log();

  // Check 4: Recent Activity
  console.log("4️⃣  Checking Recent Login Activity...");
  try {
    const LoginActivity = require("../models/LoginActivity");

    const recentLogins = await LoginActivity.find()
      .sort({ login_timestamp: -1 })
      .limit(5)
      .lean();

    if (recentLogins.length === 0) {
      console.log(`   ⚠️  No login records found at all`);
    } else {
      console.log(`   📋 Last ${recentLogins.length} login attempts:\n`);
      recentLogins.forEach((login, index) => {
        console.log(
          `   ${index + 1}. ${login.employee_token} - ${login.success_status}`
        );
        console.log(`      Time: ${login.login_timestamp.toISOString()}`);
        console.log(`      IP: ${login.ip_address || "N/A"}`);
        console.log(
          `      Location: ${login.city || "N/A"}, ${login.country || "N/A"}\n`
        );
      });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Check 5: Test Token Validation
  console.log("5️⃣  Testing Token Format Validation...");
  try {
    const testTokens = [
      { token: "EMP001", expected: "valid" },
      { token: "emp001", expected: "invalid (lowercase)" },
      { token: "E001", expected: "invalid (no EMP prefix)" },
      { token: "EMP1", expected: "invalid (too few digits)" },
      { token: "EMP0001", expected: "valid (extra digits OK)" },
    ];

    for (const test of testTokens) {
      const matches = test.token.match(/^EMP\d{3,}$/);
      const status = matches ? "✅ VALID" : "❌ INVALID";
      console.log(`   ${test.token.padEnd(10)} → ${status} (${test.expected})`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log();

  // Check 6: Collection Details
  console.log("6️⃣  Checking MongoDB Collection...");
  try {
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const loginCollection = collections.find(
      (c) => c.name === "loginactivities"
    );

    if (loginCollection) {
      console.log(`   ✅ Collection 'loginactivities' exists`);

      const stats = await mongoose.connection.db
        .collection("loginactivities")
        .stats();
      console.log(`   📊 Document count: ${stats.count}`);
      console.log(`   📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      console.log(`   ⚠️  Collection 'loginactivities' not found`);
      console.log(`   💡 This will be created automatically on first insert`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log();

  // Recommendations
  console.log("📝 RECOMMENDATIONS:\n");

  const LoginActivity = require("../models/LoginActivity");
  const failedCount = await LoginActivity.countDocuments({
    success_status: "Failed",
  });

  if (failedCount === 0) {
    console.log("   ⚠️  No failed logins recorded yet\n");
    console.log("   To test:");
    console.log("   1. Make sure backend server is running (npm start)");
    console.log(
      "   2. Try logging in with wrong credentials at http://localhost:3001"
    );
    console.log("   3. Check backend console for log messages");
    console.log("   4. Run: node scripts/testFailedLogin.js");
  } else {
    console.log(`   ✅ ${failedCount} failed login(s) recorded successfully!`);
    console.log("   System appears to be working correctly.");
  }

  console.log();
};

connectDB().then(async () => {
  try {
    await diagnose();
  } catch (error) {
    console.error("❌ Diagnostic failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Diagnostic complete\n");
    process.exit(0);
  }
});
