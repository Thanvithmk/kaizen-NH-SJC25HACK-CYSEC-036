const moment = require("moment");

/**
 * Rule Engine for Insider Threat Detection
 * Implements all detection rules and risk scoring
 */

class RuleEngine {
  constructor() {
    // Risk countries list
    this.highRiskCountries = [
      "Russia",
      "North Korea",
      "Iran",
      "China",
      "Pakistan",
    ];

    // Time thresholds
    this.oddHoursStart = 22; // 10 PM
    this.oddHoursEnd = 6; // 6 AM
    this.criticalHoursStart = 1; // 1 AM
    this.criticalHoursEnd = 3; // 3 AM
  }

  /**
   * Calculate risk score for bulk download activity
   * @param {Object} downloadData - Download activity data
   * @returns {Object} - { riskScore, riskLevel, reasons }
   */
  calculateBulkDownloadRisk(downloadData) {
    const { total_files, total_size_mb, timestamp } = downloadData;
    let riskScore = 0;
    const reasons = [];

    // File count scoring
    if (total_files >= 100) {
      riskScore += 40;
      reasons.push("Critical file count (100+ files)");
    } else if (total_files >= 50) {
      riskScore += 30;
      reasons.push("High file count (50+ files)");
    } else if (total_files >= 30) {
      riskScore += 20;
      reasons.push("Medium file count (30+ files)");
    }

    // File size scoring
    if (total_size_mb >= 1000) {
      riskScore += 40;
      reasons.push("Critical download size (1GB+)");
    } else if (total_size_mb >= 500) {
      riskScore += 30;
      reasons.push("High download size (500MB+)");
    } else if (total_size_mb >= 200) {
      riskScore += 25;
      reasons.push("Medium download size (200MB+)");
    }

    // Time-based scoring
    const hour = moment(timestamp).hour();
    if (this.isOddHours(hour)) {
      riskScore += 20;
      reasons.push("Activity during odd hours");
    }

    const riskLevel = this.getRiskLevel(riskScore);

    return { riskScore, riskLevel, reasons };
  }

  /**
   * Calculate risk score for login activity
   * @param {Object} loginData - Login activity data
   * @returns {Object} - { riskScore, riskLevel, reasons }
   */
  calculateLoginRisk(loginData) {
    const {
      failed_attempts_count,
      login_timestamp,
      success_status,
      previousFailedAttempts,
    } = loginData;

    let riskScore = 0;
    const reasons = [];

    // Failed attempts scoring
    if (failed_attempts_count > 10) {
      riskScore += 50;
      reasons.push("Critical failed login attempts (10+)");
    } else if (failed_attempts_count >= 6) {
      riskScore += 35;
      reasons.push("High failed login attempts (6-10)");
    } else if (failed_attempts_count >= 3) {
      riskScore += 25;
      reasons.push("Multiple failed login attempts (3-5)");
    }

    // Failed then success pattern (high risk)
    if (previousFailedAttempts && success_status === "Success") {
      riskScore += 40;
      reasons.push("Successful login after failed attempts");
    }

    // Time-based scoring
    const hour = moment(login_timestamp).hour();
    if (hour >= this.criticalHoursStart && hour <= this.criticalHoursEnd) {
      riskScore += 30;
      reasons.push("Login during critical hours (1-3 AM)");
    } else if (this.isOddHours(hour)) {
      riskScore += 20;
      reasons.push("Login during odd hours (10 PM - 6 AM)");
    }

    const riskLevel = this.getRiskLevel(riskScore);

    return { riskScore, riskLevel, reasons };
  }

  /**
   * Calculate risk score for geographic anomaly
   * @param {Object} geoData - Geographic data
   * @returns {Object} - { riskScore, riskLevel, reasons }
   */
  calculateGeographicRisk(geoData) {
    const {
      current_country,
      anomaly_type,
      time_between_logins_hours,
      minimum_travel_time_hours,
      alert_timestamp,
    } = geoData;

    let riskScore = 0;
    const reasons = [];

    // Anomaly type scoring
    switch (anomaly_type) {
      case "ImpossibleTravel":
        riskScore += 60;
        reasons.push(
          `Impossible travel detected (${time_between_logins_hours}h between logins, ${minimum_travel_time_hours}h minimum travel time)`
        );
        break;

      case "RiskCountry":
        riskScore += 50;
        reasons.push(`Login from high-risk country: ${current_country}`);
        break;

      case "NewCountry":
        riskScore += 30;
        reasons.push(`Login from new country: ${current_country}`);
        break;

      case "SameCountry":
        riskScore += 15;
        reasons.push("Unusual city in same country");
        break;
    }

    // Additional scoring for odd hours + new location
    const hour = moment(alert_timestamp).hour();
    if (
      this.isOddHours(hour) &&
      (anomaly_type === "NewCountry" || anomaly_type === "RiskCountry")
    ) {
      riskScore += 25;
      reasons.push("New location during odd hours");
    }

    const riskLevel = this.getRiskLevel(riskScore);

    return { riskScore, riskLevel, reasons };
  }

