const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");
const os = require("os");
const ruleEngine = require("../utils/ruleEngine");
const BulkDownloadAlert = require("../models/BulkDownloadAlert");
const ActiveThreat = require("../models/ActiveThreat");

class FolderMonitoringService {
  constructor() {
    this.watchers = new Map();
    this.downloadActivity = new Map(); // Track downloads per employee
    this.scanInterval = (process.env.FILE_SCAN_INTERVAL_SECONDS || 30) * 1000;
    this.currentEmployeeToken = null;
  }

  /**
   * Initialize folder monitoring for an employee
   * @param {String} employeeToken - Employee token
   */
  startMonitoring(employeeToken) {
    if (this.watchers.has(employeeToken)) {
      console.log(`Already monitoring for ${employeeToken}`);
      return;
    }

    this.currentEmployeeToken = employeeToken;
    const monitoredPaths = this.getMonitoredPaths();

    console.log(`Starting file monitoring for ${employeeToken}`);
    console.log("Monitored paths:", monitoredPaths);

    // Initialize download activity tracker
    if (!this.downloadActivity.has(employeeToken)) {
      this.downloadActivity.set(employeeToken, {
        files: [],
        lastCheck: Date.now(),
      });
    }

    // Watch multiple directories
    const watcher = chokidar.watch(monitoredPaths, {
      ignored: /(^|[\/\\])\../, // Ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    });

    // Track new files
    watcher.on("add", (filePath) => {
      this.handleFileActivity(employeeToken, filePath);
    });

    watcher.on("error", (error) => {
      console.error("Watcher error:", error);
    });

    this.watchers.set(employeeToken, watcher);

    // Start periodic checking
    this.startPeriodicCheck(employeeToken);
  }

  /**
   * Stop monitoring for an employee
   * @param {String} employeeToken - Employee token
   */
  async stopMonitoring(employeeToken) {
    const watcher = this.watchers.get(employeeToken);

    if (watcher) {
      await watcher.close();
      this.watchers.delete(employeeToken);
      console.log(`Stopped monitoring for ${employeeToken}`);
    }

    // Clear activity data
    this.downloadActivity.delete(employeeToken);
  }

  /**
   * Handle file activity
   * @param {String} employeeToken - Employee token
   * @param {String} filePath - File path
   */
  handleFileActivity(employeeToken, filePath) {
    try {
      const stats = fs.statSync(filePath);
      const activity = this.downloadActivity.get(employeeToken);

      if (activity) {
        activity.files.push({
          path: filePath,
          size: stats.size,
          timestamp: Date.now(),
          folder: path.dirname(filePath),
        });
      }
    } catch (error) {
      console.error("Error handling file activity:", error.message);
    }
  }

  /**
   * Start periodic checking for bulk downloads
   * @param {String} employeeToken - Employee token
   */
  startPeriodicCheck(employeeToken) {
    const intervalId = setInterval(async () => {
      await this.checkBulkDownload(employeeToken);
    }, this.scanInterval);

    // Store interval ID for cleanup
    const watcher = this.watchers.get(employeeToken);
    if (watcher) {
      watcher.intervalId = intervalId;
    }
  }

  /**
   * Check for bulk download activity
   * @param {String} employeeToken - Employee token
   */
  async checkBulkDownload(employeeToken) {
    try {
      const activity = this.downloadActivity.get(employeeToken);

      if (!activity || activity.files.length === 0) {
        return;
      }

      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      // Filter files from last hour
      const recentFiles = activity.files.filter(
        (f) => f.timestamp > oneHourAgo
      );

      if (recentFiles.length === 0) {
        // Clean up old files
        activity.files = [];
        activity.lastCheck = now;
        return;
      }

      // Calculate total size
      const totalSize = recentFiles.reduce((sum, f) => sum + f.size, 0);
      const totalSizeMB = Math.round((totalSize / (1024 * 1024)) * 100) / 100;

      // Check if meets threshold for alert
      if (recentFiles.length >= 30 || totalSizeMB >= 200) {
        // Calculate risk
        const riskData = ruleEngine.calculateBulkDownloadRisk({
          total_files: recentFiles.length,
          total_size_mb: totalSizeMB,
          timestamp: new Date(),
        });

        // Group by folder
        const folderGroups = {};
        recentFiles.forEach((f) => {
          const folder = f.folder;
          if (!folderGroups[folder]) {
            folderGroups[folder] = [];
          }
          folderGroups[folder].push(f);
        });

        // Get main folder (with most files)
        const mainFolder = Object.keys(folderGroups).reduce((a, b) =>
          folderGroups[a].length > folderGroups[b].length ? a : b
        );

        // Create bulk download alert
        const alert = await BulkDownloadAlert.create({
          employee_token: employeeToken,
          timestamp: new Date(),
          total_files: recentFiles.length,
          total_size_mb: totalSizeMB,
          risk_level: riskData.riskLevel,
          folder_path: mainFolder,
          status: "New",
          auto_triggered: true,
        });

        // Create active threat
        await ActiveThreat.create({
          alert_date_time: new Date(),
          risk_score: riskData.riskScore,
          alert_type: "bulk",
          employee_token: employeeToken,
          solved: "N",
          original_alert_id: alert._id,
          details: {
            total_files: recentFiles.length,
            total_size_mb: totalSizeMB,
            folder_path: mainFolder,
            reasons: riskData.reasons,
          },
        });

        console.log(
          `🚨 Bulk download alert created for ${employeeToken}: ${recentFiles.length} files, ${totalSizeMB}MB`
        );

        // Clear processed files
        activity.files = [];
      }

      activity.lastCheck = now;
    } catch (error) {
      console.error("Error checking bulk download:", error.message);
    }
  }

  /**
   * Get monitored folder paths
   * @returns {Array} - Array of folder paths
   */
  getMonitoredPaths() {
    const homeDir = os.homedir();
    const paths = [
      path.join(homeDir, "Downloads"),
      path.join(homeDir, "Desktop"),
      path.join(homeDir, "Documents"),
    ];

    // Filter paths that exist
    return paths.filter((p) => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    });
  }

  /**
   * Get current monitoring status
   * @returns {Object}
   */
  getMonitoringStatus() {
    return {
      activeMonitors: this.watchers.size,
      employees: Array.from(this.watchers.keys()),
    };
  }
}

module.exports = new FolderMonitoringService();

