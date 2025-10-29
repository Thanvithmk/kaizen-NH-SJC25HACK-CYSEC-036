const mongoose = require("mongoose");

const EmployeePatternSchema = new mongoose.Schema(
  {
    emp_name: {
      type: String,
      default: "",
    },
    emp_id: {
      type: String,
      default: "",
    },
    emp_token: {
      type: String,
      required: true,
      unique: true,
      match: /^EMP\d{3,}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    location_type: {
      type: String,
      default: "Office",
    },
    ip_range: {
      type: String,
      default: "",
    },
    usual_login_time: {
      type: String,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      default: "09:00",
    },
    usual_logout_time: {
      type: String,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      default: "17:00",
    },
    country: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    // Enhanced geolocation verification fields
    verified_locations: [
      {
        location_type: {
          type: String,
          enum: ["Office", "Home", "Remote"],
          default: "Office",
        },
        country: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        ip_ranges: [String], // Array of IP ranges (e.g., "192.168.1.0/24")
        is_primary: {
          type: Boolean,
          default: false,
        },
        verified: {
          type: Boolean,
          default: true,
        },
        added_date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    allowed_countries: [String], // List of approved countries for login
    location_verification_enabled: {
      type: Boolean,
      default: true,
    },
    strict_mode: {
      type: Boolean,
      default: false, // If true, only verified IP ranges allowed
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index on emp_token
EmployeePatternSchema.index({ emp_token: 1 }, { unique: true });
EmployeePatternSchema.index({ status: 1 });

module.exports = mongoose.model("EmployeePattern", EmployeePatternSchema);
