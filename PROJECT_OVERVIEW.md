# Vigilant Guard - Insider Threat Detection System

## Comprehensive Project Overview

---

## 1. PROJECT SUMMARY

**Vigilant Guard** is a sophisticated insider threat detection system designed to monitor employee activities and identify potential security risks within an organization. The system operates covertly, tracking user behaviors without alerting employees to the monitoring, while providing security teams with real-time alerts and comprehensive analytics.

### Core Purpose

- **Detect** unusual employee behavior patterns
- **Monitor** file downloads and data access
- **Track** login activities and geographic anomalies
- **Analyze** risk levels in real-time
- **Alert** security teams to potential threats

---

## 2. SYSTEM ARCHITECTURE

### Two-Portal Design

#### A. **Employee Portal** (Port 3001)

- Simple, clean interface for employees
- Login page with authentication
- File download functionality
- **No visible threat monitoring** - employees unaware of tracking
- Acts as a normal business application

#### B. **Security Dashboard** (Port 3000)

- Comprehensive monitoring interface
- Real-time threat visualization
- Advanced analytics and statistics
- Threat management capabilities
- Login activity logs
- Accessible only to security personnel

### Backend (Port 5000)

- RESTful API architecture
- MongoDB database for data persistence
- Real-time WebSocket connections (Socket.IO)
- Advanced risk calculation engine
- Location tracking capabilities

---

## 3. KEY FEATURES

### A. Employee Monitoring (Invisible)

- **Login Tracking**

  - Records every login attempt (success/failure)
  - Captures IP address and geographic location
  - Tracks session duration (login to logout)
  - Monitors failed password attempts

- **File Download Monitoring**

  - Tracks all file downloads
  - Records file size and type
  - Identifies sensitive data access
  - Calculates risk based on download patterns

- **Behavioral Analysis**
  - Establishes baseline employee patterns
  - Detects deviations from normal behavior
  - Identifies unusual access times
  - Tracks geographic anomalies

### B. Security Dashboard Features

- **Real-Time Statistics**

  - Active users count
  - Solved/unsolved incidents
  - Risk level distribution (High/Medium/Low)
  - System status monitoring

- **Active Threats Management**

  - View all unsolved security threats
  - Filter by threat type (Login/Download/Geographic)
  - Mark threats as solved
  - View detailed threat information

- **Solved Threats Archive**

  - Historical record of resolved threats
  - Audit trail for compliance
  - Pattern analysis for prevention

- **Comprehensive Logs**
  - Complete login activity history
  - IP address tracking
  - Geographic location data
  - Session duration analysis
  - Success/failure status tracking

---

## 4. THREAT DETECTION SYSTEM

### Risk Scoring Engine

The system uses a sophisticated algorithm to calculate risk scores (0-100) based on multiple factors:

#### Login-Based Threats

- **Low Risk (Score < 25)**

  - Successful login from usual location
  - Normal working hours
  - Expected behavior patterns

- **Medium Risk (Score 25-49)**

  - 2-3 failed login attempts
  - Login from new location
  - Unusual access time

- **High Risk (Score 50+)**

  - 3-5 failed login attempts
  - Multiple geographic anomalies
  - Suspicious timing patterns

- **Critical Risk (Score 70+)**
  - 5+ failed login attempts
  - Concurrent sessions from different locations
  - Brute force attack patterns

#### Download-Based Threats

- **File Size Analysis**

  - Small files (<100MB): Low risk
  - Medium files (100-999MB): Medium risk
  - Large files (1GB+): High risk
  - Bulk downloads: Critical risk

- **File Sensitivity**
  - Public documents: Low risk
  - Internal files: Medium risk
  - Confidential data: High risk
  - Classified information: Critical risk

#### Geographic Anomalies

- Login from unexpected country
- Impossible travel (two logins from distant locations in short time)
- Login from high-risk geographic regions
- VPN/proxy usage detection

---

## 5. DATA FLOW & ARCHITECTURE

