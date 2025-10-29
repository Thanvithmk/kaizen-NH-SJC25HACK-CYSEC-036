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
