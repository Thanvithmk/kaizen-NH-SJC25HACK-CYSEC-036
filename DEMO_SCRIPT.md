# 🎬 Vigilant Guard - Live Demo Script

## 🎯 Demo Objective

Showcase real-time insider threat detection with synchronized dual frontends demonstrating instant threat detection, analysis, and alerting.

**Duration:** 5-10 minutes  
**Difficulty:** Easy  
**Wow Factor:** ⭐⭐⭐⭐⭐

---

## 📋 Pre-Demo Checklist

### ✅ Before the Demo

1. **Install Dependencies**

   ```bash
   npm run install-all
   ```

2. **Verify MongoDB is Running**

   ```bash
   # Windows
   mongod

   # Or use MongoDB Atlas connection string
   ```

3. **Seed Database (Optional)**

   ```bash
   npm run seed
   ```

4. **Start All Services**

   ```bash
   npm run dev
   ```

5. **Prepare Browser Windows**
   - Open two browser windows side-by-side
   - Left: Security Dashboard (`http://localhost:3000`)
   - Right: Employee Portal (`http://localhost:3001`)
   - Zoom to 80-90% for better visibility

---

## 🎭 Demo Script

### **Act 1: Introduction (1 min)**

**What to Say:**

> "Today I'll show you Vigilant Guard, an intelligent insider threat detection system. What makes this special is its real-time detection capabilities. I have two interfaces here:
>
> On the LEFT - The Security Dashboard where security teams monitor threats
>
> On the RIGHT - An Employee Simulation Portal that mimics real employee activities
>
> Watch how threats detected on the right instantly appear on the left."

**What to Do:**

1. Point to both screens
2. Show the Security Dashboard login (use `EMP001`)
3. Point out the Employee Portal with its threat simulation buttons

---

### **Act 2: Login Anomaly Detection (2 min)**

**What to Say:**

> "Let's start with Login Anomaly Detection. This detects suspicious login patterns like failed attempts or odd-hour access.
>
> I'll simulate a failed login attempt..."

**What to Do:**

1. Click **"Failed Login Attempts"** on Employee Portal
2. **Wait 1-2 seconds**
3. Point to Security Dashboard:
   - New alert appears in the alerts table
   - Statistics update automatically
   - Toast notification appears
   - Risk score increases

**What to Say:**

> "Notice how it appeared instantly! The system detected multiple failed login attempts, analyzed the risk, and immediately alerted the security team."

**Extra Points:**

- Click **"Odd-Hour Login (2:30 AM)"**
- Show the timestamp in the alert
- Explain: "The system knows this employee doesn't normally work at 2:30 AM"

---

### **Act 3: Bulk Download Detection (2 min)**

**What to Say:**

> "Now let's simulate data exfiltration - a common insider threat. An employee downloading unusually large amounts of data."

**What to Do:**

1. Click **"Large Files (5 GB)"** on Employee Portal
2. **Immediately** point to Security Dashboard
3. Show the new "Bulk Download" alert appearing

**What to Say:**

> "The system detected 5 gigabytes downloaded - far above this employee's normal pattern of 50 megabytes. It's flagged as HIGH RISK and requires immediate attention."

**Extra Points:**

- Show the "Many Files (500 files)" simulation
- Explain: "This could indicate someone stealing documents before leaving the company"

---

### **Act 4: Geographic Anomaly Detection (2 min)**

**What to Say:**

> "The most impressive feature - geographic anomaly detection. This catches impossible travel and access from high-risk countries.
>
> Watch this: I'll simulate a login from Beijing just 30 minutes after a New York login."

**What to Do:**

1. Click **"Impossible Travel (NY → Beijing)"** on Employee Portal
2. **Dramatically point** to Security Dashboard as alert appears
3. Show the alert details

**What to Say:**

> "CRITICAL THREAT! The system calculated it's physically impossible to travel 11,000 kilometers in 30 minutes. This indicates either:
>
> - Account credentials were stolen
> - Multiple people sharing credentials
> - VPN masking
>
> All require immediate investigation."

**Extra Points:**

- Try **"High-Risk Country Access"**
- Explain: "Access from sanctioned countries is automatically flagged"

---

### **Act 5: Real-Time Dashboard (1 min)**

**What to Say:**

> "Let's look at what the security team sees in real-time..."

**What to Do:**

1. Point to the Statistics Cards at the top
   - Active Threats count
   - Risk breakdown (High/Medium/Low)
2. Show the Threat Trends chart
3. Show the Network Activity Map
4. Show the User Access Log

**What to Say:**

> "All of this updates in real-time. No refresh needed. The security team has complete visibility with:
>
> - Trend analysis
> - Geographic visualization
> - User behavior tracking
> - Risk scoring
>
> And they can respond immediately to any threat."

