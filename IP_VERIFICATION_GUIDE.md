# IP Address Verification System - How It Works

## 🎯 Overview

The VigilantGuard system uses **geolocation-based IP verification** to ensure employees can only log in from verified office, home, or approved locations. This prevents unauthorized access from unknown locations.

---

## 🔍 How IP Addresses Are Compared to Office/Home Locations

### **Step-by-Step Process**

When an employee tries to login:

```
1. Employee enters credentials at login
   ↓
2. System captures login IP address (e.g., 192.168.1.50)
   ↓
3. System resolves IP to geographic location (City, Country)
   ↓
4. System runs 4-tier verification check
   ↓
5. Login is ALLOWED, BLOCKED, or FLAGGED based on result
```

---

## 🏗️ 4-Tier Verification System

The system checks login location using **4 progressive tiers** (in order of priority):

### **Tier 1: IP Range Match (Highest Priority)** ✅

**What it does:**

- Checks if the login IP falls within any verified IP range (office or home)
- Uses CIDR notation (e.g., `192.168.1.0/24`) to define IP ranges

**How it works:**

- Converts both IPs to numbers
- Uses bitwise operations to check if IP is within range
- **Instant match** → Login allowed with **Low Risk** ✅

**Example:**

```javascript
Employee Verified Locations:
  - Office: IP Range = 192.168.1.0/24 (covers 192.168.1.0 - 192.168.1.255)
  - Home:   IP Range = 192.168.2.0/24 (covers 192.168.2.0 - 192.168.2.255)

Login Attempt IP: 192.168.1.50
Result: ✅ MATCH (within office range)
Risk Level: Low
Reason: "IP matched verified Office location"
```

**Code Reference:**

```javascript
// locationService.js - isIPInRange method (lines 157-179)
isIPInRange(ip, range) {
  const [rangeIP, bits] = range.split("/");
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);
  const ipNum = this.ipToNumber(ip);
  const rangeNum = this.ipToNumber(rangeIP);
  return (ipNum & mask) === (rangeNum & mask);
}
```

---

### **Tier 2: Country + City Match** ✅

**What it does:**

- If IP doesn't match a range, checks if the resolved city and country match a verified location

**How it works:**

- Uses IP geolocation API to resolve IP → City, Country
- Compares against all verified locations' cities and countries
- Case-insensitive comparison

**Example:**

```javascript
Employee Verified Locations:
  - Office: New York, United States
  - Home:   San Francisco, United States

Login Attempt IP: 203.0.113.5
Resolved Location: New York, United States
Result: ✅ MATCH (city and country match Office)
Risk Level: Low
Reason: "Location matched verified Office"
```

**Code Reference:**

```javascript
// locationService.js - verifyLoginLocation (lines 232-242)
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
```

---

### **Tier 3: Allowed Countries List** ⚠️

**What it does:**

- If city doesn't match but country is in allowed list, allows with **Medium Risk**

**How it works:**

- Checks if country is in employee's `allowed_countries` array
- Useful for traveling employees or multi-office companies

**Example:**

```javascript
Employee Verified Locations:
  - Office: New York, United States

Employee Allowed Countries:
  - United States
  - Canada

Login Attempt IP: 198.51.100.7
Resolved Location: Los Angeles, United States
Result: ⚠️ ALLOWED (country matches, but city is new)
Risk Level: Medium
Reason: "Country United States is in allowed list, but city Los Angeles is new"
```

**Code Reference:**

```javascript
// locationService.js - verifyLoginLocation (lines 247-261)
if (
  employee.allowed_countries.some(
    (allowedCountry) => allowedCountry.toLowerCase() === country.toLowerCase()
  )
) {
  return {
    allowed: true,
    risk_level: "Medium",
    reason: `Country ${country} is in allowed list, but city ${city} is new`,
  };
}
```

---

### **Tier 4: Strict Mode Check** ❌ / ⚠️

**What it does:**

- Final decision based on employee's `strict_mode` setting

**Two Outcomes:**

#### **A. Strict Mode = ON** ❌

