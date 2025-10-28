const mongoose = require("mongoose");

const ActiveThreatSchema = new mongoose.Schema(
  {
    alert_date_time: {
      type: Date,
      default: Date.now,
    },
    risk_score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    last_reviewed: {
      type: Date,
      default: null,
    },
    alert_type: {
      type: String,
      enum: ["login", "geo", "bulk"],
      required: true,
    },
    employee_token: {
      type: String,
      required: true,
      match: /^EMP\d{3,}$/,
    },
    solved: {
      type: String,
      enum: ["Y", "N"],
      default: "N",
    },
    original_alert_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for common queries
ActiveThreatSchema.index({ employee_token: 1, solved: 1, alert_date_time: -1 });
ActiveThreatSchema.index({ solved: 1, risk_score: -1 });
ActiveThreatSchema.index({ alert_type: 1 });

module.exports = mongoose.model("ActiveThreat", ActiveThreatSchema);
