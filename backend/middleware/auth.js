const jwt = require("jsonwebtoken");

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret_change_this"
    );

    // Add employee info to request
    req.employee = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

/**
 * Optional auth middleware
 * Doesn't block request if no token, but verifies if present
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_secret_change_this"
      );
      req.employee = decoded;
    }

    next();
  } catch (error) {
    // Continue without auth if token invalid
    next();
  }
};

module.exports = { authMiddleware, optionalAuth };

