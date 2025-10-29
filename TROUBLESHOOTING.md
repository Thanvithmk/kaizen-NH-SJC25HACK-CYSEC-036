# Troubleshooting Guide - "Failed to Fetch" Error

## Common Issue: Frontend Can't Connect to Backend

---

## ✅ Quick Checklist

Before diving into detailed troubleshooting, verify:

- [ ] Backend server is running on port 5000
- [ ] MongoDB is running and connected
- [ ] Frontend is running on port 3001 (dashboard) or 3000 (employee portal)
- [ ] No firewall blocking ports
- [ ] `.env` file exists in backend folder

---

## 🔧 Step-by-Step Solutions

### Solution 1: Start the Backend Server

The most common cause is the backend server not running.

```bash
# Terminal 1 - Start Backend
cd backend
npm install
npm start
```

**Expected Output:**

```
╔════════════════════════════════════════════════════════╗
║   Vigilant Guard - Insider Threat Detection System    ║
╚════════════════════════════════════════════════════════╝

🚀 Server running on port 5000
📊 Dashboard API: http://localhost:5000/api/dashboard/stats
🔒 Auth API: http://localhost:5000/api/auth
⚡ WebSocket: Enabled for real-time updates

✅ MongoDB Connected Successfully!
```

**If you see errors:**

- ❌ "Cannot find module" → Run `npm install`
- ❌ "MongoDB connection failed" → See Solution 2
- ❌ "Port 5000 in use" → See Solution 3

---

### Solution 2: Check MongoDB Connection

**Option A: Using MongoDB Atlas (Cloud)**

1. Check your `.env` file in the `backend` folder:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/vigilantguard?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_secret_key_here_change_this_in_production
NODE_ENV=development
```

2. Verify MongoDB Atlas connection:
   - Go to https://cloud.mongodb.com
   - Check if your cluster is running
   - Verify your IP is whitelisted (0.0.0.0/0 for development)
   - Test connection string

**Option B: Using Local MongoDB**

1. Install MongoDB locally
2. Start MongoDB:

```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

3. Update `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/vigilantguard
```

**Test MongoDB Connection:**

```bash
cd backend
node -e "require('./config/database')();"
```

---

### Solution 3: Check Port Conflicts

**Check if port 5000 is in use:**

```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

**If port is in use, kill the process or change port:**

```env
# In backend/.env
PORT=5001
```

Then update frontend API URL:

```env
# In frontend/.env
REACT_APP_API_URL=http://localhost:5001/api
```

---

### Solution 4: Test Backend API

**Test if backend is responding:**

Open browser and visit:

```
http://localhost:5000/api/health
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-29T...",
  "uptime": 123.45
}
```

**If you get an error:**

- ❌ "Cannot connect" → Backend not running (Solution 1)
- ❌ "CORS error" → See Solution 5
- ❌ "500 error" → Check MongoDB (Solution 2)

---

### Solution 5: Fix CORS Issues

CORS should already be configured, but verify:

**Check `backend/server.js` has:**

```javascript
const cors = require("cors");
app.use(cors());
```

**If still having issues, try explicit CORS:**

```javascript
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
```

---

### Solution 6: Check Frontend Configuration

**Verify frontend is using correct API URL:**

`frontend/src/services/api.js`:

```javascript
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
```

**Create `.env` file in `frontend` folder (if doesn't exist):**

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Restart frontend after changing .env:**

```bash
cd frontend
npm start
```

---

### Solution 7: Clear Cache and Restart

Sometimes cached data causes issues:

```bash
# 1. Stop all servers (Ctrl+C in terminals)

# 2. Clear npm cache
cd backend
npm cache clean --force

cd ../frontend
npm cache clean --force

# 3. Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 4. Restart backend
cd ../backend
npm start

# 5. Restart frontend (new terminal)
cd ../frontend
npm start
```

---

## 🧪 Complete Startup Sequence

### Terminal 1: Start MongoDB (if local)

```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### Terminal 2: Start Backend

