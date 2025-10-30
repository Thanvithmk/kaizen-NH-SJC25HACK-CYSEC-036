const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs").promises;
const BulkDownloadAlert = require("../models/BulkDownloadAlert");
const ActiveThreat = require("../models/ActiveThreat");
const { evaluateBulkDownload } = require("../utils/ruleEngine");
const EmployeePattern = require("../models/EmployeePattern");

// Directory where data files are stored
const DATA_FILES_DIR = path.join(__dirname, "../utils/datafiles");

/**
 * @route   GET /api/files/list
 * @desc    Get list of available files for download
 * @access  Public (should be protected in production)
 */
router.get("/list", async (req, res) => {
  try {
    // Ensure directory exists
    try {
      await fs.access(DATA_FILES_DIR);
    } catch {
      await fs.mkdir(DATA_FILES_DIR, { recursive: true });
    }

    // Try to read metadata file
    try {
      const metadataPath = path.join(DATA_FILES_DIR, "metadata.json");
      const metadataContent = await fs.readFile(metadataPath, "utf8");
      const metadata = JSON.parse(metadataContent);

      // Add risk level based on file size
      const filesWithRisk = metadata.files.map((file) => ({
        ...file,
        riskLevel:
          file.sizeMB >= 1000 ? "HIGH" : file.sizeMB >= 100 ? "MEDIUM" : "LOW",
        riskScore: file.sizeMB >= 1000 ? 70 : file.sizeMB >= 100 ? 50 : 10,
      }));

      return res.json({
        success: true,
        count: filesWithRisk.length,
        files: filesWithRisk,
      });
    } catch (metadataError) {
      console.log("Metadata file not found, reading directory...");
    }

    // Fallback: Read directory contents
    const files = await fs.readdir(DATA_FILES_DIR);

    // Filter out metadata.json
    const filteredFiles = files.filter((f) => f !== "metadata.json");

    // Get file stats for each file
    const fileList = await Promise.all(
      filteredFiles.map(async (filename) => {
        const filePath = path.join(DATA_FILES_DIR, filename);
        const stats = await fs.stat(filePath);
        const sizeMB = stats.size / (1024 * 1024);

        return {
          filename,
          size: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2),
          sizeMB: sizeMB.toFixed(2),
          modified: stats.mtime,
          extension: path.extname(filename),
          type: getFileType(filename),
          description: "Data file",
          isSensitive: checkIfSensitive(filename),
          riskLevel: sizeMB >= 1000 ? "HIGH" : sizeMB >= 100 ? "MEDIUM" : "LOW",
          riskScore: sizeMB >= 1000 ? 70 : sizeMB >= 100 ? 50 : 10,
        };
      })
    );

    // Sort by modified date (newest first)
    fileList.sort((a, b) => b.modified - a.modified);

    res.json({
      success: true,
      count: fileList.length,
      files: fileList,
    });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list files",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/files/download/:filename
 * @desc    Download a specific file
 * @access  Public (should be protected in production)
 */
router.get("/download/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const employeeToken = req.query.employee_token || "UNKNOWN";

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(DATA_FILES_DIR, sanitizedFilename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Get file size from metadata
    let fileSizeMB = 0;
    let isSensitive = checkIfSensitive(filename);

    try {
      const metadataPath = path.join(DATA_FILES_DIR, "metadata.json");
      const metadataContent = await fs.readFile(metadataPath, "utf8");
      const metadata = JSON.parse(metadataContent);
      const fileInfo = metadata.files.find(
        (f) => f.filename === sanitizedFilename
      );

      if (fileInfo) {
        fileSizeMB = fileInfo.sizeMB;
        isSensitive = fileInfo.isSensitive;
      } else {
        // Fallback to actual file stats
        const stats = await fs.stat(filePath);
        fileSizeMB = stats.size / (1024 * 1024);
      }
    } catch (err) {
      // Fallback to actual file stats
      const stats = await fs.stat(filePath);
      fileSizeMB = stats.size / (1024 * 1024);
    }

    // Log download activity
    const downloadAlert = await BulkDownloadAlert.create({
      employee_token: employeeToken,
      folder_path: filePath,
      total_files: 1,
      total_size_mb: fileSizeMB,
      timestamp: new Date(),
      risk_level:
        fileSizeMB >= 1000
          ? "Critical"
          : fileSizeMB >= 500
          ? "High"
          : fileSizeMB >= 200
          ? "Medium"
          : "Low",
    });

    // Get employee pattern
    const employeePattern = await EmployeePattern.findOne({
      emp_token: employeeToken,
    });

    // Evaluate risk
    let riskAnalysis;
    if (employeePattern) {
      riskAnalysis = evaluateBulkDownload(downloadAlert, employeePattern);
    } else {
      // Default risk analysis if employee pattern doesn't exist
      riskAnalysis = {
        total_risk_score: fileSizeMB >= 500 ? 60 : fileSizeMB >= 200 ? 40 : 20,
        severity:
          fileSizeMB >= 500 ? "High" : fileSizeMB >= 200 ? "Medium" : "Low",
        anomalies_detected: [`File download: ${fileSizeMB.toFixed(2)}MB`],
      };
    }

    // Create threat alert for all bulk downloads
    const threat = await ActiveThreat.create({
      employee_token: employeeToken,
      alert_type: "bulk",
      risk_score: riskAnalysis.total_risk_score,
      original_alert_id: downloadAlert._id,
      alert_date_time: new Date(),
      solved: "N",
      details: {
        file_count: 1,
        total_size_mb: fileSizeMB,
        file_path: filePath,
        filename: sanitizedFilename,
        anomalies: riskAnalysis.anomalies_detected,
        is_sensitive: isSensitive,
        severity_level: riskAnalysis.severity,
      },
    });

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("new_threat", threat);
    }

    // Send file
    res.download(filePath, sanitizedFilename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Error downloading file",
          });
        }
      }
    });
  } catch (error) {
    console.error("Error in file download:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download file",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/files/bulk-download
 * @desc    Download multiple files (creates higher risk)
 * @access  Public
 */
router.post("/bulk-download", async (req, res) => {
  try {
    const { employee_token, filenames } = req.body;

    if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files specified for download",
      });
    }

    // Calculate total size
    let totalSize = 0;
    const fileTypes = new Set();

    for (const filename of filenames) {
      const sanitizedFilename = path.basename(filename);
      const filePath = path.join(DATA_FILES_DIR, sanitizedFilename);

      try {
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
        fileTypes.add(path.extname(filename));
      } catch (error) {
        console.log(`File not found: ${filename}`);
      }
    }

    // Create bulk download alert
    const totalSizeMB = totalSize / (1024 * 1024);
    const downloadAlert = await BulkDownloadAlert.create({
      employee_token: employee_token,
      folder_path: DATA_FILES_DIR,
      total_files: filenames.length,
      total_size_mb: totalSizeMB,
      timestamp: new Date(),
      risk_level:
        totalSizeMB >= 1000
          ? "Critical"
          : totalSizeMB >= 500
          ? "High"
          : totalSizeMB >= 200
          ? "Medium"
          : "Low",
    });

    // Get employee pattern
    const employeePattern = await EmployeePattern.findOne({
      emp_token: employee_token,
    });

    // Evaluate risk
    let riskAnalysis;
    if (employeePattern) {
      riskAnalysis = evaluateBulkDownload(downloadAlert, employeePattern);
    } else {
      // Default risk analysis if employee pattern doesn't exist
      riskAnalysis = {
        total_risk_score:
          totalSizeMB >= 500
            ? 70
            : totalSizeMB >= 200 || filenames.length >= 30
            ? 50
            : 30,
        severity:
          totalSizeMB >= 500
            ? "High"
            : totalSizeMB >= 200 || filenames.length >= 30
            ? "Medium"
            : "Low",
        anomalies_detected: [
          `Bulk download: ${filenames.length} files, ${totalSizeMB.toFixed(
            2
          )}MB`,
        ],
      };
    }

    // Create threat alert for all bulk downloads
    const threat = await ActiveThreat.create({
      employee_token: employee_token,
      alert_type: "bulk",
      risk_score: riskAnalysis.total_risk_score,
      original_alert_id: downloadAlert._id,
      alert_date_time: new Date(),
      solved: "N",
      details: {
        file_count: filenames.length,
        total_size_mb: totalSize / (1024 * 1024),
        file_path: DATA_FILES_DIR,
        filenames: filenames,
        anomalies: riskAnalysis.anomalies_detected,
        is_sensitive: true,
        severity_level: riskAnalysis.severity,
      },
    });

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("new_threat", threat);
    }

    res.json({
      success: true,
      message: `Bulk download of ${filenames.length} files initiated`,
      downloadAlert: downloadAlert._id,
      fileCount: filenames.length,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    });
  } catch (error) {
    console.error("Error in bulk download:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process bulk download",
      error: error.message,
    });
  }
});

// Helper function to get file type based on extension
function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const typeMap = {
    ".pdf": "PDF Document",
    ".doc": "Word Document",
    ".docx": "Word Document",
    ".xls": "Excel Spreadsheet",
    ".xlsx": "Excel Spreadsheet",
    ".ppt": "PowerPoint Presentation",
    ".pptx": "PowerPoint Presentation",
    ".txt": "Text File",
    ".csv": "CSV File",
    ".json": "JSON Data",
    ".xml": "XML Data",
    ".zip": "Archive",
    ".rar": "Archive",
    ".jpg": "Image",
    ".jpeg": "Image",
    ".png": "Image",
    ".gif": "Image",
    ".mp4": "Video",
    ".avi": "Video",
    ".mov": "Video",
  };

  return typeMap[ext] || "Unknown File Type";
}

// Helper function to check if file is sensitive
function checkIfSensitive(filename) {
  const sensitivePatterns = [
    "confidential",
    "secret",
    "private",
    "sensitive",
    "restricted",
    "classified",
    "payroll",
    "salary",
    "financial",
    "customer",
  ];

  const lowerFilename = filename.toLowerCase();
  return sensitivePatterns.some((pattern) => lowerFilename.includes(pattern));
}

module.exports = router;
