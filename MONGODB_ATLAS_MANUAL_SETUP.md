# MongoDB Atlas Manual Setup Guide

## Adding Geolocation Sample Data to MongoDB Atlas

---

## 📋 Step 1: Access MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Sign in to your account
3. Select your cluster
4. Click **"Browse Collections"** button

---

## 📊 Step 2: Create Database and Collections

### Create Database:
- Database Name: `vigilantguard`

### Create Collections (if they don't exist):
1. `employeepatterns`
2. `loginactivities`
3. `activethreats` (optional)
4. `geographicalerts` (optional)

---

## 👥 Step 3: Insert Employee Documents

Click on `employeepatterns` collection → **Insert Document**

### Employee 1: EMP001 - John Smith (Standard User)

```json
{
  "emp_name": "John Smith",
  "emp_id": "E001",
  "emp_token": "EMP001",
  "password": "$2a$10$YourHashedPasswordHere",
  "location_type": "Office",
  "ip_range": "192.168.1.0/24",
  "usual_login_time": "09:00",
  "usual_logout_time": "17:00",
  "country": "United States",
  "city": "New York",
  "status": 1,
  "verified_locations": [
    {
      "location_type": "Office",
      "country": "United States",
      "city": "New York",
      "ip_ranges": ["192.168.1.0/24", "10.0.0.0/16"],
      "is_primary": true,
      "verified": true,
      "added_date": { "$date": "2024-01-01T00:00:00.000Z" }
    },
    {
      "location_type": "Home",
      "country": "United States",
      "city": "Brooklyn",
      "ip_ranges": ["73.45.123.0/24"],
      "is_primary": false,
      "verified": true,
      "added_date": { "$date": "2024-01-15T00:00:00.000Z" }
    }
  ],
  "allowed_countries": ["United States", "Canada"],
  "location_verification_enabled": true,
  "strict_mode": false,
  "createdAt": { "$date": "2024-10-29T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-10-29T00:00:00.000Z" }
}
```

---

### Employee 2: EMP002 - Sarah Johnson (Remote Worker)

```json
{
  "emp_name": "Sarah Johnson",
  "emp_id": "E002",
  "emp_token": "EMP002",
  "password": "$2a$10$YourHashedPasswordHere",
  "location_type": "Remote",
  "ip_range": "192.168.2.0/24",
  "usual_login_time": "08:30",
  "usual_logout_time": "16:30",
  "country": "United States",
  "city": "San Francisco",
  "status": 1,
  "verified_locations": [
    {
      "location_type": "Home",
      "country": "United States",
      "city": "San Francisco",
      "ip_ranges": ["192.168.2.0/24"],
      "is_primary": true,
      "verified": true,
      "added_date": { "$date": "2024-01-01T00:00:00.000Z" }
    }
  ],
  "allowed_countries": ["United States"],
  "location_verification_enabled": true,
  "strict_mode": false,
  "createdAt": { "$date": "2024-10-29T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-10-29T00:00:00.000Z" }
}
```

---

### Employee 3: EMP003 - Michael Chen (Strict Mode)

```json
{
  "emp_name": "Michael Chen",
  "emp_id": "E003",
  "emp_token": "EMP003",
  "password": "$2a$10$YourHashedPasswordHere",
  "location_type": "Office",
  "ip_range": "192.168.1.0/24",
  "usual_login_time": "09:00",
  "usual_logout_time": "18:00",
  "country": "United States",
  "city": "New York",
  "status": 1,
  "verified_locations": [
    {
      "location_type": "Office",
      "country": "United States",
      "city": "New York",
      "ip_ranges": ["192.168.1.0/24"],
      "is_primary": true,
      "verified": true,
      "added_date": { "$date": "2024-01-01T00:00:00.000Z" }
    }
  ],
  "allowed_countries": ["United States"],
  "location_verification_enabled": true,
  "strict_mode": true,
  "createdAt": { "$date": "2024-10-29T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-10-29T00:00:00.000Z" }
}
```

---

### Employee 4: EMP004 - Emily Davis (International)