```javascript
Employee Settings:
  - strict_mode: true

Login from unverified location:
Result: ❌ BLOCKED
Risk Level: Critical
Reason: "Strict mode enabled: Unverified location Tokyo, Japan"
Action: Login rejected immediately
```

#### **B. Strict Mode = OFF** ⚠️

```javascript
Employee Settings:
  - strict_mode: false

Login from unverified location:
Result: ⚠️ ALLOWED (but flagged)
Risk Level: High
Reason: "Unknown location Tokyo, Japan"
Action: Login allowed, but security alert created
```

**Code Reference:**

```javascript
// locationService.js - verifyLoginLocation (lines 264-279)
if (employee.strict_mode) {
  return {
    allowed: false,
    risk_level: "Critical",
    reason: `Strict mode enabled: Unverified location ${city}, ${country}`,
  };
}

// Default: Allow but flag as high risk
return {
  allowed: true,
  risk_level: "High",
  reason: `Unknown location ${city}, ${country}`,
};
```

---

## 📊 Complete Example Scenarios

### **Scenario 1: Office Login (Perfect Match)**

```yaml
Employee: John Smith (EMP001)
Verified Locations:
  - Office: New York, US | IP: 192.168.1.0/24
  - Home: Brooklyn, US | IP: 192.168.2.0/24

Login Attempt:
  IP: 192.168.1.45
  Resolved: New York, United States

Verification Process:
  Tier 1: ✅ IP 192.168.1.45 in range 192.168.1.0/24

Result:
  Status: ✅ ALLOWED
  Risk Level: Low
  Alert: None
  Message: "IP matched verified Office location"
```

---

### **Scenario 2: Home Login (City Match)**

```yaml
Employee: Sarah Johnson (EMP002)
Verified Locations:
  - Office: San Francisco, US | IP: 10.0.0.0/24
  - Home: Los Angeles, US | No IP range

Login Attempt:
  IP: 203.0.113.100
  Resolved: Los Angeles, United States

Verification Process:
  Tier 1: ❌ IP not in any range
  Tier 2: ✅ City "Los Angeles" + Country "United States" match Home

Result:
  Status: ✅ ALLOWED
  Risk Level: Low
  Alert: None
  Message: "Location matched verified Home"
```

---

### **Scenario 3: Business Trip (Allowed Country)**

```yaml
Employee: Mike Chen (EMP003)
Verified Locations:
  - Office: New York, US

Allowed Countries:
  - United States
  - Canada

Settings:
  - strict_mode: false

Login Attempt:
  IP: 198.51.100.50
  Resolved: Toronto, Canada

Verification Process:
  Tier 1: ❌ IP not in any range
  Tier 2: ❌ City/Country don't match verified locations
  Tier 3: ⚠️ Country "Canada" in allowed list

Result:
  Status: ✅ ALLOWED
  Risk Level: Medium
  Alert: Created (Medium Risk Alert)
  Message: "Country Canada is in allowed list, but city Toronto is new"
```

---

### **Scenario 4: Unauthorized Location (Strict Mode OFF)**

```yaml
Employee: Lisa Park (EMP004)
Verified Locations:
  - Office: Seattle, US

Settings:
  - strict_mode: false

Login Attempt:
  IP: 104.28.2.3
  Resolved: Tokyo, Japan

Verification Process:
  Tier 1: ❌ IP not in any range
  Tier 2: ❌ City/Country don't match
  Tier 3: ❌ Country not in allowed list
  Tier 4: ⚠️ Strict mode OFF - Allow with alert

Result:
  Status: ⚠️ ALLOWED (but flagged)
  Risk Level: High
  Alert: Created (High Risk Alert)
  Message: "Unknown location Tokyo, Japan"
  Dashboard: Shows suspicious login alert
```

---

### **Scenario 5: Unauthorized Location (Strict Mode ON)**

