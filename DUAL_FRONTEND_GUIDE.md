# 🎭 Dual Frontend Architecture Guide

## Overview

Vigilant Guard now features **TWO separate frontends** to demonstrate real-time threat detection synchronization:

### 1. 🛡️ Security Dashboard (Port 3000)

**For: Security Team / Administrators**

- Real-time threat monitoring
- Alert management system
- Risk scoring and analysis
- Employee behavior tracking
- Geographic threat visualization

### 2. 👤 Employee Simulation Portal (Port 3001)

**For: Demonstrations / Testing**

- Simulate login anomalies
- Trigger bulk download alerts
- Generate geographic threats
- Real-time sync with Security Dashboard
- Live statistics

---

## 🚀 Quick Start

### Install All Dependencies

```bash
npm run install-all
```

### Run Both Frontends Simultaneously

```bash
# Start backend + both frontends
npm run dev

# Backend: http://localhost:5000
# Security Dashboard: http://localhost:3000
# Employee Portal: http://localhost:3001
```

### Run Individually

```bash
# Security Dashboard only
npm run dev-security

# Employee Portal only
npm run dev-employee
```

---

## 📋 Step-by-Step Demo Instructions

### Step 1: Start All Services

```bash
npm run dev
```

### Step 2: Open Security Dashboard

1. Navigate to `http://localhost:3000`
2. Login with credentials:
   - Employee Token: `EMP001` (or any token)
   - Password: (leave empty for demo)

### Step 3: Open Employee Portal

1. Navigate to `http://localhost:3001` in a **new browser window**
2. Keep both windows visible side-by-side

### Step 4: Simulate Threats

In the **Employee Portal**, click any threat simulation button:

#### 🔐 Login Threats

- **Failed Login Attempts** - Triggers multiple failed login alerts
- **Odd-Hour Login (2:30 AM)** - Login at suspicious time
- **Rapid Login Attempts** - Multiple logins in quick succession

#### 📦 Bulk Download Threats

- **Large Files (5 GB)** - Single large file download
- **Many Files (500 files)** - Unusual volume of files
- **Odd-Hour Download (3:00 AM)** - Downloads at suspicious time

#### 🌍 Geographic Threats

- **Impossible Travel (NY → Beijing)** - Login from distant location too quickly
- **High-Risk Country Access** - Access from sanctioned country
- **New Location (Russia)** - First-time access from new region

### Step 5: Watch Real-Time Sync

✅ Immediately after clicking a threat button:

