# Employee Login System - User Guide

## Overview

The Vigilant Guard system now includes a **real employee login system** that tracks login attempts and automatically calculates risk levels based on failed password attempts.

## Features

### 🔐 Login Risk Tracking

- **Low Risk (5 points)**: Successful login with correct password
- **Low-Medium Risk (30 points)**: 2 failed attempts in 30 minutes
- **Medium Risk (50 points)**: 3-4 failed attempts in 30 minutes
- **High Risk (70 points)**: 5+ failed attempts in 30 minutes

### 📊 Real-Time Dashboard Updates

- All login attempts (successful and failed) are logged to the database
- Security dashboard receives real-time updates via WebSocket
- Threats are automatically created based on risk level

### 🔒 Password Security

- Passwords are hashed using bcrypt (10 salt rounds)
- Minimum password length: 6 characters
- Default password for demo users: `password123`

## Test Credentials

| Employee ID | Name          | Password    | Location          |
| ----------- | ------------- | ----------- | ----------------- |
| EMP001      | John Smith    | password123 | New York, US      |
| EMP002      | Sarah Johnson | password123 | Los Angeles, US   |
| EMP003      | Michael Chen  | password123 | San Francisco, US |
| EMP999      | Test User     | password123 | New York, US      |

## How to Use

### 1. Access the Employee Portal

Navigate to: `http://localhost:3001/login`

### 2. Test Normal Login (Low Risk)

```
Employee ID: EMP001
Password: password123
```

✅ Result: Successful login, Low risk alert created

### 3. Test Failed Attempts (Medium/High Risk)

Try logging in with wrong password multiple times:

```
Employee ID: EMP001
Password: wrongpassword  (try 3-5 times)
```

⚠️ Result: Failed login attempts tracked, Medium/High risk alerts created

### 4. View in Security Dashboard

1. Open Security Dashboard at `http://localhost:3000`
2. Login with admin credentials
3. Watch the alerts table update in real-time as employees log in

## API Endpoints

### Employee Login

```http
POST /api/employees/login
Content-Type: application/json

{
  "employeeId": "EMP001",
  "password": "password123",
  "ip_address": "127.0.0.1",
  "location": {
    "country": "United States",
    "city": "New York",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Successful Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "employee": {
    "emp_token": "EMP001",
    "emp_name": "John Smith",
    "emp_id": "EMP001"
  },
  "loginActivity": "64abc123...",
  "riskLevel": "Low"
}
```

**Failed Response (401):**

```json
{
  "success": false,
  "message": "Invalid employee ID or password",
  "failedAttempts": 3,
  "riskLevel": "Medium"
}
```

### Employee Registration

```http
POST /api/employees/register
Content-Type: application/json

{
  "emp_token": "EMP004",
  "emp_name": "Jane Doe",
  "emp_id": "EMP004",
  "password": "securepassword",
  "country": "United States",
  "city": "Boston"
}
```

## Database Schema

### EmployeePattern Model

```javascript
{
  emp_token: String (required, unique, format: EMP###)
  emp_name: String
  emp_id: String
  password: String (required, hashed, min: 6 chars)
  location_type: String (default: "Office")
  ip_range: String
  usual_login_time: String (HH:MM format)
  usual_logout_time: String (HH:MM format)
  country: String
  city: String
  status: Number (0 = inactive, 1 = active)
  timestamps: true (createdAt, updatedAt)
}
```

### LoginActivity Model

```javascript
{
  employee_token: String
  ip_address: String
  login_timestamp: Date
  logout_timestamp: Date
  location: {
    country: String
    city: String
    latitude: Number
    longitude: Number
  }
  success_status: String ("Success" or "Failed")
  failure_reason: String
}
```

### ActiveThreat Model (for login)

```javascript
{
  employee_token: String
  threat_type: "Login Anomaly" or "Login Activity"
  severity_level: "Low", "Medium", or "High"
  risk_score: Number (5-70)
  detected_at: Date
  alert_date_time: Date
  details: {
    ip_address: String
    location: Object
    anomalies: Array
    failed_attempts: Number
    success_status: String
  }
  status: "Active"
  is_resolved: false
}
```

## Running the Seed Script

To create/recreate test employees:

```bash
cd backend
npm run seed:employees
```

This will:

1. Clear all existing employees from the database
2. Create 4 test employees with hashed passwords
3. Display the test credentials

## Security Features

### Password Hashing

- Uses bcryptjs with 10 salt rounds
- Passwords are never stored in plain text
- Password comparison is done securely

### Risk Calculation

The system tracks failed login attempts within a 30-minute window:

```javascript
if (recentFailedAttempts >= 5) {
  riskScore = 70; // HIGH
  severityLevel = "High";
} else if (recentFailedAttempts >= 3) {
  riskScore = 50; // MEDIUM
  severityLevel = "Medium";
} else if (recentFailedAttempts >= 2) {
  riskScore = 30; // LOW-MEDIUM
  severityLevel = "Low";
}
```

### Real-Time Alerts

- Socket.IO emits threats to connected security dashboard
- Threats include detailed information about the login attempt
- Dashboard updates automatically without refresh

## Troubleshooting

### "Employee not found" Error

- Make sure you've run the seed script: `npm run seed:employees`
- Check that the backend is connected to MongoDB
- Verify the employee ID format (must be uppercase, e.g., EMP001)

### "Password field required" Error

- The EmployeePattern schema now requires a password field
- Re-run the seed script to create employees with passwords
- When creating employees via simulation, passwords are auto-generated

### Simulation Buttons Not Working

- Ensure backend server is running on port 5000
- Check browser console for API errors
- Verify the employee token exists in the database

## Next Steps

1. ✅ Test the login system with correct credentials
2. ✅ Test multiple failed attempts to trigger risk alerts
3. ✅ View the alerts in the security dashboard
4. ✅ Simulate other threats (bulk download, geographic)
5. 🔄 Monitor the dashboard for real-time updates

## Demo Flow

1. **Open two browser windows:**

   - Window 1: Employee Portal (http://localhost:3001)
   - Window 2: Security Dashboard (http://localhost:3000)

2. **In Window 1 (Employee Portal):**

   - Try logging in with wrong password 5 times
   - Watch the risk level increase

3. **In Window 2 (Security Dashboard):**

   - Watch alerts appear in real-time
   - See the risk scores and severity levels
   - Monitor the threat trends chart

4. **Finally:**
   - Log in with correct credentials
   - See a "Low" risk alert for successful login
