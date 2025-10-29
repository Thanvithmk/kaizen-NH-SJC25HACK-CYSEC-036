# Sample Geolocation Verification Data

This document provides sample data configurations for testing the geolocation-based login verification system.

---

## 📋 Sample Employees Configuration

### EMP001 - John Smith (Standard User)

```javascript
{
  emp_token: "EMP001",
  emp_name: "John Smith",
  emp_id: "E001",

  // Verified Locations
  verified_locations: [
    {
      location_type: "Office",
      country: "United States",
      city: "New York",
      ip_ranges: [
        "192.168.1.0/24",    // Office subnet (256 IPs)
        "10.0.0.0/16"        // Corporate VPN (65,536 IPs)
      ],
      is_primary: true,
      verified: true
    },
    {
      location_type: "Home",
      country: "United States",
      city: "Brooklyn",
      ip_ranges: [
        "73.45.123.0/24"     // Home ISP range
      ],
      is_primary: false,
      verified: true
    }
  ],

  // Security Settings
  allowed_countries: ["United States", "Canada"],
  location_verification_enabled: true,
  strict_mode: false
}
```

**Test Scenarios for EMP001:**

- ✅ Login from `192.168.1.100` → **Low Risk** (Office IP)
- ✅ Login from `73.45.123.50` → **Low Risk** (Home IP)
- ⚠️ Login from Toronto, Canada → **Medium Risk** (Allowed country, new city)
- 🚨 Login from Beijing, China → **High Risk** (Unknown location)

---

### EMP002 - Sarah Johnson (Remote Worker)

```javascript
{
  emp_token: "EMP002",
  emp_name: "Sarah Johnson",
  emp_id: "E002",

  verified_locations: [
    {
      location_type: "Home",
      country: "United States",
      city: "San Francisco",
      ip_ranges: [
        "192.168.2.0/24"
      ],
      is_primary: true,
      verified: true
    }
  ],

  allowed_countries: ["United States"],
  location_verification_enabled: true,
  strict_mode: false
}
```

**Test Scenarios for EMP002:**

- ✅ Login from `192.168.2.50` → **Low Risk** (Home IP)
- ⚠️ Login from Los Angeles, USA → **Low Risk** (Same country, different city)
- 🚨 Login from Mexico City, Mexico → **High Risk** (Not in allowed countries)

---

### EMP003 - Michael Chen (Strict Mode)

```javascript
{
  emp_token: "EMP003",
  emp_name: "Michael Chen",
  emp_id: "E003",

  verified_locations: [
    {
      location_type: "Office",
      country: "United States",
      city: "New York",
      ip_ranges: [
        "192.168.1.0/24"
      ],
      is_primary: true,
      verified: true
    }
  ],

  allowed_countries: ["United States"],
  location_verification_enabled: true,
  strict_mode: true  // 🔒 STRICT MODE ENABLED
}
```

**Test Scenarios for EMP003:**

- ✅ Login from `192.168.1.105` → **Low Risk** (Verified IP)
- ❌ **BLOCKED** from `45.123.78.90` → **Critical** (Not in verified range)
- ❌ **BLOCKED** from Chicago, USA → **Critical** (City match but IP not verified)
- ❌ **BLOCKED** from London, UK → **Critical** (Strict mode violation)

---

### EMP004 - Emily Davis (International Worker)

```javascript
{
  emp_token: "EMP004",
  emp_name: "Emily Davis",
  emp_id: "E004",

  verified_locations: [
    {
      location_type: "Office",
      country: "United Kingdom",
      city: "London",
      ip_ranges: [
        "192.168.3.0/24",
        "10.50.0.0/16"
      ],
      is_primary: true,
      verified: true
    },
    {
      location_type: "Home",
      country: "United Kingdom",
      city: "London",
      ip_ranges: [
        "82.45.0.0/16"
      ],
      is_primary: false,
      verified: true
    }
  ],

  allowed_countries: ["United Kingdom", "United States", "France"],
  location_verification_enabled: true,
  strict_mode: false
}
```

