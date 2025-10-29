# Sample Employee Data - Insertion Guide

## 📋 Overview

This guide provides **10 sample employees** with complete geolocation configurations for testing your VigilantGuard system.

---

## 🔐 Employee Credentials

| Employee Token | Name            | Password      | Location Type | City          | Country        | Strict Mode |
| -------------- | --------------- | ------------- | ------------- | ------------- | -------------- | ----------- |
| **EMP001**     | John Smith      | `password123` | Office        | New York      | United States  | ❌ OFF      |
| **EMP002**     | Sarah Johnson   | `password123` | Home          | San Francisco | United States  | ❌ OFF      |
| **EMP003**     | Mike Chen       | `password123` | Hybrid        | Toronto       | Canada         | ❌ OFF      |
| **EMP004**     | Lisa Park       | `password123` | Office        | Seattle       | United States  | ❌ OFF      |
| **EMP005**     | David Kim       | `password123` | Office        | Boston        | United States  | ✅ ON       |
| **EMP006**     | Emma Wilson     | `password123` | Home          | London        | United Kingdom | ❌ OFF      |
| **EMP007**     | Alex Rodriguez  | `password123` | Office        | Los Angeles   | United States  | ❌ OFF      |
| **EMP008**     | Sophia Martinez | `password123` | Hybrid        | Chicago       | United States  | ❌ OFF      |
| **EMP009**     | James Taylor    | `password123` | Office        | Sydney        | Australia      | ✅ ON       |
| **EMP010**     | Olivia Brown    | `password123` | Home          | Austin        | United States  | ❌ OFF      |

> **Note:** All passwords are hashed using bcrypt. The plaintext password is `password123` for all employees.

---

## 🌍 Verified Locations & IP Ranges

### **EMP001 - John Smith (Multi-Location)**

```javascript
Office: New York, US - IP: 192.168.1.0/24
Home:   Brooklyn, US - IP: 192.168.2.0/24
Allowed Countries: United States
```

### **EMP002 - Sarah Johnson (Remote Worker)**

```javascript
Home: San Francisco, US - IP: 10.0.0.0/24
Allowed Countries: United States, Canada
```

### **EMP003 - Mike Chen (Hybrid)**

```javascript
Office: Toronto, CA - IP: 172.16.0.0/24
Home:   Toronto, CA - IP: 192.168.10.0/24
Allowed Countries: Canada, United States
```

### **EMP004 - Lisa Park**

```javascript
Office: Seattle, US - IP: 192.168.50.0/24
Allowed Countries: United States
```

### **EMP005 - David Kim (STRICT MODE)**

```javascript
Office: Boston, US - IP: 172.20.0.0/24
Allowed Countries: United States
⚠️ STRICT MODE: Only verified IPs allowed!
```

### **EMP006 - Emma Wilson (International)**

```javascript
Home: London, UK - IP: 192.168.100.0/24
Allowed Countries: United Kingdom, France, Germany
```

### **EMP007 - Alex Rodriguez**

```javascript
Office: Los Angeles, US - IP: 10.10.0.0/24
Allowed Countries: United States, Mexico
```

### **EMP008 - Sophia Martinez (Hybrid)**

```javascript
Office: Chicago, US - IP: 192.168.200.0/24
Home:   Chicago, US - IP: 192.168.201.0/24
Allowed Countries: United States
```

### **EMP009 - James Taylor (STRICT MODE)**

```javascript
Office: Sydney, AU - IP: 172.30.0.0/24
Allowed Countries: Australia, New Zealand
⚠️ STRICT MODE: Only verified IPs allowed!
```

### **EMP010 - Olivia Brown (No Verification)**

```javascript
Home: Austin, US - No IP Range
Allowed Countries: United States
⚠️ Location verification DISABLED
```

---

## 📥 How to Insert into MongoDB Atlas

### **Method 1: Using MongoDB Compass (Recommended)**

1. **Open MongoDB Compass**
2. **Connect to your MongoDB Atlas cluster**
3. **Navigate to your database** (e.g., `vigilantguard`)
4. **Select the `employeepatterns` collection**
5. **Click "Add Data" → "Insert Document"**
6. **Switch to "JSON" view**
7. **Copy the contents from `SAMPLE_EMPLOYEE_DATA.json`**
8. **Paste and click "Insert"**