---

### **Act 6: Rapid Fire Demo (1 min)**

**What to Say:**

> "Let me show you the speed of this system. I'll trigger multiple threats quickly..."

**What to Do:**

1. Rapidly click 3-4 different threat buttons
2. Watch the Security Dashboard populate with alerts
3. Show the statistics updating in real-time

**What to Say:**

> "Every single threat is captured, analyzed, and presented to the security team within milliseconds. This is the power of real-time threat detection!"

---

### **Act 7: Closing & Q&A (1 min)**

**What to Say:**

> "To summarize, Vigilant Guard provides:
>
> ✅ Real-time threat detection
> ✅ Intelligent risk scoring
> ✅ Multiple detection types (login, download, geographic)
> ✅ Instant alerting
> ✅ Complete audit trail
>
> The dual-frontend architecture I showed you today demonstrates the real-time synchronization, but in production, the employee simulation portal wouldn't exist - threats are detected from actual system events.
>
> Questions?"

---

## 🎨 Pro Tips for Maximum Impact

### Visual Impact

- **Use Dark Mode** - Both interfaces have dark themes that look professional
- **Maximize Windows** - Use full screen for both windows
- **High Contrast** - Use a projector or large monitor
- **Zoom Level** - 80-90% shows more content

### Presentation Tips

- **Pause After Actions** - Give 2 seconds for alerts to appear
- **Point Physically** - Use your hand/cursor to guide attention
- **Vary Your Voice** - Get excited when threats appear
- **Predict Results** - "Watch this..." builds anticipation

### Common Questions & Answers

**Q: How fast is "real-time"?**  
A: Sub-second. Typically 100-300ms from trigger to display.

**Q: Can it handle thousands of employees?**  
A: Yes, MongoDB and Socket.IO scale horizontally.

**Q: What about false positives?**  
A: The risk scoring system helps prioritize. Security teams can mark alerts as resolved.

**Q: Does it read file contents?**  
A: No. Only metadata: file size, count, timestamps.

**Q: How is it different from other solutions?**  
A: Three-dimensional threat detection (behavior + location + data movement) with real-time response.

---

## 🐛 Troubleshooting During Demo

### Problem: No Alerts Appearing

**Quick Fix:**

1. Check connection status (top-right of Employee Portal)
2. Refresh Security Dashboard (F5)
3. Check browser console (F12)
4. Verify backend is running

### Problem: Ports Occupied

**Quick Fix:**

```bash
# Kill processes on specific ports
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux
lsof -i :3000
kill -9 [PID]
```

### Problem: MongoDB Not Connected

**Quick Fix:**

1. Check MongoDB service is running
2. Verify connection string in `.env`
3. Use MongoDB Atlas as backup

---

## 📊 Demo Variations

### **Short Demo (3 min)**

1. Introduction (30 sec)
2. One threat type demo (1 min)
3. Show dashboard (1 min)
4. Closing (30 sec)

### **Technical Demo (15 min)**

- Add code walkthrough
- Show database collections
- Explain Socket.IO architecture
- Demonstrate API endpoints with Postman
- Show MongoDB data

### **Executive Demo (5 min)**

- Focus on business value
- Show ROI metrics
- Emphasize risk reduction
- Skip technical details
- Focus on UI/UX

---

## 🎥 Recording Tips

### For Screen Recording

1. Use **OBS Studio** or **Loom**
2. Record at **1920x1080** resolution
3. **Enable microphone**
4. **Disable desktop notifications**
5. **Close unnecessary browser tabs**

### For Live Presentations

1. **Test beforehand** on the actual network
2. **Have backup screenshots** of key screens
3. **Use a wired internet connection**
4. **Close Slack, email, etc.**
5. **Disable Windows Update notifications**

---

## 🌟 Advanced Demo Features

### Show Code (If Technical Audience)

- Open `backend/routes/simulationRoutes.js`
- Show rule engine in `backend/utils/ruleEngine.js`
- Show Socket.IO emit in backend

### Show Database

- Open MongoDB Compass
- Show `activethreats` collection populating
- Show indexes and performance

### Show API

- Use Thunder Client or Postman
- Call `/api/simulation/stats`
- Show JSON response

---

## 📝 Post-Demo Follow-Up

### Materials to Share

- Link to GitHub repository
- This DEMO_SCRIPT.md
- DUAL_FRONTEND_GUIDE.md
- Architecture diagrams
- Setup instructions

### Call to Action

- Schedule technical deep-dive
- Provide trial access
- Share documentation
- Request feedback

---

**Break a leg! 🎬 You've got this! 🚀**