```bash
cd backend
npm install  # First time only
npm start
```

Wait for:

```
✅ MongoDB Connected Successfully!
🚀 Server running on port 5000
```

### Terminal 3: Start Security Dashboard

```bash
cd frontend
npm install  # First time only
npm start
```

### Terminal 4: Start Employee Portal (optional)

```bash
cd employee-portal
npm install  # First time only
npm start
```

---

## 🔍 Debug Mode

If still having issues, enable debug logging:

**Backend (`backend/server.js`):**

```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});
```

**Frontend - Check Browser Console:**

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Look for errors (red text)
4. Go to Network tab
5. Refresh page
6. Check failed requests (red)
7. Click on failed request to see details

---

## 📊 Verify Each Service

### 1. Backend Health Check

```bash
curl http://localhost:5000/api/health
```

### 2. Dashboard Stats

```bash
curl http://localhost:5000/api/dashboard/stats
```

### 3. Database Connection

```bash
# In backend folder
node -e "
  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected!'))
    .catch(err => console.error('❌ MongoDB Error:', err));
"
```

---

## 🐛 Common Error Messages

### Error: "Failed to fetch"

**Cause:** Frontend can't reach backend
**Solution:** Check if backend is running on port 5000

### Error: "Network Error"

**Cause:** CORS or connection refused
**Solution:** Verify CORS settings and backend is running

### Error: "MongoServerError: Authentication failed"

**Cause:** Wrong MongoDB credentials
**Solution:** Check `.env` file has correct MONGODB_URI

### Error: "Cannot GET /api/dashboard/stats"

**Cause:** Route not found
**Solution:** Check backend routes are properly imported

### Error: "EADDRINUSE: Port 5000 already in use"

**Cause:** Another process using port 5000
**Solution:** Kill process or change PORT in `.env`

---

## 📝 Environment Variables Required

### Backend `.env` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vigilantguard
# Or local: mongodb://localhost:27017/vigilantguard

# Server Configuration
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your_super_secret_key_change_this_in_production

# Optional
SESSION_TIMEOUT_MINUTES=30
```

### Frontend `.env` file (optional):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Employee Portal `.env` file (optional):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## ✅ Working Setup Indicators

When everything is working correctly, you should see:

**Backend Terminal:**

```
✅ MongoDB Connected Successfully!
🚀 Server running on port 5000
📊 Dashboard API: http://localhost:5000/api/dashboard/stats
⚡ WebSocket: Enabled for real-time updates
```

**Frontend Browser Console:**

```
No errors (no red text)
```

**Dashboard Loads:**

- Stats cards show numbers
- User Access Log shows data
- No "failed to fetch" errors

---

## 🆘 Still Having Issues?

1. **Check all logs** in terminal windows
2. **Look at browser console** (F12) for frontend errors
3. **Test API directly** using curl or Postman
4. **Verify MongoDB** is accessible
5. **Check firewall/antivirus** not blocking ports

### Get Help:

- Copy error messages from terminal
- Copy browser console errors
- Note which step fails
- Share `.env` configuration (hide passwords!)

---

## 🚀 Quick Fix Script

Create this file as `start.sh` (Mac/Linux) or `start.bat` (Windows):

**start.bat (Windows):**

```batch
@echo off
echo Starting Vigilant Guard System...

echo.
echo [1/3] Starting Backend Server...
start cmd /k "cd backend && npm start"

timeout /t 5

echo.
echo [2/3] Starting Security Dashboard...
start cmd /k "cd frontend && npm start"

echo.
echo [3/3] Starting Employee Portal...
start cmd /k "cd employee-portal && npm start"

echo.
echo ✅ All services starting!
echo Check terminal windows for status.
```

Run: `start.bat`

---

## 📞 Support Checklist

Before asking for help, gather:

- [ ] Error messages from backend terminal
- [ ] Error messages from frontend browser console
- [ ] Output of `npm --version`
- [ ] Output of `node --version`
- [ ] MongoDB connection method (local/Atlas)
- [ ] Operating system