1. **Employee Portal** shows success notification
2. **Security Dashboard** receives real-time alert
3. Statistics update automatically on both screens
4. New threat appears in alerts table

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Backend (Port 5000)                │
│  ┌───────────────────────────────────────────┐  │
│  │         Socket.IO Server                  │  │
│  │  (Real-time bidirectional communication) │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │    REST API Endpoints                     │  │
│  │  /api/simulation/* - Threat simulation    │  │
│  │  /api/alerts/* - Alert management         │  │
│  │  /api/dashboard/* - Stats & monitoring    │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         ↓ Socket.IO ↓              ↓ Socket.IO ↓
┌─────────────────────┐    ┌─────────────────────┐
│  Security Dashboard │    │   Employee Portal   │
│   (Port 3000)       │    │    (Port 3001)      │
├─────────────────────┤    ├─────────────────────┤
│ • Monitor threats   │    │ • Simulate threats  │
│ • Manage alerts     │    │ • Trigger events    │
│ • View analytics    │    │ • Live statistics   │
│ • Real-time updates │    │ • Connection status │
└─────────────────────┘    └─────────────────────┘
```

---

## 🔌 Real-Time Synchronization Flow

```
Employee Portal                Backend              Security Dashboard
     │                           │                          │
     │   POST /api/simulation/   │                          │
     │──────────────────────────>│                          │
     │                           │                          │
     │                      Create Threat                   │
     │                      Save to MongoDB                 │
     │                           │                          │
     │       200 OK              │                          │
     │<──────────────────────────│                          │
     │                           │                          │
     │   Success Toast ✅        │   Socket: 'new_threat'   │
     │                           │─────────────────────────>│
     │                           │                          │
     │                           │              Alert Appears in Dashboard
     │                           │              Stats Update
     │                           │              Toast Notification
     │                           │                          │
```

---

## 🎨 Frontend Comparison

| Feature             | Security Dashboard     | Employee Portal         |
| ------------------- | ---------------------- | ----------------------- |
| **Primary Purpose** | Monitoring & Response  | Simulation & Testing    |
| **User Role**       | Security Team          | Demo / Testing          |
| **Port**            | 3000                   | 3001                    |
| **Theme**           | Purple/Dark            | Blue/Dark               |
| **Main Actions**    | View, Resolve, Analyze | Simulate, Trigger, Test |
| **Socket.IO Role**  | Listener (Receives)    | Emitter (Triggers)      |
| **Authentication**  | Required               | Not Required            |

---

## 📡 API Endpoints (Simulation)

### POST `/api/simulation/login-threat`

Simulate login anomaly

```json
{
  "employee_token": "EMP999",
  "threat_type": "failed_attempts" | "odd_hours" | "rapid_succession"
}
```

### POST `/api/simulation/bulk-download-threat`

Simulate bulk download

```json
{
  "employee_token": "EMP999",
  "threat_type": "large_files" | "many_files" | "odd_hours"
}
```

### POST `/api/simulation/geographic-threat`

Simulate geographic anomaly

```json
{
  "employee_token": "EMP999",
  "threat_type": "impossible_travel" | "high_risk_country" | "new_location"
}
```

### GET `/api/simulation/stats`

Get simulation statistics

```json
{
  "success": true,
  "stats": {
    "total": 150,
    "login": 50,
    "bulkDownload": 60,
    "geographic": 40
  }
}
```

---

## 🔧 Configuration

### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vigilantguard

# CORS for both frontends
CLIENT_URL=http://localhost:3000
```

### Security Dashboard

- Runs on port **3000** (default React port)
- Connects to backend at `http://localhost:5000`

### Employee Portal

- Runs on port **3001** (configured in package.json)
- Connects to backend at `http://localhost:5000`

---

## 🎯 Use Cases

### 1. **Live Demonstration**

- Open both frontends side-by-side
- Show clients/stakeholders real-time threat detection
- Demonstrate system responsiveness

### 2. **System Testing**

- Trigger various threat scenarios
- Verify alert generation
- Test rule engine logic

### 3. **Training**

- Train security teams on threat patterns
- Simulate incident response scenarios
- Practice alert triage

### 4. **Development**

- Test new threat detection rules
- Verify Socket.IO connections
- Debug real-time features

---

## 🐛 Troubleshooting

### Issue: No Real-Time Updates

**Solution:**

1. Check Socket.IO connection status (top-right in Employee Portal)
2. Verify backend is running on port 5000
3. Check browser console for connection errors
4. Ensure CORS is properly configured

### Issue: Threats Not Appearing

**Solution:**

1. Verify MongoDB is running
2. Check backend logs for errors
3. Ensure employee token is valid
4. Refresh Security Dashboard

### Issue: Port Already in Use

**Solution:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

---

## 📦 Build for Production

### Build Both Frontends

```bash
npm run build-security
npm run build-employee
```

### Deploy Separately

- Security Dashboard → `frontend/build`
- Employee Portal → `employee-portal/build`

---

## 🌟 Features Showcase

### Real-Time Features

- ✅ Instant threat notifications
- ✅ Live statistics updates
- ✅ WebSocket bidirectional communication
- ✅ Connection status indicators

### Security Dashboard

- ✅ Threat trends visualization
- ✅ Network activity map
- ✅ User access logs
- ✅ Alert distribution chart
- ✅ Risk scoring system

### Employee Portal

- ✅ One-click threat simulation
- ✅ Multiple threat types
- ✅ Live statistics tracking
- ✅ Connection monitoring
- ✅ Toast notifications

---

## 📝 Notes

- Both frontends share the same backend API
- Employee Portal does not require authentication
- All simulated threats are stored in MongoDB
- Real-time sync works across all connected clients
- Each frontend has its own independent styling/theme

---

## 🎥 Demo Script

**Perfect for presentations:**

1. Start: `npm run dev`
2. Open Security Dashboard (3000) and Employee Portal (3001)
3. Log into Security Dashboard
4. In Employee Portal: "Watch as I simulate a threat..."
5. Click any threat button
6. Point to Security Dashboard: "Notice it appears instantly!"
7. Show statistics updating in real-time
8. Demonstrate multiple threat types
9. Show alert details and resolution flow

---

## 🤝 Contributing

When adding new threat types:

1. Add backend endpoint in `routes/simulationRoutes.js`
2. Update Employee Portal UI with new button
3. Ensure Socket.IO emits the alert
4. Update Security Dashboard to display new threat type

---

**Enjoy demonstrating real-time insider threat detection! 🎉**