**Test Scenarios for EMP004:**

- ✅ Login from `192.168.3.15` → **Low Risk** (Office IP)
- ✅ Login from `82.45.100.50` → **Low Risk** (Home IP)
- ⚠️ Login from Paris, France → **Medium Risk** (Allowed country)
- ⚠️ Login from New York, USA → **Medium Risk** (Allowed country)
- 🚨 Login from Tokyo, Japan → **High Risk** (Not allowed)

---

### EMP005 - David Martinez (Verification Disabled)

```javascript
{
  emp_token: "EMP005",
  emp_name: "David Martinez",
  emp_id: "E005",

  verified_locations: [
    {
      location_type: "Office",
      country: "United States",
      city: "New York",
      ip_ranges: [
        "192.168.1.0/24"
      ],
      is_primary: true,
      verified: true
    }
  ],

  allowed_countries: ["United States", "Mexico"],
  location_verification_enabled: false,  // ⚠️ VERIFICATION DISABLED
  strict_mode: false
}
```

**Test Scenarios for EMP005:**

- ✅ Login from ANY IP → **Low Risk** (Verification disabled)
- ✅ Login from ANY country → **Low Risk** (No checks performed)

---

## 🌍 Sample IP Ranges by Region

### North America

**United States - New York**

```
192.168.1.0/24    (Corporate Office)
10.0.0.0/16       (Corporate VPN)
73.45.123.0/24    (Residential ISP)
```

**United States - San Francisco**

```
192.168.2.0/24    (Home Office)
172.16.0.0/16     (Shared Workspace)
```

**Canada - Toronto**

```
142.58.0.0/16     (Canadian Office)
```

### Europe

**United Kingdom - London**

```
192.168.3.0/24    (UK Office)
10.50.0.0/16      (UK VPN)
82.45.0.0/16      (UK Residential)
```

**France - Paris**

```
185.12.0.0/16     (Paris Office)
```

### Asia

**China - Beijing**

```
45.123.78.0/24    (Suspicious/Unknown)
```

**Japan - Tokyo**

```
203.104.0.0/16    (Tokyo Office)
```

---

## 📊 Sample Login Activities

### Successful Logins (Low Risk)

```javascript
{
  employee_token: "EMP001",
  ip_address: "192.168.1.100",
  city: "New York",
  country: "United States",
  success_status: "Success",
  risk_level: "Low",
  login_timestamp: new Date(),
  logout_timestamp: null  // Still active
}

{
  employee_token: "EMP002",
  ip_address: "192.168.2.50",
  city: "San Francisco",
  country: "United States",
  success_status: "Success",
  risk_level: "Low",
  login_timestamp: new Date()
}
```

### Medium Risk Logins (Allowed but Flagged)

```javascript
{
  employee_token: "EMP004",
  ip_address: "10.50.30.15",
  city: "London",
  country: "United Kingdom",
  success_status: "Success",
  risk_level: "Medium",
  login_timestamp: new Date(),
  // Alert created: "Country in allowed list, new city"
}
```

### High Risk Logins (Unknown Location)

```javascript
{
  employee_token: "EMP003",
  ip_address: "45.123.78.90",
  city: "Unknown",
  country: "Unknown",
  success_status: "Success",
  risk_level: "High",
  login_timestamp: new Date(),
  // Alert created: "Unknown location"
}
```

### Failed Login (Blocked)

```javascript
{
  employee_token: "EMP004",
  ip_address: "10.50.30.20",
  city: "London",
  country: "United Kingdom",
  success_status: "Failed",
  risk_level: "High",
  failed_attempts_count: 3,
  login_timestamp: new Date()
}
```

---

## 🔐 IP Range Examples (CIDR Notation)

### Class C Subnet (/24) - 256 addresses

```
192.168.1.0/24
Range: 192.168.1.0 to 192.168.1.255
Total IPs: 256
Use case: Small office network
```

### Class B Subnet (/16) - 65,536 addresses

```
10.0.0.0/16
Range: 10.0.0.0 to 10.0.255.255
Total IPs: 65,536
Use case: Corporate VPN, large office
```