```json
{
  "emp_name": "Emily Davis",
  "emp_id": "E004",
  "emp_token": "EMP004",
  "password": "$2a$10$YourHashedPasswordHere",
  "location_type": "Hybrid",
  "ip_range": "192.168.3.0/24",
  "usual_login_time": "10:00",
  "usual_logout_time": "18:00",
  "country": "United Kingdom",
  "city": "London",
  "status": 1,
  "verified_locations": [
    {
      "location_type": "Office",
      "country": "United Kingdom",
      "city": "London",
      "ip_ranges": ["192.168.3.0/24", "10.50.0.0/16"],
      "is_primary": true,
      "verified": true,
      "added_date": { "$date": "2024-01-01T00:00:00.000Z" }
    },
    {
      "location_type": "Home",
      "country": "United Kingdom",
      "city": "London",
      "ip_ranges": ["82.45.0.0/16"],
      "is_primary": false,
      "verified": true,
      "added_date": { "$date": "2024-01-15T00:00:00.000Z" }
    }
  ],
  "allowed_countries": ["United Kingdom", "United States", "France"],
  "location_verification_enabled": true,
  "strict_mode": false,
  "createdAt": { "$date": "2024-10-29T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-10-29T00:00:00.000Z" }
}
```

---

### Employee 5: EMP005 - David Martinez (Verification Disabled)

```json
{
  "emp_name": "David Martinez",
  "emp_id": "E005",
  "emp_token": "EMP005",
  "password": "$2a$10$YourHashedPasswordHere",
  "location_type": "Office",
  "ip_range": "192.168.1.0/24",
  "usual_login_time": "08:00",
  "usual_logout_time": "16:00",
  "country": "United States",
  "city": "New York",
  "status": 1,
  "verified_locations": [
    {
      "location_type": "Office",
      "country": "United States",
      "city": "New York",
      "ip_ranges": ["192.168.1.0/24"],
      "is_primary": true,
      "verified": true,
      "added_date": { "$date": "2024-01-01T00:00:00.000Z" }
    }
  ],
  "allowed_countries": ["United States", "Mexico"],
  "location_verification_enabled": false,
  "strict_mode": false,
  "createdAt": { "$date": "2024-10-29T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-10-29T00:00:00.000Z" }
}
```

---

## 📝 Step 4: Insert Login Activities (Optional)

Click on `loginactivities` collection → **Insert Document**

### Login Activity 1: EMP001 - Active Session

```json
{
  "employee_token": "EMP001",
  "login_timestamp": { "$date": "2024-10-29T10:00:00.000Z" },
  "logout_timestamp": null,
  "ip_address": "192.168.1.100",
  "city": "New York",
  "country": "United States",
  "location": "New York, United States",
  "success_status": "Success",
  "failed_attempts_count": 0,
  "risk_level": "Low",
  "createdAt": { "$date": "2024-10-29T10:00:00.000Z" },
  "updatedAt": { "$date": "2024-10-29T10:00:00.000Z" }
}
```

### Login Activity 2: EMP002 - Active Session

```json
{
  "employee_token": "EMP002",
  "login_timestamp": { "$date": "2024-10-29T09:30:00.000Z" },
  "logout_timestamp": null,
  "ip_address": "192.168.2.50",
  "city": "San Francisco",
  "country": "United States",
  "location": "San Francisco, United States",
  "success_status": "Success",
  "failed_attempts_count": 0,
  "risk_level": "Low",
  "createdAt": { "$date": "2024-10-29T09:30:00.000Z" },
  "updatedAt": { "$date": "2024-10-29T09:30:00.000Z" }
}
```

### Login Activity 3: EMP003 - High Risk

```json
{
  "employee_token": "EMP003",
  "login_timestamp": { "$date": "2024-10-29T08:00:00.000Z" },
  "logout_timestamp": null,
  "ip_address": "45.123.78.90",
  "city": "Unknown",
  "country": "Unknown",
  "location": "Unknown, Unknown",
  "success_status": "Success",
  "failed_attempts_count": 0,
  "risk_level": "High",
  "createdAt": { "$date": "2024-10-29T08:00:00.000Z" },
  "updatedAt": { "$date": "2024-10-29T08:00:00.000Z" }
}
```

