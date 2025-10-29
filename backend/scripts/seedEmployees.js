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
    emp_id: "EMP001",
    password: "password123",
    country: "United States",
    city: "New York",
    status: 1,
  },
  {
    emp_token: "EMP002",
    emp_name: "Sarah Johnson",
    emp_id: "EMP002",
    password: "password123",
    country: "United States",
    city: "Los Angeles",
    status: 1,
  },
  {
    emp_token: "EMP003",
    emp_name: "Michael Chen",
    emp_id: "EMP003",
    password: "password123",
    country: "United States",
    city: "San Francisco",
    status: 1,
  },
  {
    emp_token: "EMP999",
    emp_name: "Test User",
    emp_id: "EMP999",
    password: "password123",
    country: "United States",
    city: "New York",
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
    console.log("   Employee ID: EMP001, EMP002, EMP003, or EMP999");
    console.log("   Password: password123");
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
