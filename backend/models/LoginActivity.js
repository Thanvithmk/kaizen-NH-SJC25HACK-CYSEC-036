const mongoose = require("mongoose");

const LoginActivitySchema = new mongoose.Schema(
  {
    employee_token: {
      type: String,
      required: true,
      match: /^EMP\d{3,}$/,
    },
    login_timestamp: {
      type: Date,
      default: Date.now,
    },
    logout_timestamp: {
      type: Date,
      default: null,
    },
    ip_address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "Unknown",
    },
    country: {
      type: String,
      default: "Unknown",
    },
    location: {
      type: String,
      default: "Unknown",
    },
    success_status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },
    failed_attempts_count: {
      type: Number,
      default: 0,
    },
    risk_level: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
LoginActivitySchema.index({ employee_token: 1, login_timestamp: -1 });
LoginActivitySchema.index({ logout_timestamp: 1 });

module.exports = mongoose.model("LoginActivity", LoginActivitySchema);