### Login Activity 4: EMP004 - Medium Risk

```json
{
  "employee_token": "EMP004",
  "login_timestamp": { "$date": "2024-10-29T07:00:00.000Z" },
  "logout_timestamp": null,
  "ip_address": "10.50.30.15",
  "city": "London",
  "country": "United Kingdom",
  "location": "London, United Kingdom",
  "success_status": "Success",
  "failed_attempts_count": 0,
  "risk_level": "Medium",
  "createdAt": { "$date": "2024-10-29T07:00:00.000Z" },
  "updatedAt": { "$date": "2024-10-29T07:00:00.000Z" }
}
```

### Login Activity 5: EMP001 - Completed Session

```json
{
  "employee_token": "EMP001",
  "login_timestamp": { "$date": "2024-10-28T09:00:00.000Z" },
  "logout_timestamp": { "$date": "2024-10-28T17:00:00.000Z" },
  "ip_address": "192.168.1.100",
  "city": "New York",
  "country": "United States",
  "location": "New York, United States",
  "success_status": "Success",
  "failed_attempts_count": 0,
  "risk_level": "Low",
  "createdAt": { "$date": "2024-10-28T09:00:00.000Z" },
  "updatedAt": { "$date": "2024-10-28T17:00:00.000Z" }
}
```

---

## 🔑 Important: Password Field

**Note:** The `password` field needs to be a bcrypt hash. For demo purposes, you can use:

**Password Hash for "password123":**
```
$2a$10$rOHw.RzJZfHZdEqYwKKGz.7CqJNqZXXfPGvXXv7XbZcXKXXXXXXXX
```

