require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO for real-time updates
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Make io accessible to routes
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("subscribe", (data) => {
    console.log("Client subscribed:", data);
    socket.join("dashboard");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Helper function to emit real-time updates
global.emitAlert = (alertData) => {
  io.to("dashboard").emit("newAlert", alertData);
};

global.emitStats = (statsData) => {
  io.to("dashboard").emit("statsUpdate", statsData);
};

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.use("/api/geographic", require("./routes/geographicRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/simulation", require("./routes/simulationRoutes"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Vigilant Guard - Insider Threat Detection System API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      dashboard: "/api/dashboard",
      alerts: "/api/alerts",
      geographic: "/api/geographic",
      employees: "/api/employees",
      files: "/api/files",
      simulation: "/api/simulation",
      health: "/api/health",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Vigilant Guard - Insider Threat Detection System    ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`🔒 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`⚡ WebSocket: Enabled for real-time updates`);
  console.log(`\n Environment: ${process.env.NODE_ENV || "development"}\n`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

module.exports = { app, server, io };