### Class A Subnet (/8) - 16,777,216 addresses

```
172.16.0.0/8
Range: 172.0.0.0 to 172.255.255.255
Total IPs: 16,777,216
Use case: Enterprise-wide network
```

### Single IP (/32)

```
192.168.1.100/32
Range: Only 192.168.1.100
Total IPs: 1
Use case: Specific workstation
```

---

## 🧪 Testing Commands

### 1. Seed the Database

```bash
cd backend
node utils/seedData.js
```

### 2. Query Employee Locations

```javascript
// MongoDB shell or API
db.employeepatterns.find({ emp_token: "EMP001" })

// Will show:
{
  emp_token: "EMP001",
  verified_locations: [
    { location_type: "Office", country: "United States", ... },
    { location_type: "Home", country: "United States", ... }
  ],
  allowed_countries: ["United States", "Canada"]
}
```

### 3. Check Login Activities

```javascript
db.loginactivities
  .find({ employee_token: "EMP001" })
  .sort({ login_timestamp: -1 })
  .limit(5);
```

### 4. View Geographic Alerts

```javascript
db.geographicalerts.find({ employee_token: "EMP003" });
```

---

## 📈 Creating Custom Test Data

### Add New Verified Location

```javascript
const EmployeePattern = require("./models/EmployeePattern");

const employee = await EmployeePattern.findOne({ emp_token: "EMP001" });

employee.verified_locations.push({
  location_type: "Remote",
  country: "Canada",
  city: "Toronto",
  ip_ranges: ["142.58.0.0/16"],
  is_primary: false,
  verified: true,
  added_date: new Date(),
});

await employee.save();
```

### Add New Allowed Country

```javascript
const employee = await EmployeePattern.findOne({ emp_token: "EMP002" });

employee.allowed_countries.push("Mexico");
await employee.save();
```

### Enable Strict Mode

```javascript
const employee = await EmployeePattern.findOne({ emp_token: "EMP001" });

employee.strict_mode = true;
employee.location_verification_enabled = true;
await employee.save();
```

---

## 🎯 Test Scenario Matrix

| Employee | From Location     | IP Address    | Expected Result     | Risk Level |
| -------- | ----------------- | ------------- | ------------------- | ---------- |
| EMP001   | NYC Office        | 192.168.1.100 | ✅ Allow            | Low        |
| EMP001   | Brooklyn Home     | 73.45.123.50  | ✅ Allow            | Low        |
| EMP001   | Toronto, Canada   | 142.58.1.1    | ✅ Allow + Alert    | Medium     |
| EMP001   | Beijing, China    | 45.123.78.90  | ✅ Allow + Alert    | High       |
| EMP003   | NYC (verified IP) | 192.168.1.105 | ✅ Allow            | Low        |
| EMP003   | NYC (unknown IP)  | 73.45.123.50  | ❌ BLOCK            | Critical   |
| EMP003   | London, UK        | 82.45.100.50  | ❌ BLOCK            | Critical   |
| EMP004   | London Office     | 192.168.3.15  | ✅ Allow            | Low        |
| EMP004   | Paris, France     | 185.12.1.1    | ✅ Allow + Alert    | Medium     |
| EMP004   | Tokyo, Japan      | 203.104.1.1   | ✅ Allow + Alert    | High       |
| EMP005   | Any Location      | Any IP        | ✅ Allow (no check) | Low        |

---

## 📝 Notes

- All passwords are optional in demo mode
- IP geolocation resolution uses ip-api.com (or falls back to "Unknown")
- Login activities are sorted by most recent first
- Active sessions have `logout_timestamp: null`
- Risk levels trigger different alert thresholds:
  - Low: No alert
  - Medium: Risk score 50
  - High: Risk score 75
  - Critical: Risk score 100 + login blocked

---

## 🔗 Related Documentation

- `GEOLOCATION_LOGIN_VERIFICATION.md` - Complete design and analysis
- `GEOLOCATION_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `backend/utils/seedData.js` - Seed script with sample data
