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

    // Sample employees
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
      },
    ];

    console.log("Creating employees...");
    await EmployeePattern.insertMany(employees);
    console.log(`✓ Created ${employees.length} employees`);

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

    console.log("Creating login activities...");
    await LoginActivity.insertMany(loginActivities);
    console.log(`✓ Created ${loginActivities.length} login activities`);

    console.log("\n✅ Database seeded successfully!");
    console.log("\nSample Employees:");
    employees.forEach((emp) => {
      console.log(`  - ${emp.emp_name} (${emp.emp_token})`);
    });

    console.log(
      "\n📝 You can now login with any employee token (EMP001-EMP005)"
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