### Database Collections

1. **EmployeePattern**

   - Employee ID and credentials
   - Typical login hours
   - Normal locations
   - Baseline behavior patterns

2. **LoginActivity**

   - Every login attempt
   - IP addresses
   - Geographic locations (City, Country)
   - Success/failure status
   - Session duration

3. **BulkDownloadAlert**

   - File download records
   - File sizes and types
   - Download timestamps
   - Risk assessments

4. **ActiveThreat**

   - Current unresolved threats
   - Risk scores and levels
   - Threat types and details
   - Resolution status

5. **GeographicAlert**
   - Location-based anomalies
   - Travel impossibilities
   - Suspicious locations

---

## 6. REAL-TIME EXAMPLE FLOW

### Scenario: Suspicious Employee Activity Detection

Let's follow employee "Sarah Chen" (EMP001) through a typical day that triggers security alerts:

---

#### **8:30 AM - Normal Login** ✓

**What Happens:**

1. Sarah logs into the Employee Portal from her office in New York
2. System captures:
   - Employee Token: EMP001
   - IP Address: 192.168.1.45
   - Location: New York, United States
   - Time: 8:30 AM EST

**Backend Processing:**

- Creates `LoginActivity` record
- Compares with Sarah's typical pattern (she usually logs in between 8:00-9:00 AM)
- IP matches her office network
- Geographic location matches expected
- **Risk Score: 10 (Low Risk)**

**Security Dashboard:**

- "Active Users" count increases by 1
- New entry appears in Logs table
- No alert generated (normal behavior)

---

#### **10:15 AM - Small File Download** ✓

**What Happens:**

1. Sarah downloads "Meeting_Notes_Q1.docx" (25MB)
2. A toast notification appears: "✓ Downloaded: Meeting_Notes_Q1.docx | File Size: 25 MB"

**Backend Processing:**

- Creates `BulkDownloadAlert` record
- File size: 25MB (Small)
- File type: Document (Medium sensitivity)
- Calculates risk: **Score: 15 (Low Risk)**
- No immediate threat detected

**Security Dashboard:**

- Download logged in system
- No alert created (within normal parameters)

---

#### **11:00 AM - Failed Login Attempt** ⚠

**What Happens:**

1. Someone tries to log in as Sarah with wrong password
2. Location: Tokyo, Japan
3. Login fails

**Backend Processing:**

- Creates `LoginActivity` record with "Failed" status
- Detects geographic anomaly (New York → Tokyo in 2.5 hours = impossible)
- Counts recent failed attempts: 1
- **Risk Score: 35 (Medium Risk)**

**System Action:**

- Creates `ActiveThreat` record
- Sends real-time WebSocket notification to security dashboard

**Security Dashboard:**

- **ALERT APPEARS**
- "Active Threats" count increases
- "Medium Risk" count increases
- Real-time notification: "New threat detected for EMP001"
- Threat details shown:
  - Employee: EMP001
  - Type: Login
  - Risk Level: Medium
  - Details: "Failed login from Tokyo, Japan"
  - Time: 11:00 AM

---

#### **11:05 AM - Second Failed Login** ⚠⚠

**What Happens:**

1. Another failed login attempt
2. Still from Tokyo, Japan
3. Wrong password again

**Backend Processing:**

- Creates another `LoginActivity` record
- Counts failed attempts in last 30 minutes: 2
- Geographic anomaly persists
- **Risk Score: 50 (Medium → High threshold)**

**System Action:**

- Updates existing `ActiveThreat` record
- Escalates severity to High
- Sends updated WebSocket notification

**Security Dashboard:**

- **ALERT ESCALATES**
- Threat moves from "Medium Risk" to "High Risk"
- Alert panel shows: "2 failed login attempts from Tokyo, Japan"
- Security team can see both attempts in logs

---

#### **11:10 AM - Third Failed Login** 🚨

**What Happens:**

1. Third consecutive failed attempt
2. Same location (Tokyo)

