const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create indexes for better performance
    await createIndexes();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const LoginActivity = require("../models/LoginActivity");
    const BulkDownloadAlert = require("../models/BulkDownloadAlert");
    const GeographicAlert = require("../models/GeographicAlert");
    const EmployeePattern = require("../models/EmployeePattern");
    const ActiveThreat = require("../models/ActiveThreat");

    // Create compound indexes for common queries
    await LoginActivity.collection.createIndex({
      employee_token: 1,
      login_timestamp: -1,
    });
    await BulkDownloadAlert.collection.createIndex({
      employee_token: 1,
      timestamp: -1,
    });
    await GeographicAlert.collection.createIndex({
      employee_token: 1,
      alert_timestamp: -1,
    });
    await EmployeePattern.collection.createIndex(
      { emp_token: 1 },
      { unique: true }
    );
    await ActiveThreat.collection.createIndex({
      employee_token: 1,
      solved: 1,
      alert_date_time: -1,
    });

    console.log("Database indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  }
};

module.exports = connectDB;
