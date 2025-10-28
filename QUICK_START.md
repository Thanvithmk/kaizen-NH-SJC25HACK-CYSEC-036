# ⚡ Quick Start - Get Running in 5 Minutes!

## 🎯 Goal

Get Vigilant Guard running with dual frontends to demonstrate real-time threat detection.

---

## 🚀 Super Quick Setup

### 1. Install Everything

```bash
npm run install-all
```

_This installs backend, security dashboard, and employee portal_

### 2. Start MongoDB

```bash
# Windows - Run this in a separate terminal
mongod

# OR use MongoDB Atlas (update backend/.env with your connection string)
```

### 3. Start All Services

```bash
npm run dev
```

**This launches:**

- ✅ Backend API → `http://localhost:5000`
- ✅ Security Dashboard → `http://localhost:3000`
- ✅ Employee Portal → `http://localhost:3001`

---

## 🎭 First Demo (2 minutes)

### Step 1: Open Security Dashboard

1. Go to `http://localhost:3000`
2. Login with: **EMP001** (no password needed)
3. You'll see the monitoring dashboard

### Step 2: Open Employee Portal

1. Open **NEW browser window**
2. Go to `http://localhost:3001`
3. Keep both windows visible side-by-side

### Step 3: Trigger a Threat

1. In Employee Portal, click any red button (e.g., "Failed Login Attempts")
2. **Watch the Security Dashboard**
3. See the alert appear instantly! 🎉

---

## 📂 Project Structure

```
vigilantGuard/
├── backend/                  # Node.js + Express API
│   ├── routes/
│   │   └── simulationRoutes.js  # ⭐ NEW: Threat simulation APIs
│   ├── models/               # MongoDB schemas
│   ├── services/             # Business logic
│   └── server.js             # Main server (Socket.IO enabled)
│
├── frontend/                 # 🛡️ Security Dashboard (Port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js    # ⭐ NEW: Navigation sidebar
│   │   │   ├── ThreatTrends.js  # ⭐ NEW: Line chart
│   │   │   ├── NetworkActivityMap.js  # ⭐ NEW: World map
│   │   │   └── UserAccessLog.js  # ⭐ NEW: Access logs
│   │   └── pages/
│   │       └── Dashboard.js  # ⭐ REDESIGNED: Purple theme
│
└── employee-portal/          # 👤 Simulation Portal (Port 3001)
    ├── src/
    │   ├── pages/
    │   │   └── SimulationPortal.js  # ⭐ NEW: Threat triggers
    │   └── services/
    │       ├── api.js        # API calls
    │       └── socket.js     # Real-time connection
    └── package.json
```

---

## 🎮 Available Commands

```bash
# Install all dependencies (backend + both frontends)
npm run install-all

# Run everything together (RECOMMENDED)
npm run dev

# Run individually
npm run start-backend              # Backend only
npm run start-security-dashboard   # Security Dashboard only
npm run start-employee-portal      # Employee Portal only

# Seed database with sample data
npm run seed

# Build for production
npm run build-security
npm run build-employee
```

---

## 🔌 Ports & URLs

| Service            | Port  | URL                       |
| ------------------ | ----- | ------------------------- |
| Backend API        | 5000  | http://localhost:5000     |
| Security Dashboard | 3000  | http://localhost:3000     |
| Employee Portal    | 3001  | http://localhost:3001     |
| MongoDB            | 27017 | mongodb://localhost:27017 |

---

## 🎨 What's New in This Update?

### ✨ Backend Changes

- ✅ **New Routes:** `/api/simulation/*` for threat triggering
- ✅ **CORS Updated:** Supports both frontends (3000 & 3001)
- ✅ **Socket.IO:** Real-time bidirectional communication

### ✨ Security Dashboard (Redesigned!)

- ✅ **New Purple Theme:** Professional dark purple gradient
- ✅ **Sidebar Navigation:** Modern sidebar with menu items
- ✅ **Threat Trends Chart:** Line chart showing 7-day trends
- ✅ **Network Activity Map:** Animated world map with activity points
- ✅ **User Access Log:** Detailed access logs with download button
- ✅ **Risk Breakdown Cards:** High/Medium/Low risk statistics
- ✅ **Search Bar & User Profile:** Enhanced header

### ✨ Employee Portal (NEW!)

- ✅ **Clean Blue Theme:** Distinct from security dashboard
- ✅ **3 Threat Categories:** Login, Bulk Download, Geographic
- ✅ **9 Simulation Buttons:** Trigger different threat scenarios
- ✅ **Live Statistics:** Real-time threat counters
- ✅ **Connection Status:** Shows Socket.IO connection state
- ✅ **Toast Notifications:** Instant feedback on actions

---

## 🎯 Threat Simulation Options

### 🔐 Login Anomalies

- **Failed Login Attempts** - Multiple failed passwords
- **Odd-Hour Login** - Access at 2:30 AM
- **Rapid Login Attempts** - 5 logins in 5 seconds

### 📦 Bulk Downloads

- **Large Files** - 5 GB download
- **Many Files** - 500 files at once
- **Odd-Hour Download** - Download at 3:00 AM

### 🌍 Geographic Anomalies

- **Impossible Travel** - New York → Beijing in 30 minutes
- **High-Risk Country** - Access from North Korea
- **New Location** - First-time login from Russia

---

## 🔧 Configuration

### Backend `.env` (Required)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vigilantguard
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

### Frontend `.env` (Optional)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Employee Portal `.env` (Optional)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🐛 Common Issues

### Issue: "Port 3000 already in use"

**Solution:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux
lsof -i :3000
kill -9 [PID]
```

### Issue: "Cannot connect to MongoDB"

**Solutions:**

1. Start MongoDB: `mongod`
2. Use MongoDB Atlas (cloud)
3. Check connection string in `backend/.env`

### Issue: "No alerts appearing"

**Solutions:**

1. Check connection status (top-right of Employee Portal - should be green)
2. Refresh Security Dashboard
3. Check browser console (F12) for errors
4. Verify backend is running on port 5000

### Issue: "Module not found"

**Solution:**

```bash
npm run install-all
```

---

## 📖 Learn More

- **[DUAL_FRONTEND_GUIDE.md](DUAL_FRONTEND_GUIDE.md)** - Complete architecture guide
- **[DEMO_SCRIPT.md](DEMO_SCRIPT.md)** - Step-by-step demo instructions
- **[README.md](README.md)** - Full project documentation

---

## 🎬 Ready to Demo?

**Perfect Demo Setup:**

1. Run `npm run dev` ✅
2. Open Security Dashboard (3000) ✅
3. Login with EMP001 ✅
4. Open Employee Portal (3001) in new window ✅
5. Position windows side-by-side ✅
6. Click any threat button ✅
7. Watch magic happen! ✨

---

## 🤝 Need Help?

- Check the browser console (F12)
- Check backend terminal logs
- Verify all services are running
- Review configuration files
- Read the troubleshooting guides

---

**Happy Threat Hunting! 🎯🛡️**
