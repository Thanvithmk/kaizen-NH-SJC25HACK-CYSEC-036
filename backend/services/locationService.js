const axios = require("axios");
const ruleEngine = require("../utils/ruleEngine");

class LocationService {
  constructor() {
    this.apiUrl = process.env.IP_API_URL || "http://ip-api.com/json";
    this.cache = new Map(); // Cache location data
    this.cacheTimeout = 3600000; // 1 hour
  }

  /**
   * Get location data from IP address
   * @param {String} ipAddress - IP address to lookup
   * @returns {Object} - Location data
   */
  async getLocationFromIP(ipAddress) {
    // Check cache first
    const cached = this.cache.get(ipAddress);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/${ipAddress}?fields=status,country,city,lat,lon,query`
      );

      if (response.data.status === "success") {
        const locationData = {
          country: response.data.country,
          city: response.data.city,
          lat: response.data.lat,
          lon: response.data.lon,
          ip: response.data.query,
        };

        // Cache the result
        this.cache.set(ipAddress, {
          data: locationData,
          timestamp: Date.now(),
        });

        return locationData;
      }

      throw new Error("IP lookup failed");
    } catch (error) {
      console.error("Error getting location from IP:", error.message);

      // Return default location if API fails
      return {
        country: "Unknown",
        city: "Unknown",
        lat: 0,
        lon: 0,
        ip: ipAddress,
      };
    }
  }

  /**
   * Analyze geographic anomalies
   * @param {Object} currentLogin - Current login data
   * @param {Object} previousLogin - Previous login data
   * @returns {Object|null} - Anomaly data if detected, null otherwise
   */
  async analyzeGeographicAnomaly(currentLogin, previousLogin) {
    try {
      // Get location for current login
      const currentLocation = await this.getLocationFromIP(
        currentLogin.ip_address
      );

      // If no previous login, just store location
      if (!previousLogin || !previousLogin.ip_address) {
        return null;
      }

      // Get location for previous login
      const previousLocation = await this.getLocationFromIP(
        previousLogin.ip_address
      );

      // Check if locations are different
      if (
        currentLocation.city === previousLocation.city &&
        currentLocation.country === previousLocation.country
      ) {
        return null; // Same location, no anomaly
      }

      // Calculate time between logins
      const timeDiff =
        currentLogin.login_timestamp - previousLogin.login_timestamp;
      const hoursBetween = timeDiff / (1000 * 60 * 60);

      // Calculate minimum travel time
      const minTravelTime = ruleEngine.calculateTravelTime(
        previousLocation.city,
        currentLocation.city,
        { lat: previousLocation.lat, lon: previousLocation.lon },
        { lat: currentLocation.lat, lon: currentLocation.lon }
      );

      // Prepare anomaly data
      const anomalyData = {
        current_country: currentLocation.country,
        current_city: currentLocation.city,
        previous_country: previousLocation.country,
        previous_city: previousLocation.city,
        time_between_logins_hours: Math.round(hoursBetween * 10) / 10,
        minimum_travel_time_hours: minTravelTime,
      };

      // Determine anomaly type
      const anomalyType = ruleEngine.determineAnomalyType(anomalyData);

      // Calculate risk
      const riskData = ruleEngine.calculateGeographicRisk({
        ...anomalyData,
        anomaly_type: anomalyType,
        alert_timestamp: currentLogin.login_timestamp,
      });

      return {
        ...anomalyData,
        anomaly_type: anomalyType,
        risk_level: riskData.riskLevel,
        risk_score: riskData.riskScore,
        reasons: riskData.reasons,
      };
    } catch (error) {
      console.error("Error analyzing geographic anomaly:", error.message);
      return null;
    }
  }

  /**
   * Check if location matches employee pattern
   * @param {String} country - Current country
   * @param {String} city - Current city
   * @param {Object} employeePattern - Employee's usual pattern
   * @returns {Boolean}
   */
  matchesEmployeePattern(country, city, employeePattern) {
    if (!employeePattern) return false;

    return employeePattern.country === country && employeePattern.city === city;
  }
}

module.exports = new LocationService();

