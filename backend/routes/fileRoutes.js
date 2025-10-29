const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs").promises;
const BulkDownloadAlert = require("../models/BulkDownloadAlert");
const ActiveThreat = require("../models/ActiveThreat");
const { evaluateBulkDownload } = require("../utils/ruleEngine");

// File storage path
const FILE_STORAGE_PATH = path.join(__dirname, "../utils/datafiles");

/**
 * @route   GET /api/files
 * @desc    Get list of available files
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const files = await fs.readdir(FILE_STORAGE_PATH);

    // Filter out metadata and get file details
    const fileList = await Promise.all(
      files
        .filter((file) => file !== "metadata.json")
        .map(async (filename) => {
          const filePath = path.join(FILE_STORAGE_PATH, filename);
          const stats = await fs.stat(filePath);

          return {
            filename,
            size: stats.size,
            sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
            modified: stats.mtime,
            type: path.extname(filename),
          };
        })
    );

    res.json({
      success: true,
      count: fileList.length,
      files: fileList,
    });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/files/download/:filename
 * @desc    Download a file and log the activity
 * @access  Public
 */
router.get("/download/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const { employee_token } = req.query;

    if (!employee_token) {
      return res.status(400).json({
        success: false,
        message: "Employee token is required",
      });
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(FILE_STORAGE_PATH, sanitizedFilename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Get file stats
    const stats = await fs.stat(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);

    // Log download activity
    console.log(
      `📥 File download: ${sanitizedFilename} (${fileSizeMB.toFixed(
        2
      )}MB) by ${employee_token}`
    );

    // Check for bulk download pattern (last 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Count recent downloads by this employee
    const recentDownloads = await BulkDownloadAlert.find({
      employee_token,
      alert_date_time: { $gte: oneHourAgo },
    });

    const totalRecentFiles = recentDownloads.reduce(
      (sum, alert) => sum + alert.total_files,
      0
    );
    const totalRecentSize = recentDownloads.reduce(
      (sum, alert) => sum + alert.total_size_mb,
      0
    );

    // Create bulk download alert
    const newFilesCount = totalRecentFiles + 1;
    const newTotalSize = totalRecentSize + fileSizeMB;

    // Evaluate risk
    const riskEvaluation = evaluateBulkDownload({
      total_files: newFilesCount,
      total_size_mb: newTotalSize,
      files: [sanitizedFilename],
      timeWindow: "1 hour",
    });

    // Create alert in database
    const bulkAlert = await BulkDownloadAlert.create({
      employee_token,
      total_files: 1,
      total_size_mb: fileSizeMB,
      folder_path: FILE_STORAGE_PATH,
      alert_date_time: new Date(),
      risk_level: riskEvaluation.riskLevel,
      status: "N",
      details: {
        filename: sanitizedFilename,
        cumulative_files: newFilesCount,
        cumulative_size_mb: newTotalSize,
      },
    });

    // Create active threat if risk is significant
    if (
      riskEvaluation.riskScore >= 30 ||
      fileSizeMB > 100 ||
      newFilesCount >= 5
    ) {
      const threat = await ActiveThreat.create({
        employee_token,
        alert_type: "bulk",
        risk_score: riskEvaluation.riskScore,
        original_alert_id: bulkAlert._id,
        alert_date_time: new Date(),
        solved: "N",
        details: {
          total_files: newFilesCount,
          total_size_mb: newTotalSize,
          current_file: sanitizedFilename,
          current_file_size_mb: fileSizeMB,
          risk_factors: riskEvaluation.reasons,
          time_window: "1 hour",
        },
      });

      // Emit real-time alert
      if (global.emitAlert) {
        global.emitAlert({
          type: "bulk",
          threat,
          message: `File download: ${sanitizedFilename} (${fileSizeMB.toFixed(
            2
          )}MB)`,
          employee_token,
        });
      }

      console.log(
        `⚠️  Bulk download threat created: ${newFilesCount} files, ${newTotalSize.toFixed(
          2
        )}MB, Risk: ${riskEvaluation.riskScore}`
      );
    }

    // Send file
    res.download(filePath, sanitizedFilename, (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Error downloading file",
          });
        }
      }
    });
  } catch (error) {
    console.error("File download error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   POST /api/files/bulk-download
 * @desc    Download multiple files at once
 * @access  Public
 */
router.post("/bulk-download", async (req, res) => {
  try {
    const { employee_token, filenames } = req.body;

    if (!employee_token || !filenames || !Array.isArray(filenames)) {
      return res.status(400).json({
        success: false,
        message: "Employee token and filenames array are required",
      });
    }

    // Calculate total size
    let totalSize = 0;
    const fileDetails = [];

    for (const filename of filenames) {
      const sanitizedFilename = path.basename(filename);
      const filePath = path.join(FILE_STORAGE_PATH, sanitizedFilename);

      try {
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
        fileDetails.push({
          filename: sanitizedFilename,
          size: stats.size,
        });
      } catch (error) {
        console.error(`File not found: ${sanitizedFilename}`);
      }
    }

    const totalSizeMB = totalSize / (1024 * 1024);

    console.log(
      `📥 Bulk download: ${filenames.length} files (${totalSizeMB.toFixed(
        2
      )}MB) by ${employee_token}`
    );

    // Evaluate risk
    const riskEvaluation = evaluateBulkDownload({
      total_files: filenames.length,
      total_size_mb: totalSizeMB,
      files: filenames,
      timeWindow: "immediate",
    });

    // Create bulk download alert
    const bulkAlert = await BulkDownloadAlert.create({
      employee_token,
      total_files: filenames.length,
      total_size_mb: totalSizeMB,
      folder_path: FILE_STORAGE_PATH,
      alert_date_time: new Date(),
      risk_level: riskEvaluation.riskLevel,
      status: "N",
      details: {
        files: fileDetails,
      },
    });

    // Create active threat
    const threat = await ActiveThreat.create({
      employee_token,
      alert_type: "bulk",
      risk_score: riskEvaluation.riskScore,
      original_alert_id: bulkAlert._id,
      alert_date_time: new Date(),
      solved: "N",
      details: {
        total_files: filenames.length,
        total_size_mb: totalSizeMB,
        files: fileDetails,
        risk_factors: riskEvaluation.reasons,
      },
    });

    // Emit real-time alert
    if (global.emitAlert) {
      global.emitAlert({
        type: "bulk",
        threat,
        message: `Bulk download: ${
          filenames.length
        } files (${totalSizeMB.toFixed(2)}MB)`,
        employee_token,
      });
    }

    res.json({
      success: true,
      message: "Bulk download logged",
      alert_id: bulkAlert._id,
      threat_id: threat._id,
      risk_score: riskEvaluation.riskScore,
      risk_level: riskEvaluation.riskLevel,
    });
  } catch (error) {
    console.error("Bulk download error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