### **Method 2: Using MongoDB Atlas Web Interface**

1. **Login to MongoDB Atlas** (https://cloud.mongodb.com)
2. **Click "Browse Collections"**
3. **Select your database → `employeepatterns` collection**
4. **Click "Insert Document"**
5. **Switch to "{}" (JSON view)**
6. **Paste ONE employee object at a time** (Atlas doesn't support bulk insert via UI)
7. **Click "Insert"**

### **Method 3: Using MongoDB Shell (mongosh)**

```bash
# Connect to your Atlas cluster
mongosh "mongodb+srv://your-cluster.mongodb.net/vigilantguard" --username your-username

# Switch to your database
use vigilantguard

# Insert all employees at once
db.employeepatterns.insertMany([
  // Paste the entire content from SAMPLE_EMPLOYEE_DATA.json here
])
```

### **Method 4: Using Node.js Script**

Create a file `insertSampleData.js`:

```javascript
const mongoose = require("mongoose");
const EmployeePattern = require("./backend/models/EmployeePattern");
const sampleData = require("./SAMPLE_EMPLOYEE_DATA.json");

async function insertData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "your-mongodb-uri");
    console.log("Connected to MongoDB");

    // Clear existing data (optional)
    // await EmployeePattern.deleteMany({});
    // console.log('Cleared existing employees');

    // Insert sample data
    const result = await EmployeePattern.insertMany(sampleData);
    console.log(`✅ Inserted ${result.length} employees`);

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

insertData();
```

Run it:

```bash
cd backend
node ../insertSampleData.js
```

---

## 🧪 Testing Scenarios

### **Test 1: Normal Office Login (EMP001)**

```bash
# Login from verified office IP
Employee: EMP001 (John Smith)
IP Range: 192.168.1.0/24
Test IP: 192.168.1.100

Expected: ✅ Success (Low Risk)
```

### **Test 2: Strict Mode Block (EMP005)**

```bash
# Login from unverified location
Employee: EMP005 (David Kim)
Verified IP: 172.20.0.0/24
Test IP: 203.0.113.5 (different IP)

Expected: ❌ BLOCKED (Strict mode enabled)
```

### **Test 3: Business Travel (EMP002)**

```bash
# Login from allowed country but different city
Employee: EMP002 (Sarah Johnson)
Verified: San Francisco, US
Allowed Countries: United States, Canada
Test Location: Toronto, Canada

Expected: ⚠️ Allowed (Medium Risk Alert)
```

### **Test 4: Multi-Location Employee (EMP008)**

```bash
# Login from home IP
Employee: EMP008 (Sophia Martinez)
Office IP: 192.168.200.0/24
Home IP: 192.168.201.0/24
Test IP: 192.168.201.50

Expected: ✅ Success (Low Risk - Home verified)
```

### **Test 5: No Verification (EMP010)**

```bash
# Login from anywhere
Employee: EMP010 (Olivia Brown)
Verification: DISABLED
Test IP: Any IP

Expected: ✅ Success (No location check)
```

---

## 🔑 Login Examples

### **Using Employee Portal (http://localhost:3000)**

```
Employee Token: EMP001
Password: password123
```

### **Using API (POST /api/employee/login)**

```bash
curl -X POST http://localhost:5000/api/employee/login \
  -H "Content-Type: application/json" \
  -d '{
    "employee_token": "EMP001",
    "password": "password123"
  }'
```

---

## 📊 Data Statistics

| Metric                  | Count                      |
| ----------------------- | -------------------------- |
| Total Employees         | 10                         |
| With Strict Mode        | 2 (EMP005, EMP009)         |
| With Multiple Locations | 3 (EMP001, EMP003, EMP008) |
| Countries Represented   | 5 (US, CA, UK, AU)         |
| With IP Ranges          | 9 (all except EMP010)      |
| Verification Disabled   | 1 (EMP010)                 |

---

## 🎯 Employee Types for Testing

### **Standard Office Worker**

- **EMP001** (John Smith) - Multiple verified locations
- **EMP004** (Lisa Park) - Single office location

### **Remote Workers**

- **EMP002** (Sarah Johnson) - Home only, multiple allowed countries
- **EMP006** (Emma Wilson) - International remote worker
- **EMP010** (Olivia Brown) - No verification enabled

### **Hybrid Workers**

- **EMP003** (Mike Chen) - Office + Home in same city
- **EMP008** (Sophia Martinez) - Office + Home in same city

### **High Security**

- **EMP005** (David Kim) - Strict mode enabled (US)
- **EMP009** (James Taylor) - Strict mode enabled (Australia)

### **International**

- **EMP006** (Emma Wilson) - Based in UK
- **EMP009** (James Taylor) - Based in Australia

---

## 🔧 Modifying Sample Data

### **Change Password**

If you want different passwords, generate new bcrypt hashes:

```javascript
const bcrypt = require("bcrypt");

// Generate hash for "newpassword"
const hash = await bcrypt.hash("newpassword", 10);
console.log(hash);
// Use this hash in the password field
```

### **Change IP Ranges**

Update the `ip_ranges` array:

```javascript
"ip_ranges": ["YOUR_IP_RANGE/24"]
// Example: "192.168.1.0/24", "10.0.0.0/16", etc.
```

### **Add More Verified Locations**

Add to the `verified_locations` array:

```javascript
{
  "location_type": "Remote",
  "country": "United States",
  "city": "Miami",
  "ip_ranges": ["192.168.3.0/24"],
  "is_primary": false,
  "verified": true,
  "added_date": { "$date": "2024-01-25T10:00:00.000Z" }
}
```

---

## ✅ Verification Steps

After inserting the data:

1. **Check MongoDB Atlas**

   ```
   Navigate to Collections → employeepatterns
   Verify 10 documents exist
   ```

2. **Test Login**

   ```
   Visit: http://localhost:3000
   Login with: EMP001 / password123
   Expected: Redirect to files page
   ```

3. **Check Security Dashboard**

   ```
   Visit: http://localhost:3001/dashboard
   Verify employee appears in High Risk Employees section
   ```

4. **Test Geolocation**
   ```
   Login from different IP (if testing locally, use VPN)
   Check Active Threats for alerts
   ```

---

## 🚨 Common Issues

### **Issue: "Duplicate key error"**

**Cause:** Employee tokens already exist in database

**Solution:**

```javascript
// Delete existing employees first
db.employeepatterns.deleteMany({});

// Or delete specific employees
db.employeepatterns.deleteMany({ emp_token: { $in: ["EMP001", "EMP002"] } });
```

### **Issue: "Validation failed"**

**Cause:** Missing required fields or incorrect format

**Solution:** Ensure all required fields are present:

- `emp_token` (required, unique)
- `password` (required, min 6 chars)
- Status is `1` (active)

### **Issue: "Cannot login"**

**Cause:** Password mismatch

**Solution:** All sample employees use password: `password123`

---

## 📝 Summary

You now have **10 diverse employee profiles** for comprehensive testing:

✅ **Different location types** (Office, Home, Hybrid)  
✅ **Various security configurations** (Strict mode ON/OFF)  
✅ **Multiple countries** (US, Canada, UK, Australia)  
✅ **IP range variations** (Single, Multiple, None)  
✅ **Different use cases** (Standard, Remote, High Security)

**Ready to insert and test!** 🚀

---

## 🔗 Related Files

- `SAMPLE_EMPLOYEE_DATA.json` - The actual JSON data to insert
- `IP_VERIFICATION_GUIDE.md` - How IP verification works
- `PASSWORD_FIX_SUMMARY.md` - Authentication implementation details
- `EMPLOYEE_REGISTRATION_GUIDE.md` - How to register new employees

---

## 💡 Tips

1. **Start with EMP001** - It has the most comprehensive configuration
2. **Test EMP005 or EMP009** - To see strict mode in action
3. **Use EMP010** - To test when verification is disabled
4. **Try EMP003 or EMP008** - To test hybrid workers with multiple locations

**Have fun testing! 🎉**
