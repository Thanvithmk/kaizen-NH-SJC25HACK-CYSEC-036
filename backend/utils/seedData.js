require("dotenv").config();
const mongoose = require("mongoose");
const EmployeePattern = require("../models/EmployeePattern");
const LoginActivity = require("../models/LoginActivity");

/**
 * Seed database with sample data for testing
 */
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing data...");
    await EmployeePattern.deleteMany({});
    await LoginActivity.deleteMany({});

    // Sample employees with enhanced geolocation verification
    const employees = [
      {
        emp_name: "John Smith",
        emp_id: "E001",
        emp_token: "EMP001",
        location_type: "Office",
        ip_range: "192.168.1.0/24",
        usual_login_time: "09:00",
        usual_logout_time: "17:00",
        country: "United States",
        city: "New York",
        status: 1,
        verified_locations: [
          {
            location_type: "Office",
            country: "United States",
            city: "New York",
            ip_ranges: ["192.168.1.0/24", "10.0.0.0/16"],
            is_primary: true,
            verified: true,
          },
          {
            location_type: "Home",
            country: "United States",
            city: "Brooklyn",
            ip_ranges: ["73.45.123.0/24"],
            is_primary: false,
            verified: true,
          },
        ],
        allowed_countries: ["United States", "Canada"],
        location_verification_enabled: true,
        strict_mode: false,
      },
      {
        emp_name: "Sarah Johnson",
        emp_id: "E002",
        emp_token: "EMP002",
        location_type: "Remote",
        ip_range: "192.168.2.0/24",
        usual_login_time: "08:30",
        usual_logout_time: "16:30",
        country: "United States",
        city: "San Francisco",
        status: 1,
        verified_locations: [
          {
            location_type: "Home",
            country: "United States",
            city: "San Francisco",
            ip_ranges: ["192.168.2.0/24"],
            is_primary: true,
            verified: true,
          },
        ],
        allowed_countries: ["United States"],
        location_verification_enabled: true,
        strict_mode: false,
      },
      {
        emp_name: "Michael Chen",
        emp_id: "E003",
        emp_token: "EMP003",
        location_type: "Office",
        ip_range: "192.168.1.0/24",
        usual_login_time: "09:00",
        usual_logout_time: "18:00",
        country: "United States",
        city: "New York",
        status: 1,
        verified_locations: [
          {
            location_type: "Office",
            country: "United States",
            city: "New York",
            ip_ranges: ["192.168.1.0/24"],
            is_primary: true,
            verified: true,
          },
        ],
        allowed_countries: ["United States"],
        location_verification_enabled: true,
        strict_mode: true, // Strict mode: Only verified IPs allowed
      },
      {
        emp_name: "Emily Davis",
        emp_id: "E004",
        emp_token: "EMP004",
        location_type: "Hybrid",
        ip_range: "192.168.3.0/24",
        usual_login_time: "10:00",
        usual_logout_time: "18:00",
        country: "United Kingdom",
        city: "London",
        status: 1,
        verified_locations: [
          {
            location_type: "Office",
            country: "United Kingdom",
            city: "London",
            ip_ranges: ["192.168.3.0/24", "10.50.0.0/16"],
            is_primary: true,
            verified: true,
          },
          {
            location_type: "Home",
            country: "United Kingdom",
            city: "London",
            ip_ranges: ["82.45.0.0/16"],
            is_primary: false,
            verified: true,
          },
        ],
        allowed_countries: ["United Kingdom", "United States", "France"],
        location_verification_enabled: true,
        strict_mode: false,
      },
      {
        emp_name: "David Martinez",
        emp_id: "E005",
        emp_token: "EMP005",
        location_type: "Office",
        ip_range: "192.168.1.0/24",
        usual_login_time: "08:00",
        usual_logout_time: "16:00",
        country: "United States",
        city: "New York",
        status: 1,
        verified_locations: [
          {
            location_type: "Office",
            country: "United States",
            city: "New York",
            ip_ranges: ["192.168.1.0/24"],
            is_primary: true,
            verified: true,
          },
        ],
        allowed_countries: ["United States", "Mexico"],
        location_verification_enabled: false, // Verification disabled
        strict_mode: false,
      },
    ];

    console.log("Creating employees...");
    await EmployeePattern.insertMany(employees);
    console.log(`✓ Created ${employees.length} employees`);

    console.log("\n📍 Geolocation Verification Configuration:");
    console.log(
      "  EMP001: Office (NYC) + Home (Brooklyn) | Allowed: US, Canada"
    );
    console.log("  EMP002: Home (SF) | Allowed: US only");
    console.log("  EMP003: Office (NYC) | 🔒 STRICT MODE - Only verified IPs");
    console.log(
      "  EMP004: Office (London) + Home (London) | Allowed: UK, US, France"
    );
    console.log("  EMP005: Office (NYC) | ⚠️ Verification DISABLED");

    // Sample login activities with varied patterns
    const now = new Date();
    const loginActivities = [
      {
        employee_token: "EMP001",
        login_timestamp: new Date(now - 5 * 60 * 1000), // 5 minutes ago
        ip_address: "192.168.1.100",
        city: "New York",
        country: "United States",
        success_status: "Success",
        failed_attempts_count: 0,
        risk_level: "Low",
      },
      {
        employee_token: "EMP002",
        login_timestamp: new Date(now - 15 * 60 * 1000), // 15 minutes ago
        ip_address: "192.168.2.50",
        city: "San Francisco",
        country: "United States",
        success_status: "Success",
        failed_attempts_count: 0,
        risk_level: "Low",
      },
      {
        employee_token: "EMP003",
        login_timestamp: new Date(now - 30 * 60 * 1000), // 30 minutes ago
        ip_address: "192.168.1.105",
        city: "New York",
        country: "United States",
        success_status: "Success",
        failed_attempts_count: 0,
        risk_level: "Low",
      },
      {
        employee_token: "EMP004",
        login_timestamp: new Date(now - 45 * 60 * 1000), // 45 minutes ago
        ip_address: "10.50.30.15",
        city: "London",
        country: "United Kingdom",
        success_status: "Success",
        failed_attempts_count: 0,
        risk_level: "Medium",
      },
      {
        employee_token: "EMP005",
        login_timestamp: new Date(now - 60 * 60 * 1000), // 1 hour ago
        ip_address: "192.168.1.75",
        city: "New York",
        country: "United States",
        success_status: "Success",
        failed_attempts_count: 0,
        risk_level: "Low",
      },
      {
        employee_token: "EMP001",
        login_timestamp: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
        logout_timestamp: new Date(now - 10 * 60 * 1000), // Logged out 10 mins ago
        ip_address: "192.168.1.100",
        city: "New York",
        country: "United States",
        success_status: "Success",
        failed_attempts_count: 0,
        risk_level: "Low",
      },
      {
        employee_token: "EMP003",
        login_timestamp: new Date(now - 3 * 60 * 60 * 1000), // 3 hours ago
        ip_address: "45.123.78.90",
        city: "Unknown",
        country: "Unknown",
        success_status: "Success",
        failed_attempts_count: 0,
        risk_level: "High",
      },
      {
        employee_token: "EMP002",
        login_timestamp: new Date(now - 4 * 60 * 60 * 1000), // 4 hours ago
        logout_timestamp: new Date(now - 1 * 60 * 60 * 1000), // Logged out 1 hour ago
        ip_address: "192.168.2.50",
        city: "San Francisco",
        country: "United States",
        success_status: "Success",
        failed_attempts_count: 0,
        risk_level: "Low",
      },
      {
        employee_token: "EMP004",
        login_timestamp: new Date(now - 5 * 60 * 60 * 1000), // 5 hours ago
        ip_address: "10.50.30.20",
        city: "London",
        country: "United Kingdom",
        success_status: "Failed",
        failed_attempts_count: 3,
        risk_level: "High",
      },
      {
        employee_token: "EMP005",
        login_timestamp: new Date(now - 6 * 60 * 60 * 1000), // 6 hours ago
        logout_timestamp: new Date(now - 90 * 60 * 1000), // Logged out 90 mins ago
        ip_address: "192.168.1.85",
        city: "New York",
        country: "United States",
        success_status: "Success",
        failed_attempts_count: 0,
        risk_level: "Low",
      },
    ];

    console.log("\nCreating login activities...");
    await LoginActivity.insertMany(loginActivities);
    console.log(`✓ Created ${loginActivities.length} login activities`);

    console.log("\n📊 Login Activity Summary:");
    console.log("  • Successful logins: 7");
    console.log("  • Failed login attempts: 1");
    console.log("  • Active sessions: 5");
    console.log("  • Completed sessions: 3");
    console.log("  • Risk levels:");
    console.log("    - Low: 5 logins");
    console.log("    - Medium: 1 login");
    console.log("    - High: 2 logins");

    console.log("\n✅ Database seeded successfully!");
    console.log("\n👥 Sample Employees:");
    employees.forEach((emp) => {
      const locCount = emp.verified_locations?.length || 0;
      const strictMode = emp.strict_mode ? "🔒 STRICT" : "✓ Normal";
      const verificationStatus = emp.location_verification_enabled
        ? "ON"
        : "OFF";
      console.log(
        `  ${emp.emp_token}: ${emp.emp_name} | ${locCount} locations | ${strictMode} | Verification: ${verificationStatus}`
      );
    });

    console.log("\n🧪 Test Scenarios:");
    console.log("\n1️⃣  Normal Office Login (Low Risk):");
    console.log("   Login as: EMP001");
    console.log("   From IP: 192.168.1.100 (Office range)");
    console.log("   Result: ✅ Login allowed, no alert");

    console.log("\n2️⃣  Home Login (Low Risk):");
    console.log("   Login as: EMP001");
    console.log("   From IP: 73.45.123.50 (Home range)");
    console.log("   Result: ✅ Login allowed, no alert");

    console.log("\n3️⃣  Allowed Country, New City (Medium Risk):");
    console.log("   Login as: EMP001");
    console.log("   From: Toronto, Canada (allowed country)");
    console.log("   Result: ✅ Login allowed, ⚠️ Medium risk alert");

    console.log("\n4️⃣  Unknown Location (High Risk):");
    console.log("   Login as: EMP001");
    console.log("   From: Beijing, China (unknown)");
    console.log("   Result: ✅ Login allowed, 🚨 High risk alert");

    console.log("\n5️⃣  Strict Mode Violation (BLOCKED):");
    console.log("   Login as: EMP003");
    console.log("   From: Any IP not in verified ranges");
    console.log("   Result: ❌ Login BLOCKED, Critical alert");

    console.log("\n6️⃣  Verification Disabled:");
    console.log("   Login as: EMP005");
    console.log("   From: Any location");
    console.log("   Result: ✅ Login allowed, no verification");

    console.log(
      "\n📝 Login with employee tokens: EMP001, EMP002, EMP003, EMP004, EMP005"
    );
    console.log("🔑 Password: Not required (demo mode)\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
