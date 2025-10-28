const mongoose = require("mongoose");

const GeographicAlertSchema = new mongoose.Schema(
  {
    employee_token: {
      type: String,
      required: true,
      match: /^EMP\d{3,}$/,
    },
    alert_timestamp: {
      type: Date,
      default: Date.now,
    },
    current_country: {
      type: String,
      required: true,
    },
    current_city: {
      type: String,
      required: true,
    },
    previous_country: {
      type: String,
      default: "",
    },
    previous_city: {
      type: String,
      default: "",
    },
    time_between_logins_hours: {
      type: Number,
      default: 0,
    },
    minimum_travel_time_hours: {
      type: Number,
      default: 0,
    },
    anomaly_type: {
      type: String,
      enum: ["SameCountry", "ImpossibleTravel", "RiskCountry", "NewCountry"],
      required: true,
    },
    risk_level: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    verified: {
      type: String,
      enum: ["Yes", "No", "Pending"],
      default: "No",
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
GeographicAlertSchema.index({ employee_token: 1, alert_timestamp: -1 });
GeographicAlertSchema.index({ verified: 1 });

module.exports = mongoose.model("GeographicAlert", GeographicAlertSchema);
