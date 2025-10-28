const express = require("express");
const router = express.Router();
const authService = require("../services/authService");
const { body, validationResult } = require("express-validator");

/**
 * @route   POST /api/auth/register
 * @desc    Register new employee
 * @access  Public
 */
router.post(
  "/register",
  [
    body("emp_name").optional().isString(),
    body("emp_id").optional().isString(),
    body("country").optional().isString(),
    body("city").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const employee = await authService.registerEmployee(req.body);

      res.status(201).json({
        success: true,
        message: "Employee registered successfully",
        employee_token: employee.emp_token,
        employee,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Employee login (secondary security login)
 * @access  Public
 */
router.post(
  "/login",
  [
    body("employee_token")
      .isString()
      .matches(/^EMP\d{3,}$/),
    body("ip_address").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get IP address from request if not provided
      const ip_address =
        req.body.ip_address ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        "127.0.0.1";

      const result = await authService.handleLogin({
        employee_token: req.body.employee_token,
        password: req.body.password,
        ip_address,
      });

      res.json(result);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Employee logout
 * @access  Private
 */
router.post("/logout", async (req, res) => {
  try {
    const { employee_token } = req.body;

    if (!employee_token) {
      return res.status(400).json({
        success: false,
        message: "Employee token required",
      });
    }

    await authService.handleLogout(employee_token);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/auth/session/:token
 * @desc    Get session information
 * @access  Private
 */
router.get("/session/:token", (req, res) => {
  try {
    const sessions = authService.getActiveSessions();
    const session = sessions.find((s) => s.employee_token === req.params.token);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/auth/sessions
 * @desc    Get all active sessions
 * @access  Private
 */
router.get("/sessions", (req, res) => {
  try {
    const sessions = authService.getActiveSessions();

    res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;