Or you can generate one using this Node.js command:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('password123', 10).then(hash => console.log(hash));"
```

---

## 🎯 Quick Insert All Employees

For faster insertion, you can use MongoDB's **insertMany**:

1. In MongoDB Atlas, go to `employeepatterns` collection
2. Click the **"..."** menu → **"Insert Document"**
3. Switch to **"{  }" JSON view**
4. Paste this array:

```json
[
  {
    "emp_name": "John Smith",
    "emp_id": "E001",
    "emp_token": "EMP001",
    "password": "$2a$10$YourHashedPasswordHere",
    "location_type": "Office",
    "ip_range": "192.168.1.0/24",
    "usual_login_time": "09:00",
    "usual_logout_time": "17:00",
    "country": "United States",
    "city": "New York",
    "status": 1,
    "verified_locations": [
      {
        "location_type": "Office",
        "country": "United States",
        "city": "New York",
        "ip_ranges": ["192.168.1.0/24", "10.0.0.0/16"],
        "is_primary": true,
        "verified": true,
        "added_date": { "$date": "2024-01-01T00:00:00.000Z" }
      },
      {
        "location_type": "Home",
        "country": "United States",
        "city": "Brooklyn",
        "ip_ranges": ["73.45.123.0/24"],
        "is_primary": false,
        "verified": true,
        "added_date": { "$date": "2024-01-15T00:00:00.000Z" }
      }
    ],
    "allowed_countries": ["United States", "Canada"],
    "location_verification_enabled": true,
    "strict_mode": false
  },
  {
    "emp_name": "Sarah Johnson",
    "emp_id": "E002",
    "emp_token": "EMP002",
    "password": "$2a$10$YourHashedPasswordHere",
    "location_type": "Remote",
    "ip_range": "192.168.2.0/24",
    "usual_login_time": "08:30",
    "usual_logout_time": "16:30",
    "country": "United States",
    "city": "San Francisco",
    "status": 1,
    "verified_locations": [
      {
        "location_type": "Home",
        "country": "United States",
        "city": "San Francisco",
        "ip_ranges": ["192.168.2.0/24"],
        "is_primary": true,
        "verified": true,
        "added_date": { "$date": "2024-01-01T00:00:00.000Z" }
      }
    ],
    "allowed_countries": ["United States"],
    "location_verification_enabled": true,
    "strict_mode": false
  },
  {
    "emp_name": "Michael Chen",
    "emp_id": "E003",
    "emp_token": "EMP003",
    "password": "$2a$10$YourHashedPasswordHere",
    "location_type": "Office",
    "ip_range": "192.168.1.0/24",
    "usual_login_time": "09:00",
    "usual_logout_time": "18:00",
    "country": "United States",
    "city": "New York",
    "status": 1,
    "verified_locations": [
      {
        "location_type": "Office",
        "country": "United States",
        "city": "New York",
        "ip_ranges": ["192.168.1.0/24"],
        "is_primary": true,
        "verified": true,
        "added_date": { "$date": "2024-01-01T00:00:00.000Z" }
      }
    ],
    "allowed_countries": ["United States"],
    "location_verification_enabled": true,
    "strict_mode": true
  },
  {
    "emp_name": "Emily Davis",
    "emp_id": "E004",
    "emp_token": "EMP004",
    "password": "$2a$10$YourHashedPasswordHere",
    "location_type": "Hybrid",
    "ip_range": "192.168.3.0/24",
    "usual_login_time": "10:00",
    "usual_logout_time": "18:00",
    "country": "United Kingdom",
    "city": "London",
    "status": 1,
    "verified_locations": [
      {
        "location_type": "Office",
        "country": "United Kingdom",
        "city": "London",
        "ip_ranges": ["192.168.3.0/24", "10.50.0.0/16"],
        "is_primary": true,
        "verified": true,
        "added_date": { "$date": "2024-01-01T00:00:00.000Z" }
      },
      {
        "location_type": "Home",
        "country": "United Kingdom",
        "city": "London",
        "ip_ranges": ["82.45.0.0/16"],
        "is_primary": false,
        "verified": true,
        "added_date": { "$date": "2024-01-15T00:00:00.000Z" }
      }
    ],
    "allowed_countries": ["United Kingdom", "United States", "France"],
    "location_verification_enabled": true,
    "strict_mode": false
  },
  {
    "emp_name": "David Martinez",
    "emp_id": "E005",
    "emp_token": "EMP005",
    "password": "$2a$10$YourHashedPasswordHere",
    "location_type": "Office",
    "ip_range": "192.168.1.0/24",
    "usual_login_time": "08:00",
    "usual_logout_time": "16:00",
    "country": "United States",
    "city": "New York",
    "status": 1,
    "verified_locations": [
      {
        "location_type": "Office",
        "country": "United States",
        "city": "New York",
        "ip_ranges": ["192.168.1.0/24"],
        "is_primary": true,
        "verified": true,
        "added_date": { "$date": "2024-01-01T00:00:00.000Z" }
      }
    ],
    "allowed_countries": ["United States", "Mexico"],
    "location_verification_enabled": false,
    "strict_mode": false
  }
]
```

---

## ✅ Verification Steps

After inserting data:

1. **Count Documents:**
   - employeepatterns: Should have 5 documents
   - loginactivities: Should have 5 documents (if added)

2. **Query Test:**
   ```json
   { "emp_token": "EMP001" }
   ```
   Should return John Smith with verified_locations array

3. **Check Geolocation Fields:**
   - Verify `verified_locations` is an array
   - Verify `allowed_countries` is an array
   - Verify `location_verification_enabled` is boolean
   - Verify `strict_mode` is boolean

---

## 🔍 Sample Queries for Testing

### Find all employees with strict mode enabled:
```json
{ "strict_mode": true }
```

### Find employees with verification disabled:
```json
{ "location_verification_enabled": false }
```

### Find employees allowed in specific country:
```json
{ "allowed_countries": "Canada" }
```

### Find active login sessions (no logout):
```json
{ "logout_timestamp": null, "success_status": "Success" }
```

---

## 📞 Need Help?

If you encounter issues:
- Check JSON syntax (commas, brackets)
- Verify field names match schema
- Make sure arrays use [ ] and objects use { }
- Date fields should use { "$date": "..." } format

**MongoDB Atlas automatically adds:**
- `_id` field (ObjectId)
- `createdAt` and `updatedAt` (if timestamps enabled)