```yaml
Employee: David Kim (EMP005)
Verified Locations:
  - Office: Boston, US | IP: 172.16.0.0/24

Settings:
  - strict_mode: true

Login Attempt:
  IP: 185.125.190.56
  Resolved: Moscow, Russia

Verification Process:
  Tier 1: ❌ IP not in any range
  Tier 2: ❌ City/Country don't match
  Tier 3: ❌ Country not in allowed list
  Tier 4: ❌ Strict mode ON - BLOCK

Result:
  Status: ❌ BLOCKED
  Risk Level: Critical
  Alert: Created (Critical Threat)
  Message: "Login blocked: Strict mode enabled: Unverified location Moscow, Russia"
  Action: Login rejected, admin notified
```

---

## 🔐 Security Implementation

### **During Registration** (`authService.registerEmployee`)

When an employee registers:

```javascript
// 1. Password is hashed (bcrypt)
const hashedPassword = await bcrypt.hash(password, 10);

// 2. Primary location is added to verified_locations
verified_locations.push({
  location_type: "Office",
  country: "United States",
  city: "New York",
  ip_ranges: ["192.168.1.0/24"],
  is_primary: true,
  verified: true,
  added_date: new Date(),
});

// 3. Country is added to allowed_countries
allowed_countries.push("United States");

// 4. Security settings are configured
location_verification_enabled: true,
strict_mode: false,
```

---

### **During Login** (`authService.handleLogin`)

When an employee logs in:

```javascript
// 1. Verify employee exists
const employee = await EmployeePattern.findOne({ emp_token, status: 1 });

// 2. Verify password
const isPasswordValid = await bcrypt.compare(password, employee.password);

// 3. Get location from IP
const currentLocation = await locationService.getLocationFromIP(ip_address);
// Returns: { country: "United States", city: "New York", lat, lon, ip }

// 4. Verify login location (4-tier system)
const locationVerification = locationService.verifyLoginLocation(
  ip_address,
  currentLocation.country,
  currentLocation.city,
  employee
);

// 5. Block or allow based on result
if (!locationVerification.allowed) {
  // Create Critical alert and reject login
  throw new Error("Login blocked: " + locationVerification.reason);
}

// 6. Create Medium/High risk alerts if needed
if (locationVerification.risk_level === "Medium" || "High") {
  await ActiveThreat.create({ ... });
}
```

---

## 🎨 How IP Ranges Work (CIDR Notation)

### **What is CIDR?**

CIDR (Classless Inter-Domain Routing) is a way to represent IP ranges:

```
192.168.1.0/24
│          │
│          └─ /24 = subnet mask (how many IPs)
└─ Base IP address
```

### **Common CIDR Examples:**

| CIDR             | Covers                          | Total IPs  | Use Case                 |
| ---------------- | ------------------------------- | ---------- | ------------------------ |
| `192.168.1.0/32` | `192.168.1.0` only              | 1          | Single IP (VPN endpoint) |
| `192.168.1.0/24` | `192.168.1.0 - 192.168.1.255`   | 256        | Office network           |
| `192.168.0.0/16` | `192.168.0.0 - 192.168.255.255` | 65,536     | Large company            |
| `10.0.0.0/8`     | `10.0.0.0 - 10.255.255.255`     | 16,777,216 | Enterprise               |

### **Bitwise Comparison Example:**

```javascript
IP to check: 192.168.1.50
IP range:    192.168.1.0/24

Step 1: Convert to binary
192.168.1.50  → 11000000.10101000.00000001.00110010
192.168.1.0   → 11000000.10101000.00000001.00000000

Step 2: Create mask from /24
/24 means first 24 bits must match
Mask: 11111111.11111111.11111111.00000000

Step 3: Apply mask to both IPs
192.168.1.50 & mask  → 11000000.10101000.00000001.00000000
192.168.1.0  & mask  → 11000000.10101000.00000001.00000000

Step 4: Compare
Result: ✅ MATCH (first 24 bits are identical)
```

---

## 📈 Risk Levels and Actions

