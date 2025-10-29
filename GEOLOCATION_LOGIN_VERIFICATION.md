# Geolocation-Based Login Verification Analysis

## Current Database Schema Analysis

### 1. **EmployeePattern** Schema

```javascript
{
  emp_token: String (unique, required),
  emp_name: String,
  emp_id: String,
  password: String (required),
  location_type: String (default: "Office"),
  ip_range: String,                    // Single IP range
  country: String,                      // Single country
  city: String,                         // Single city
  usual_login_time: String,
  usual_logout_time: String,
  status: Number (0 or 1)
}
```

**Current Limitation**: Only stores ONE location (country/city/IP range)

### 2. **LoginActivity** Schema

```javascript
{
  employee_token: String (required),
  login_timestamp: Date,
  logout_timestamp: Date,
  ip_address: String,                   // Actual login IP
  city: String,                         // Resolved from IP
  country: String,                      // Resolved from IP
  location: String,                     // Combined location
  success_status: String (Success/Failed),
  failed_attempts_count: Number,
  risk_level: String (Low/Medium/High)
}
```

**Purpose**: Records all login attempts with IP and location data

### 3. **GeographicAlert** Schema

```javascript
{
  employee_token: String (required),
  alert_timestamp: Date,
  current_country: String,
  current_city: String,
  previous_country: String,
  previous_city: String,
  time_between_logins_hours: Number,
  minimum_travel_time_hours: Number,
  anomaly_type: String (SameCountry/ImpossibleTravel/RiskCountry/NewCountry),
  risk_level: String (Low/Medium/High),
  verified: String (Yes/No/Pending)
}
```

**Purpose**: Tracks geographic anomalies and impossible travel scenarios

---

## Proposed Schema Enhancements

### Enhanced EmployeePattern Schema

Add support for multiple verified locations:

```javascript
{
  // ... existing fields ...

  verified_locations: [{
    location_type: String,              // "Office", "Home", "Remote"
    country: String,
    city: String,
    ip_ranges: [String],                // Multiple IP ranges
    is_primary: Boolean,
    verified: Boolean,
    added_date: Date
  }],

  allowed_countries: [String],          // List of approved countries

  location_verification_enabled: {
    type: Boolean,
    default: true
  },

  strict_mode: {                        // Requires exact IP match
    type: Boolean,
    default: false
  }
}
```

---

## Verification Logic Flow

### Login Verification Steps:

```
1. Employee attempts login with IP address
   ↓
2. Resolve IP to Country/City using LocationService
   ↓
3. Check verification rules:

   a) CHECK 1: IP Range Match
      - Does IP match any verified_locations.ip_ranges?
      - If YES → Allow login (Low risk)
      - If NO → Continue to next check

   b) CHECK 2: Country/City Match
      - Does country+city match any verified_locations?
      - If YES → Allow login (Low-Medium risk)
      - If NO → Continue to next check

   c) CHECK 3: Allowed Countries
      - Is country in allowed_countries list?
      - If YES → Allow login (Medium risk, create alert)
      - If NO → Continue to next check

   d) CHECK 4: Strict Mode
      - If strict_mode enabled → BLOCK login
      - If strict_mode disabled → Allow but create High risk alert

4. Record login activity with risk level
   ↓
5. Create alerts/threats based on risk level
   ↓
6. Return login result
```

---

## Implementation Files to Modify

### 1. **backend/models/EmployeePattern.js**

- Add `verified_locations` array field
- Add `allowed_countries` array field
- Add `location_verification_enabled` boolean
- Add `strict_mode` boolean

### 2. **backend/services/authService.js**

- Add `verifyLocationAccess()` method
- Modify `handleLogin()` to check location before allowing login
- Add logic to block/allow based on verification rules

### 3. **backend/services/locationService.js**

- Add `isIPInRange()` method to check IP ranges
- Add `checkLocationVerified()` method
- Enhance `getLocationFromIP()` for better accuracy

### 4. **backend/routes/employeeRoutes.js**

- Add endpoint to manage verified locations: `POST /api/employees/:token/locations`
- Add endpoint to manage allowed countries: `POST /api/employees/:token/allowed-countries`

### 5. **backend/utils/seedData.js**

- Update seed data to include verified_locations for test employees

---

## Risk Level Assignment

| Scenario                               | Risk Level     | Action                             |
| -------------------------------------- | -------------- | ---------------------------------- |
| IP matches verified range              | **Low**        | ✅ Allow - No alert                |
| City+Country matches verified location | **Low-Medium** | ✅ Allow - Informational log       |
| Country in allowed list (new city)     | **Medium**     | ⚠️ Allow - Create monitoring alert |
| Unknown country (strict_mode OFF)      | **High**       | ⚠️ Allow - Create high-risk threat |
| Unknown country (strict_mode ON)       | **Critical**   | ❌ BLOCK - Login denied            |

---

## Example Employee Configuration

```javascript
{
  emp_token: "EMP001",
  emp_name: "John Smith",
  verified_locations: [
    {
      location_type: "Office",
      country: "United States",
      city: "New York",
      ip_ranges: ["192.168.1.0/24", "10.0.0.0/16"],
      is_primary: true,
      verified: true,
      added_date: "2024-01-01"
    },
    {
      location_type: "Home",
      country: "United States",
      city: "Brooklyn",
      ip_ranges: ["73.45.123.0/24"],
      is_primary: false,
      verified: true,
      added_date: "2024-01-15"
    }
  ],
  allowed_countries: ["United States", "Canada", "United Kingdom"],
  location_verification_enabled: true,
  strict_mode: false
}
```

---

## Security Features

### 1. **Multi-Location Support**

- Office location with corporate IP ranges
- Home location with residential IP
- Additional verified locations (e.g., client sites)

### 2. **Country Whitelist**

- Only allow logins from approved countries
- Useful for companies with international operations

### 3. **Strict Mode**

- When enabled: ONLY verified IP ranges allowed
- When disabled: All logins allowed but flagged based on risk

### 4. **Impossible Travel Detection**

- Already implemented in GeographicAlert
- Detects physically impossible location changes

### 5. **Progressive Security**

- First login from new location → Medium risk alert
- Repeated logins from unknown location → Escalate to High risk
- Admin can verify/whitelist new locations

---

## API Endpoints to Add

```javascript
// Add verified location
POST /api/employees/:token/locations
{
  location_type: "Home",
  country: "United States",
  city: "Los Angeles",
  ip_ranges: ["192.168.1.0/24"],
  is_primary: false
}

// Update allowed countries
PUT /api/employees/:token/allowed-countries
{
  countries: ["United States", "Canada", "UK"]
}

// Toggle strict mode
PUT /api/employees/:token/security-settings
{
  strict_mode: true,
  location_verification_enabled: true
}

// Get employee location verification status
GET /api/employees/:token/location-verification
```

---

## Implementation Priority

### Phase 1: Schema Enhancement ✅

1. Update EmployeePattern model
2. Create migration for existing employees

### Phase 2: Verification Logic 🔄

1. Implement location verification in authService
2. Add IP range checking
3. Add country whitelist checking

### Phase 3: API Endpoints 📋

1. Location management endpoints
2. Country whitelist management
3. Security settings endpoints

### Phase 4: Frontend UI 🎨

1. Security dashboard page
2. Location management interface
3. Alert verification interface