**Backend Processing:**

- Three failed attempts in 10 minutes
- Clear brute force pattern detected
- **Risk Score: 70 (High → Critical)**

**System Action:**

- Escalates to Critical threat level
- High-priority WebSocket notification
- Could trigger email/SMS alerts (if configured)

**Security Dashboard:**

- **CRITICAL ALERT**
- Red highlighting in Active Threats table
- "Critical" badge displayed
- Suggested actions appear:
  - Lock account
  - Force password reset
  - Contact employee
  - Investigate immediately

**Security Team Response:**

1. Security analyst "John Smith" reviews the alert
2. Sees the geographic impossibility (NY → Tokyo)
3. Checks if Sarah is actually in New York (she is)
4. Determines this is a breach attempt
5. Clicks "Mark as Solved" after:
   - Locking the account temporarily
   - Notifying Sarah
   - Forcing password reset

---

#### **1:30 PM - Large File Download** 🚨

**What Happens:**

1. Sarah (now back in control) downloads "Backup_Database_Full.zip" (5GB)
2. Toast appears: "Downloaded: Backup_Database_Full.zip | 5 GB"

**Backend Processing:**

- Creates `BulkDownloadAlert` record
- File size: 5GB (Very Large)
- File type: Database backup (High sensitivity)
- Calculates risk factors:
  - Large file size: +40 points
  - Sensitive content: +30 points
  - Unusual for Sarah's role: +20 points
- **Risk Score: 90 (Critical Risk)**

**System Action:**

- Creates new `ActiveThreat` record
- Type: "bulk" (download)
- Real-time WebSocket notification

**Security Dashboard:**

- **NEW CRITICAL ALERT**
- "Active Threats" count increases
- Details shown:
  - Employee: EMP001
  - Type: Bulk Download
  - File: Backup_Database_Full.zip
  - Size: 5GB
  - Risk: Critical
  - Anomalies: "File size exceeds normal patterns", "Sensitive data access"

**Security Team Response:**

