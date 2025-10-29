require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const EmployeePattern = require("../models/EmployeePattern");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

const testEmployees = [
  {
    emp_token: "EMP001",
    emp_name: "John Smith",
    emp_id: "E001",
    password: "password123",
    location_type: "Office",
    ip_range: "192.168.1.0/24",
    usual_login_time: "09:00",
    usual_logout_time: "17:00",
    country: "United States",
    city: "New York",
    status: 1,
  },
  {
    emp_token: "EMP002",
    emp_name: "Sarah Johnson",
    emp_id: "E002",
    password: "password123",
    location_type: "Remote",
    ip_range: "203.45.78.0/24",
    usual_login_time: "08:30",
    usual_logout_time: "16:30",
    country: "United Kingdom",
    city: "London",
    status: 1,
  },
  {
    emp_token: "EMP003",
    emp_name: "Michael Chen",
    emp_id: "E003",
    password: "password123",
    location_type: "Office",
    ip_range: "10.0.0.0/24",
    usual_login_time: "10:00",
    usual_logout_time: "18:00",
    country: "Singapore",
    city: "Singapore",
    status: 1,
  },
  {
    emp_token: "EMP004",
    emp_name: "Emma Davis",
    emp_id: "E004",
    password: "password123",
    location_type: "Hybrid",
    ip_range: "172.16.0.0/24",
    usual_login_time: "09:30",
    usual_logout_time: "17:30",
    country: "Canada",
    city: "Toronto",
    status: 1,
  },
];

const seedEmployees = async () => {
  try {
    console.log("🌱 Seeding employee data...");

    // Clear existing employees
    const deleteCount = await EmployeePattern.deleteMany({});
    console.log(`🗑️  Cleared ${deleteCount.deletedCount} existing employees`);

    // Hash passwords and create employees
    for (const emp of testEmployees) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(emp.password, salt);

      await EmployeePattern.create({
        ...emp,
        password: hashedPassword,
      });

      console.log(`✅ Created employee: ${emp.emp_token} (${emp.emp_name})`);
    }

    console.log("\n✨ Employee seeding completed successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("   Employee Token: EMP001, EMP002, EMP003, or EMP004");
    console.log("   Password: password123");
    console.log(
      "\n⚠️  Note: Use the Employee Token (EMP###), not the Employee ID (E###)"
    );
    console.log("\n");
  } catch (error) {
    console.error("❌ Error seeding employees:", error);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
    process.exit(0);
  }
};

// Run the seeding
connectDB().then(() => seedEmployees());
