# 🏗️ Vigilant Guard - System Architecture

## 🎯 High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────┐       ┌────────────────────────┐   │
│  │  🛡️ SECURITY DASHBOARD │       │  👤 EMPLOYEE PORTAL    │   │
│  │    (Port 3000)         │       │     (Port 3001)        │   │
│  │                        │       │                        │   │
│  │  • Monitor Threats     │       │  • Simulate Threats    │   │
│  │  • Manage Alerts       │       │  • Trigger Events      │   │
│  │  • View Analytics      │       │  • Live Stats          │   │
│  │  • Real-time Updates   │       │  • Demo Tool           │   │
│  └────────────────────────┘       └────────────────────────┘   │
│           │                                 │                   │
│           │ Socket.IO                       │ Socket.IO         │
│           │ + REST API                      │ + REST API        │
└───────────┼─────────────────────────────────┼───────────────────┘
            │                                 │
            ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                             │
│                        (Port 5000)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Socket.IO Server (WebSocket)                │  │
│  │          • Real-time bidirectional communication         │  │
│  │          • Broadcasts alerts to all clients              │  │
│  │          • Connection management                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     REST API Routes                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  /api/auth/*           │ Authentication & Login          │  │
│  │  /api/dashboard/*      │ Stats & Monitoring Data         │  │
│  │  /api/alerts/*         │ Alert Management                │  │
│  │  /api/employees/*      │ Employee Data                   │  │
│  │  /api/geographic/*     │ Geographic Data                 │  │
│  │  /api/simulation/*     │ 🆕 Threat Simulation            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Business Logic                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • ruleEngine.js       │ Risk scoring & detection        │  │
│  │  • authService.js      │ Authentication logic            │  │
│  │  • locationService.js  │ Geolocation analysis            │  │
│  │  • folderMonitoring.js │ File system monitoring          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ LoginActivity  │  │ BulkDownload   │  │ GeographicAlert│   │
│  │                │  │ Alert          │  │                │   │
│  │ • Login logs   │  │ • Download logs│  │ • Location data│   │
│  │ • Timestamps   │  │ • File info    │  │ • Travel data  │   │
│  │ • IP addresses │  │ • Size/count   │  │ • Risk flags   │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐                        │
│  │ EmployeePattern│  │ ActiveThreat   │                        │
│  │                │  │                │                        │
│  │ • Baselines    │  │ • Active alerts│                        │
│  │ • Risk scores  │  │ • Consolidated │                        │
│  │ • Patterns     │  │ • Dashboard view│                       │
│  └────────────────┘  └────────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Threat Detection Flow

```
EMPLOYEE PORTAL                    BACKEND                   SECURITY DASHBOARD
     │                               │                              │
     │                               │                              │
     │  1. Employee clicks           │                              │
     │     "Simulate Threat"         │                              │
     │                               │                              │
     ├────── POST Request ──────────>│                              │
     │   /api/simulation/            │                              │
     │   login-threat                │                              │
     │                               │                              │
     │                          2. Validate                         │
     │                             Request                          │
     │                               │                              │
     │                          3. Create                           │
     │                             Threat                           │
     │                               │                              │
     │                          4. Evaluate                         │
     │                             Risk                             │
     │                               │                              │
     │                          5. Save to                          │
     │                             MongoDB                          │
     │                               │                              │
     │<────── 200 OK ────────────────┤                              │
     │   { success: true,            │                              │
     │     threat: {...} }           │                              │
     │                               │                              │
     │  6. Show Success Toast ✅     │                              │
     │     "Threat simulated!"       │                              │
     │                               │                              │
     │  7. Update Local Stats        │                              │
     │                               │                              │
     │                          8. Emit Socket Event               │
     │                               ├──────────────────────────────>│
     │                               │   io.emit('new_threat', {   │
     │                               │     threat: {...}            │
     │                               │   })                         │
     │                               │                              │
     │                               │                   9. Receive Event
     │                               │                              │
     │                               │                  10. Update UI
     │                               │                      • Alert Table
     │                               │                      • Stats Cards
     │                               │                      • Charts
     │                               │                              │
     │                               │                  11. Show Toast 🔔
     │                               │                      "New Threat!"
     │                               │                              │
```

**⏱️ Total Time: < 500ms from click to display!**

---

## 🎨 Frontend Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                    🛡️ SECURITY DASHBOARD                        │
│                        (Port 3000)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PURPOSE:    Monitor and respond to insider threats            │
│  USERS:      Security team, administrators                     │
│  THEME:      Dark purple gradient                              │
│  AUTH:       Required (JWT)                                    │
│                                                                 │
│  COMPONENTS:                                                    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Sidebar        │ Navigation menu                       │   │
│  │ Stats Cards    │ 7 metric cards (Active, High, Med, Low)│  │
│  │ Threat Trends  │ Line chart (7-day history)            │   │
│  │ Activity Map   │ World map with threat locations       │   │
│  │ Access Log     │ User behavior table                   │   │
│  │ Alert Chart    │ Donut chart (distribution)            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ACTIONS:                                                       │
│  • View real-time alerts                                       │
│  • Resolve/investigate threats                                 │
│  • Analyze trends                                              │
│  • Monitor employee behavior                                   │
│  • Download reports                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    👤 EMPLOYEE PORTAL                           │
│                        (Port 3001)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PURPOSE:    Simulate threats for testing & demos              │
│  USERS:      Developers, demonstrators, testers               │
│  THEME:      Dark blue gradient                                │
│  AUTH:       Not required                                      │
│                                                                 │
│  COMPONENTS:                                                    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Employee Input │ Customize simulated employee ID       │   │
│  │ Threat Cards   │ 3 cards (Login, Download, Geo)        │   │
│  │ Action Buttons │ 9 simulation buttons                  │   │
│  │ Live Stats     │ Real-time counters                    │   │
│  │ Connection     │ Socket.IO status indicator            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ACTIONS:                                                       │
│  • Trigger login anomalies                                     │
│  • Simulate bulk downloads                                     │
│  • Generate geo threats                                        │
│  • View simulation statistics                                  │
│  • Monitor connection status                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register       Register new employee
POST   /api/auth/login          Authenticate user
POST   /api/auth/logout         End session
GET    /api/auth/session        Check session status
```

### Dashboard

```
GET    /api/dashboard/stats     Get dashboard statistics
GET    /api/dashboard/high-risk Get high-risk employees
GET    /api/dashboard/recent    Get recent activity
```

### Alerts

```
GET    /api/alerts              Get all alerts
GET    /api/alerts/:id          Get specific alert
PUT    /api/alerts/:id/resolve  Mark alert as resolved
DELETE /api/alerts/:id          Delete alert
```

### Simulation (🆕 NEW)

```
POST   /api/simulation/login-threat          Simulate login anomaly
POST   /api/simulation/bulk-download-threat  Simulate bulk download
POST   /api/simulation/geographic-threat     Simulate geo anomaly
GET    /api/simulation/stats                 Get simulation stats
```

---

## 📊 Data Flow

### Threat Creation

```
Employee Portal
     │
     ▼
API Request (POST /api/simulation/*)
     │
     ▼
Backend validates request
     │
     ▼
Create threat in appropriate collection
  • LoginActivity
  • BulkDownloadAlert
  • GeographicAlert
     │
     ▼
Run through rule engine
  • Calculate risk score
  • Identify anomalies
  • Determine severity
     │
     ▼
Create ActiveThreat record
     │
     ▼
Save to MongoDB
     │
     ├──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼
HTTP Response         Socket.IO Emit        Update Employee Pattern
     │                      │                      │
     ▼                      ▼                      ▼
Employee Portal      Security Dashboard    Risk Score Updated
  • Show success       • Alert appears       • Alert count ++
  • Update stats       • Stats update
```

---

## 🛠️ Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                              │
├─────────────────────────────────────────────────────────────┤
│  Framework      │ React 18.2                                │
│  Styling        │ Styled Components 6.1                     │
│  Charts         │ Chart.js + react-chartjs-2               │
│  HTTP Client    │ Axios 1.6                                 │
│  WebSocket      │ Socket.IO Client 4.5                      │
│  Notifications  │ React Toastify 9.1                        │
│  Routing        │ React Router DOM 6.x                      │
│  State          │ React Context API                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       BACKEND                               │
├─────────────────────────────────────────────────────────────┤
│  Runtime        │ Node.js 16+                               │
│  Framework      │ Express.js 4.18                           │
│  Database       │ MongoDB 5+ with Mongoose 7.x              │
│  WebSocket      │ Socket.IO 4.5                             │
│  Authentication │ JWT (jsonwebtoken)                        │
│  Security       │ Helmet, CORS                              │
│  File Watching  │ Chokidar 3.5                              │
│  Date Utils     │ Moment.js 2.29                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                               │
├─────────────────────────────────────────────────────────────┤
│  Type           │ NoSQL Document Database                   │
│  Platform       │ MongoDB 5+                                │
│  ODM            │ Mongoose 7.x                              │
│  Collections    │ 5 main collections                        │
│  Indexes        │ Optimized for queries                     │
│  Replication    │ Supported (production)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

```
┌─────────────────────────────────────────────────────────────┐
│                  SECURITY MEASURES                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Authentication                                             │
│  ✅ JWT-based authentication                                │
│  ✅ Token expiration (7 days)                               │
│  ✅ Secure password handling (optional)                     │
│  ✅ Session management                                      │
│                                                             │
│  Privacy                                                    │
│  ✅ No file content reading                                 │
│  ✅ Anonymous employee tokens                               │
│  ✅ IP address encryption                                   │
│  ✅ Auto-logout (30 min inactivity)                         │
│                                                             │
│  Data Protection                                            │
│  ✅ CORS configured                                         │
│  ✅ Helmet security headers                                 │
│  ✅ Input validation                                        │
│  ✅ XSS protection                                          │
│                                                             │
│  Monitoring                                                 │
│  ✅ Request logging                                         │
│  ✅ Error tracking                                          │
│  ✅ Audit trail                                             │
│  ✅ Alert history                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Scalability

```
┌─────────────────────────────────────────────────────────────┐
│                   SCALING STRATEGY                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Horizontal Scaling                                         │
│  • Multiple backend instances                               │
│  • Load balancer                                            │
│  • Sticky sessions for Socket.IO                            │
│  • Redis adapter for Socket.IO clustering                   │
│                                                             │
│  Database Scaling                                           │
│  • MongoDB replica sets                                     │
│  • Sharding for large datasets                              │
│  • Read replicas                                            │
│  • Indexing optimization                                    │
│                                                             │
│  Frontend Scaling                                           │
│  • CDN distribution                                         │
│  • Code splitting                                           │
│  • Lazy loading                                             │
│  • Caching strategies                                       │
│                                                             │
│  Performance                                                │
│  • WebSocket for real-time (vs polling)                     │
│  • Indexed database queries                                 │
│  • Optimized React rendering                                │
│  • Memoization                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**This architecture supports:**

- ✅ **Real-time** threat detection (< 500ms)
- ✅ **Scalable** to thousands of employees
- ✅ **Reliable** with error handling
- ✅ **Secure** with multiple layers
- ✅ **Maintainable** with clear separation
- ✅ **Extensible** for new threat types

---

**📖 For implementation details, see:**

- `IMPLEMENTATION_SUMMARY.md` - What was built
- `DUAL_FRONTEND_GUIDE.md` - How to use it
- `DEMO_SCRIPT.md` - How to demo it
- `QUICK_START.md` - How to start it
