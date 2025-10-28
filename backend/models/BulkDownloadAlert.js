const mongoose = require("mongoose");

const BulkDownloadAlertSchema = new mongoose.Schema(
  {
    employee_token: {
      type: String,
      required: true,
      match: /^EMP\d{3,}$/,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    total_files: {
      type: Number,
      required: true,
      min: 0,
    },
    total_size_mb: {
      type: Number,
      required: true,
      min: 0,
    },
    risk_level: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
    folder_path: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["New", "Resolved"],
      default: "New",
    },
    auto_triggered: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
BulkDownloadAlertSchema.index({ employee_token: 1, timestamp: -1 });
BulkDownloadAlertSchema.index({ status: 1 });

module.exports = mongoose.model("BulkDownloadAlert", BulkDownloadAlertSchema);