1. Analyst reviews Sarah's download
2. Checks her role: "Marketing Manager" (shouldn't need database backups)
3. Calls Sarah to verify
4. Sarah explains: "IT department asked me to download for migration"
5. Analyst verifies with IT department
6. Marks threat as solved: "Authorized by IT team"

---

#### **5:30 PM - Normal Logout** ✓

**What Happens:**

1. Sarah logs out from Employee Portal

**Backend Processing:**

- Updates `LoginActivity` record
- Sets `logout_timestamp`
- Calculates session duration: 9 hours
- Session appears normal

**Security Dashboard:**

- "Active Users" count decreases by 1
- Session logged as complete
- Full day's activity visible in Logs

---

## 7. SECURITY DASHBOARD WORKFLOW

### Daily Operations for Security Team

#### Morning Review

1. Login to Security Dashboard
2. Check overnight statistics:
   - Any new threats?
   - How many active threats?
   - System status?
3. Review High/Critical threats first
4. Check geographic alerts
5. Monitor active user sessions

#### Real-Time Monitoring

1. Dashboard auto-refreshes every 30 seconds
2. WebSocket provides instant notifications
3. New threats appear immediately
4. Color-coded alerts (Red = Critical, Orange = High, etc.)

#### Threat Investigation

1. Click on threat in Active Threats table
2. View complete details:
   - Employee information (anonymized token)
   - Type of threat
   - Risk score and level
   - Timestamp
   - Related activities
3. Check employee's recent activity in Logs
4. Cross-reference with other systems
5. Make decision: Real threat or false positive?

#### Threat Resolution

1. Take appropriate action:
   - Contact employee
   - Lock account
   - Reset password
   - Investigate further
   - Dismiss as false positive
2. Click "Mark as Solved"
3. Threat moves to Solved Threats archive
4. Add notes for future reference

---

## 8. EMPLOYEE EXPERIENCE (Unknown Monitoring)

### What Employees See

#### Login Process

- Standard login form
- Employee ID and password
- No indication of monitoring
- Success/failure messages only
- Clean, professional interface

#### File Downloads

- List of available company files
- Download buttons for each file
- Simple toast notification on download
- No risk scores shown
- No warnings about monitoring

### What Employees DON'T See

- No "monitoring active" warnings
- No risk scores or threat levels
- No indication downloads are tracked
- No alerts about failed logins
- No geographic tracking disclosure
- System operates completely transparently

---

## 9. KEY BENEFITS

### For Security Teams

✓ **Real-Time Detection** - Instant threat notifications
✓ **Comprehensive Analytics** - Full visibility into employee activities
✓ **Risk Scoring** - Automated threat prioritization
✓ **Historical Data** - Complete audit trail
✓ **Compliance** - Meet regulatory requirements
✓ **Prevention** - Stop data breaches before they happen

### For Organizations

✓ **Data Protection** - Prevent unauthorized data exfiltration
✓ **Insider Threat Mitigation** - Detect malicious insiders
✓ **Compliance** - Satisfy audit requirements
✓ **Reduced Risk** - Lower probability of breaches
✓ **Cost Savings** - Prevent expensive data loss incidents

### For IT Teams

✓ **Centralized Monitoring** - Single dashboard for all threats
✓ **Automated Alerts** - No manual log review needed
✓ **Integration Ready** - API-first architecture
✓ **Scalable** - Handles thousands of employees
✓ **Low Maintenance** - Automated operation

---

## 10. PRIVACY & COMPLIANCE

### Data Protection

- Employee tokens used instead of names (anonymization)
- Role-based access control
- Encrypted data transmission
- Secure password storage (bcrypt)
- Audit logging for all actions

### Compliance Features

- GDPR-ready data handling
- SOC 2 compliance support
- Audit trail preservation
- Data retention policies
- Access control mechanisms

### Ethical Monitoring

- Transparent to authorized personnel
- Clear security purpose
- Legitimate business interest
- Proportionate response
- Employee handbook disclosure (recommended)

---

## 11. TECHNICAL SPECIFICATIONS

### Technology Stack

- **Frontend**: React.js with styled-components
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.IO WebSockets
- **Authentication**: bcryptjs password hashing
- **Security**: CORS, input validation, sanitization

### Performance

- Real-time updates < 100ms latency
- Handles 1000+ concurrent users
- Database queries optimized with indexes
- Scalable architecture
- Low resource footprint

### Deployment

- Two frontend applications (ports 3000, 3001)
- Single backend API (port 5000)
- MongoDB Atlas cloud database
- Environment-based configuration
- Docker-ready architecture

---

## 12. FUTURE ENHANCEMENTS (Potential)

### Advanced Features

- Machine learning for pattern recognition
- Predictive threat analysis
- Integration with SIEM systems
- Email/SMS alert notifications
- Automated response actions
- Mobile app for security team
- Advanced reporting and analytics
- User risk profiles
- Behavioral baselining improvements

### Enterprise Features

- Multi-tenant support
- Active Directory integration
- SSO (Single Sign-On)
- Advanced role-based permissions
- Custom alert rules
- Scheduled reports
- Data export capabilities
- API for third-party integrations

---

## 13. CONCLUSION

**Vigilant Guard** represents a comprehensive approach to insider threat detection, combining sophisticated monitoring capabilities with user-friendly interfaces for both employees and security personnel. The system operates silently in the background while providing security teams with powerful tools to detect, analyze, and respond to potential security threats in real-time.

The dual-portal design ensures employees can work normally without disruption while security teams maintain complete visibility into activities that might indicate malicious intent or compromised accounts. With its advanced risk scoring engine, real-time alerting, and comprehensive logging, Vigilant Guard helps organizations protect their sensitive data while maintaining a productive work environment.

---

**Project Status**: Fully Functional
**Version**: 1.0
**Last Updated**: October 2025