  /**
   * Determine if a country is high-risk
   * @param {String} country - Country name
   * @returns {Boolean}
   */
  isHighRiskCountry(country) {
    return this.highRiskCountries.includes(country);
  }

  /**
   * Check if time is during odd hours (10 PM - 6 AM)
   * @param {Number} hour - Hour in 24-hour format
   * @returns {Boolean}
   */
  isOddHours(hour) {
    return hour >= this.oddHoursStart || hour < this.oddHoursEnd;
  }

  /**
   * Convert risk score to risk level
   * @param {Number} score - Risk score (0-100)
   * @returns {String} - Risk level
   */
  getRiskLevel(score) {
    if (score >= 75) return "Critical";
    if (score >= 50) return "High";
    if (score >= 25) return "Medium";
    return "Low";
  }

  /**
   * Calculate travel time between two cities (simplified estimation)
   * @param {String} city1 - Origin city
   * @param {String} city2 - Destination city
   * @param {Object} coords1 - { lat, lon }
   * @param {Object} coords2 - { lat, lon }
   * @returns {Number} - Estimated travel time in hours
   */
  calculateTravelTime(city1, city2, coords1, coords2) {
    if (!coords1 || !coords2) return 0;

    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(
      coords1.lat,
      coords1.lon,
      coords2.lat,
      coords2.lon
    );

    // Estimate travel time (assuming average flight speed + airport time)
    // Average flight speed: 800 km/h
    // Airport time: 2 hours
    const travelTime = distance / 800 + 2;

    return Math.round(travelTime * 10) / 10; // Round to 1 decimal
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param {Number} lat1 - Latitude 1
   * @param {Number} lon1 - Longitude 1
   * @param {Number} lat2 - Latitude 2
   * @param {Number} lon2 - Longitude 2
   * @returns {Number} - Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Convert degrees to radians
   * @param {Number} degrees
   * @returns {Number}
   */
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Determine anomaly type for geographic alert
   * @param {Object} geoData
   * @returns {String}
   */
  determineAnomalyType(geoData) {
    const {
      current_country,
      previous_country,
      current_city,
      previous_city,
      time_between_logins_hours,
      minimum_travel_time_hours,
    } = geoData;

    // Check for impossible travel
    if (
      minimum_travel_time_hours > 0 &&
      time_between_logins_hours < minimum_travel_time_hours * 0.8
    ) {
      return "ImpossibleTravel";
    }

    // Check for high-risk country
    if (this.isHighRiskCountry(current_country)) {
      return "RiskCountry";
    }

    // Check for new country
    if (previous_country && current_country !== previous_country) {
      return "NewCountry";
    }

    // Check for unusual city in same country
    if (current_city !== previous_city) {
      return "SameCountry";
    }

    return "SameCountry";
  }
}

const ruleEngineInstance = new RuleEngine();

// Export wrapper functions for simulation routes compatibility
module.exports = ruleEngineInstance;
module.exports.evaluateLoginActivity = (loginActivity, employeePattern) => {
  const loginData = {
    failed_attempts_count: loginActivity.success_status === "Failed" ? 1 : 0,
    login_timestamp: loginActivity.login_timestamp,
    success_status: loginActivity.success_status,
    previousFailedAttempts: false,
  };

  const result = ruleEngineInstance.calculateLoginRisk(loginData);

  return {
    total_risk_score: result.riskScore,
    severity: result.riskLevel,
    anomalies_detected: result.reasons,
  };
};

module.exports.evaluateBulkDownload = (bulkDownload, employeePattern) => {
  const downloadData = {
    total_files: bulkDownload.file_count,
    total_size_mb: bulkDownload.total_size_mb,
    timestamp: bulkDownload.download_timestamp,
  };

  const result = ruleEngineInstance.calculateBulkDownloadRisk(downloadData);

  return {
    total_risk_score: result.riskScore,
    severity: result.riskLevel,
    anomalies_detected: result.reasons,
  };
};

module.exports.evaluateGeographicAnomaly = (geoAlert, employeePattern) => {
  const geoData = {
    current_country: geoAlert.current_location?.country || "",
    anomaly_type: geoAlert.is_impossible_travel
      ? "ImpossibleTravel"
      : geoAlert.is_high_risk_country
      ? "RiskCountry"
      : "NewCountry",
    time_between_logins_hours: geoAlert.time_difference_hours || 0,
    minimum_travel_time_hours: geoAlert.distance_km / 800 + 2 || 0,
    alert_timestamp: geoAlert.alert_timestamp,
  };

  const result = ruleEngineInstance.calculateGeographicRisk(geoData);

  return {
    total_risk_score: result.riskScore,
    severity: result.riskLevel,
    anomalies_detected: result.reasons,
  };
};
