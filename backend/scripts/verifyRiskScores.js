require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected\n");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

const verifyRiskScores = async () => {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║   Risk Score Verification Tool                 ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  const ActiveThreat = require("../models/ActiveThreat");

  // Get all login-type threats
  const loginThreats = await ActiveThreat.find({
    alert_type: "login",
    solved: "N",
  })
    .sort({ alert_date_time: -1 })
    .limit(20)
    .lean();

  if (loginThreats.length === 0) {
    console.log("⚠️  No active login threats found\n");
    console.log(
      "💡 Try logging in with wrong credentials 3 times to generate threats\n"
    );
    return;
  }

  console.log(`Found ${loginThreats.length} active login threats:\n`);

  // Categorize by risk score
  const highThreats = [];
  const mediumThreats = [];
  const lowThreats = [];

  loginThreats.forEach((threat) => {
    if (threat.risk_score >= 50) {
      highThreats.push(threat);
    } else if (threat.risk_score >= 25) {
      mediumThreats.push(threat);
    } else {
      lowThreats.push(threat);
    }
  });

  console.log("📊 Distribution by Dashboard Categories:\n");
  console.log(`   🔴 HIGH (score >= 50):     ${highThreats.length} threats`);
  console.log(`   🟡 MEDIUM (25-49):         ${mediumThreats.length} threats`);
  console.log(`   🟢 LOW (< 25):             ${lowThreats.length} threats`);
  console.log();

  // Show details of each threat
  console.log("📋 Detailed Breakdown:\n");

  if (highThreats.length > 0) {
    console.log("🔴 HIGH RISK THREATS:");
    highThreats.forEach((threat, i) => {
      console.log(`   ${i + 1}. ${threat.employee_token}`);
      console.log(`      Risk Score: ${threat.risk_score}`);
      console.log(
        `      Severity Label: ${threat.details?.severity_level || "N/A"}`
      );
      console.log(
        `      Failed Attempts: ${threat.details?.failed_attempts || "N/A"}`
      );
      console.log(
        `      Time: ${threat.alert_date_time?.toISOString() || "N/A"}`
      );

      // Check for mismatch
      if (
        threat.risk_score >= 50 &&
        threat.details?.severity_level !== "High"
      ) {
        console.log(
          `      ⚠️  MISMATCH: Score is HIGH but labeled as ${threat.details?.severity_level}`
        );
      }
      console.log();
    });
  }

  if (mediumThreats.length > 0) {
    console.log("🟡 MEDIUM RISK THREATS:");
    mediumThreats.forEach((threat, i) => {
      console.log(`   ${i + 1}. ${threat.employee_token}`);
      console.log(`      Risk Score: ${threat.risk_score}`);
      console.log(
        `      Severity Label: ${threat.details?.severity_level || "N/A"}`
      );
      console.log(
        `      Failed Attempts: ${threat.details?.failed_attempts || "N/A"}`
      );
      console.log(
        `      Time: ${threat.alert_date_time?.toISOString() || "N/A"}`
      );

      // Check for mismatch
      if (
        threat.risk_score >= 50 &&
        threat.details?.severity_level === "Medium"
      ) {
        console.log(
          `      ⚠️  MISMATCH: Score is HIGH (${threat.risk_score}) but labeled as Medium`
        );
      }
      console.log();
    });
  }

  if (lowThreats.length > 0) {
    console.log("🟢 LOW RISK THREATS:");
    lowThreats.forEach((threat, i) => {
      console.log(`   ${i + 1}. ${threat.employee_token}`);
      console.log(`      Risk Score: ${threat.risk_score}`);
      console.log(
        `      Severity Label: ${threat.details?.severity_level || "N/A"}`
      );
      console.log(
        `      Time: ${threat.alert_date_time?.toISOString() || "N/A"}`
      );
      console.log();
    });
  }

  // Check for the specific issue
  console.log("\n🔍 Checking for the reported issue...\n");

  const threatsWithScore50 = loginThreats.filter((t) => t.risk_score === 50);
  if (threatsWithScore50.length > 0) {
    console.log(
      `⚠️  Found ${threatsWithScore50.length} threat(s) with score = 50 (the problematic threshold):`
    );
    threatsWithScore50.forEach((t) => {
      console.log(
        `   - ${t.employee_token}: score=50, labeled as "${t.details?.severity_level}"`
      );
      console.log(
        `     ❌ This is the BUG: score 50 is HIGH threshold but labeled Medium`
      );
    });
    console.log(
      `\n   💡 These should have score=45 (Medium) instead of 50 after the fix\n`
    );
  } else {
    console.log(
      `✅ No threats with score=50 found. The fix appears to be working!\n`
    );
  }
};

connectDB().then(async () => {
  try {
    await verifyRiskScores();
  } catch (error) {
    console.error("❌ Verification failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Verification complete\n");
    process.exit(0);
  }
});
