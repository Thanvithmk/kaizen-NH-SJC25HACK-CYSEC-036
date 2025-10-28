# 🚀 Quick Start Guide - Vigilant Guard

Get up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js (need v16+)
node --version

# Check MongoDB (need v5+)
mongod --version

# Check npm
npm --version
```

## Installation Steps

### 1️⃣ Start MongoDB

```bash
# Windows
mongod

# macOS/Linux
sudo mongod
```

Keep this terminal open.

### 2️⃣ Setup Backend

Open a new terminal:

```bash
cd backend

# Install dependencies
npm install

# Seed database with sample employees
npm run seed

# Start backend server
npm run dev
```

You should see:

```
✅ MongoDB Connected
✅ Server running on port 5000
```

### 3️⃣ Setup Frontend

Open another terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start React app
npm start
```

Browser will auto-open to `http://localhost:3000`

## 🎉 First Login

1. Dashboard will open automatically
2. Use demo credentials:
   - **Employee Token**: `EMP001`
   - **Password**: (leave empty)
3. Click "Sign In"

## 📊 Explore the Dashboard

You should now see:

- ✅ Active Users: 3
- ✅ Stats Cards
- ✅ Recent Alerts Table
- ✅ High Risk Employees
- ✅ Alert Distribution Chart

## 🧪 Test the System

### Test 1: Login Detection

1. Logout from dashboard
2. Login again with `EMP002`
3. Check "Recent Alerts" for login activity

### Test 2: Create Sample Alerts

Open a new terminal and run:

```bash
cd backend
node -e "
const mongoose = require('mongoose');
const ActiveThreat = require('./models/ActiveThreat');

mongoose.connect('mongodb://localhost:27017/threat_detection')
  .then(async () => {
    await ActiveThreat.create({
      alert_date_time: new Date(),
      risk_score: 65,
      alert_type: 'login',
      employee_token: 'EMP001',
      solved: 'N',
      original_alert_id: new mongoose.Types.ObjectId(),
      details: { test: true }
    });
    console.log('✅ Test alert created!');
    process.exit(0);
  });
"
```

Dashboard will auto-update with the new alert!

### Test 3: File Monitoring

1. Login to dashboard with `EMP001`
2. Download 35+ files to your Downloads folder
3. Wait 30 seconds
4. Check dashboard for bulk download alert

## 🎯 Default Credentials

After running `npm run seed`, you have these employees:

| Token  | Name           | City          |
| ------ | -------------- | ------------- |
| EMP001 | John Smith     | New York      |
| EMP002 | Sarah Johnson  | San Francisco |
| EMP003 | Michael Chen   | New York      |
| EMP004 | Emily Davis    | London        |
| EMP005 | David Martinez | New York      |

## 🔧 Troubleshooting

### MongoDB Won't Start

```bash
# Check if already running
ps aux | grep mongod

# Kill existing process
killall mongod

# Start again
mongod
```

### Port 5000 Already in Use

```bash
# Backend: Edit backend/.env
PORT=5001

# Update frontend/.env
REACT_APP_API_URL=http://localhost:5001/api
```

### Port 3000 Already in Use

```bash
# Frontend will ask if you want to use port 3001
# Type 'y' and press Enter
```

### Can't Connect to Backend

1. Check backend terminal for errors
2. Verify MongoDB is running
3. Check `.env` files exist in both folders

## 📖 Next Steps

1. Read full [README.md](README.md) for detailed documentation
2. Explore API endpoints at `http://localhost:5000/api`
3. Check [Detection Rules](README.md#detection-rules)
4. Customize risk scoring in `backend/utils/ruleEngine.js`

## 🆘 Need Help?

Common issues:

- **"Cannot connect to MongoDB"**: Start MongoDB first
- **"Port already in use"**: Change port in .env
- **"Module not found"**: Run `npm install` again
- **"Token is not valid"**: Logout and login again

## 🎊 Success!

You now have a fully functional Insider Threat Detection System running locally!

**What you can do:**

- ✅ Monitor employee logins
- ✅ Track file downloads
- ✅ Detect geographic anomalies
- ✅ View real-time alerts
- ✅ Manage threat responses

Enjoy exploring Vigilant Guard! 🛡️

