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

  /**
   * Check if IP address is in a given IP range (CIDR notation)
   * @param {String} ip - IP address to check
   * @param {String} range - IP range in CIDR notation (e.g., "192.168.1.0/24")
   * @returns {Boolean}
   */
  isIPInRange(ip, range) {
    try {
      // Handle direct IP match
      if (ip === range) return true;

      // Parse CIDR notation
      if (!range.includes("/")) {
        // If no CIDR, check exact match
        return ip === range;
      }

      const [rangeIP, bits] = range.split("/");
      const mask = ~(2 ** (32 - parseInt(bits)) - 1);

      const ipNum = this.ipToNumber(ip);
      const rangeNum = this.ipToNumber(rangeIP);

      return (ipNum & mask) === (rangeNum & mask);
    } catch (error) {
      console.error("Error checking IP range:", error.message);
      return false;
    }
  }

  /**
   * Convert IP address to number
   * @param {String} ip - IP address
   * @returns {Number}
   */
  ipToNumber(ip) {
    return (
      ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>>
      0
    );
  }

  /**
   * Verify if login location is allowed for employee
   * @param {String} ip - Login IP address
   * @param {String} country - Resolved country
   * @param {String} city - Resolved city
   * @param {Object} employee - Employee pattern with verified_locations
   * @returns {Object} - Verification result
   */
  verifyLoginLocation(ip, country, city, employee) {
    // Check if location verification is enabled
    if (!employee.location_verification_enabled) {
      return {
        allowed: true,
        risk_level: "Low",
        reason: "Location verification disabled",
        matched_location: null,
      };
    }

    // Check 1: IP Range Match (Highest priority)
    if (employee.verified_locations && employee.verified_locations.length > 0) {
      for (const location of employee.verified_locations) {
        if (!location.verified) continue;

        // Check if IP matches any IP range in this location
        if (location.ip_ranges && location.ip_ranges.length > 0) {
          for (const range of location.ip_ranges) {
            if (this.isIPInRange(ip, range)) {
              return {
                allowed: true,
                risk_level: "Low",
                reason: `IP matched verified ${location.location_type} location`,
                matched_location: location,
              };
            }
          }
        }

        // Check 2: Country + City Match
        if (
          location.country.toLowerCase() === country.toLowerCase() &&
          location.city.toLowerCase() === city.toLowerCase()
        ) {
          return {
            allowed: true,
            risk_level: "Low",
            reason: `Location matched verified ${location.location_type}`,
            matched_location: location,
          };
        }
      }
    }

    // Check 3: Allowed Countries List
    if (employee.allowed_countries && employee.allowed_countries.length > 0) {
      const countryAllowed = employee.allowed_countries.some(
        (allowedCountry) =>
          allowedCountry.toLowerCase() === country.toLowerCase()
      );

      if (countryAllowed) {
        return {
          allowed: true,
          risk_level: "Medium",
          reason: `Country ${country} is in allowed list, but city ${city} is new`,
          matched_location: null,
        };
      }
    }

    // Check 4: Strict Mode
    if (employee.strict_mode) {
      return {
        allowed: false,
        risk_level: "Critical",
        reason: `Strict mode enabled: Unverified location ${city}, ${country}`,
        matched_location: null,
      };
    }

    // Default: Allow but flag as high risk
    return {
      allowed: true,
      risk_level: "High",
      reason: `Unknown location ${city}, ${country}`,
      matched_location: null,
    };
  }
}

module.exports = new LocationService();