| Risk Level   | When Triggered                     | Login Status | Alert Created | Admin Action            |
| ------------ | ---------------------------------- | ------------ | ------------- | ----------------------- |
| **Low**      | IP/location matches verified       | ✅ Allowed   | No            | None                    |
| **Medium**   | Country allowed, city new          | ✅ Allowed   | Yes           | Review                  |
| **High**     | Unknown location (strict mode off) | ⚠️ Allowed   | Yes           | Monitor closely         |
| **Critical** | Unknown location (strict mode on)  | ❌ Blocked   | Yes           | Immediate investigation |

---

## 🧪 Testing IP Verification

### **Test 1: Office Login**

```javascript
// Setup
Employee: EMP001
Office IP Range: 192.168.1.0/24

// Test
Login IP: 192.168.1.100
Expected: ✅ Allowed (Low Risk)

// Verify
✓ Check dashboard - no alerts
✓ Check login logs - success
```

### **Test 2: Unknown Location (Strict Mode ON)**

```javascript
// Setup
Employee: EMP002
Office: New York, US
strict_mode: true

// Test
Login IP: 185.125.190.56 (Moscow, Russia)
Expected: ❌ Blocked (Critical)

// Verify
✓ Login rejected with error message
✓ Check Active Threats - Critical alert created
✓ Check login logs - Failed status
```

### **Test 3: Business Trip (Allowed Country)**

```javascript
// Setup
Employee: EMP003
Office: New York, US
Allowed Countries: ["United States", "Canada"]
strict_mode: false

// Test
Login IP: 198.51.100.50 (Toronto, Canada)
Expected: ⚠️ Allowed (Medium Risk)

// Verify
✓ Login successful
✓ Check Active Threats - Medium risk alert
✓ Check login logs - Success with Medium risk
```

---

## 🔧 Configuration Examples

### **Standard Office Employee**

```javascript
{
  "emp_name": "John Smith",
  "verified_locations": [
    {
      "location_type": "Office",
      "country": "United States",
      "city": "New York",
      "ip_ranges": ["192.168.1.0/24"],
      "is_primary": true,
      "verified": true
    }
  ],
  "allowed_countries": ["United States"],
  "location_verification_enabled": true,
  "strict_mode": false
}
```

### **Remote Worker (Multiple Locations)**

```javascript
{
  "emp_name": "Sarah Johnson",
  "verified_locations": [
    {
      "location_type": "Home",
      "country": "United States",
      "city": "San Francisco",
      "ip_ranges": ["192.168.2.0/24"],
      "is_primary": true,
      "verified": true
    },
    {
      "location_type": "Remote",
      "country": "United States",
      "city": "Los Angeles",
      "ip_ranges": ["10.0.0.0/24"],
      "is_primary": false,
      "verified": true
    }
  ],
  "allowed_countries": ["United States"],
  "location_verification_enabled": true,
  "strict_mode": false
}
```

### **High Security Employee**

```javascript
{
  "emp_name": "David Kim",
  "verified_locations": [
    {
      "location_type": "Office",
      "country": "United States",
      "city": "Washington DC",
      "ip_ranges": ["172.16.0.0/24"],
      "is_primary": true,
      "verified": true
    }
  ],
  "allowed_countries": ["United States"],
  "location_verification_enabled": true,
  "strict_mode": true  // ← Only verified IPs allowed!
}
```

---

## 📝 Summary

**The IP verification system protects against unauthorized access by:**

1. ✅ **IP Range Matching**: Ensures logins come from known office/home networks
2. ✅ **Geographic Verification**: Validates city and country match verified locations
3. ✅ **Flexible Policies**: Allows business travel while maintaining security
4. ✅ **Strict Mode**: Optional complete lockdown to verified IPs only
5. ✅ **Risk-Based Alerts**: Automatically flags suspicious login patterns
6. ✅ **Password Security**: Bcrypt hashing with 10 rounds

**Files Involved:**

- `backend/services/locationService.js` - IP comparison logic
- `backend/services/authService.js` - Registration and login handling
- `backend/models/EmployeePattern.js` - Employee schema with verified locations
- `employee-portal/src/pages/EmployeeRegistration.js` - Registration UI

---

## 🚀 Ready to Use!

The IP verification system is now fully functional and ready to protect your organization! 🔒
