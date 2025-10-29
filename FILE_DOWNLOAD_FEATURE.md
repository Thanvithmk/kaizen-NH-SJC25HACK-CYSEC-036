# 📁 File Download Feature - Complete Guide

## Overview

After successful employee login, users are directed to a File Downloads page where they can download various company files. Each download is tracked with risk scoring based on file size and sensitivity.

## Features Implemented

### 🎯 **Individual Download Buttons**

- Each file has its own dedicated download button
- Real-time download status indication
- Files are automatically downloaded to the user's default download folder

### 📊 **Risk-Based File Categorization**

| Risk Level    | File Size         | Risk Score | Examples                                                     |
| ------------- | ----------------- | ---------- | ------------------------------------------------------------ |
| **LOW** 🟢    | < 100 MB          | 10         | Employee Handbook, Meeting Notes, Project Timeline           |
| **MEDIUM** 🟡 | 100-999 MB        | 50         | Customer Database Report, Financial Summary, Design Archives |
| **HIGH** 🔴   | ≥ 1000 MB (1 GB+) | 70         | Confidential Client Data, Payroll Records, Database Backups  |

### 🔔 **Download Notifications**

When a file is downloaded, a popup toast notification displays:

- ✅ File name
- 📦 File size (e.g., "5.0 GB file downloaded")
- ⚠️ Risk level (LOW, MEDIUM, HIGH)
- 🚨 Visual emoji indicators based on risk

### 🔒 **Real-Time Monitoring**

- All downloads are logged to the database
- Security Dashboard receives real-time alerts
- Risk scores automatically calculated
- Threat alerts created for high-risk downloads

## Sample Files Created

### Low Risk Files (Small Size)

1. **Employee_Handbook_2024.pdf** - 2.5 MB

   - Company employee handbook and policies
   - Risk: LOW

2. **Meeting_Notes_Q1.docx** - 0.8 MB

   - Quarterly meeting notes
   - Risk: LOW

3. **Project_Timeline.xlsx** - 1.2 MB
   - Project timeline and milestones
   - Risk: LOW

### Medium Risk Files (Moderate Size)

4. **Customer_Database_Report.xlsx** - 150 MB

   - Customer analytics and reports
   - Risk: MEDIUM
   - ⚠️ Sensitive Data

5. **Financial_Summary_2024.pdf** - 85 MB

   - Annual financial summary
   - Risk: MEDIUM
   - ⚠️ Sensitive Data

6. **Product_Designs_Archive.zip** - 250 MB
   - Product design files and mockups
   - Risk: MEDIUM

### High Risk Files (Large Size)

7. **Confidential_Client_Data.csv** - 2.5 GB

   - Confidential client information database
   - Risk: HIGH 🚨
   - ⚠️ Sensitive Data

8. **Payroll_Records_2024.xlsx** - 1.2 GB

   - Employee payroll and salary information
   - Risk: HIGH 🚨
   - ⚠️ Sensitive Data

9. **Backup_Database_Full.zip** - 5.0 GB

   - Complete database backup file
   - Risk: HIGH 🚨
   - ⚠️ Sensitive Data

10. **Source_Code_Repository.zip** - 3.5 GB
    - Complete source code repository
    - Risk: HIGH 🚨
    - ⚠️ Sensitive Data

## Setup Instructions

### 1. Seed the Data Files

```bash
cd backend
npm run seed:files
```

This creates:

- `backend/utils/datafiles/` directory
- Sample data files (mock files with metadata)
- `metadata.json` with file information

### 2. Start the Backend

```bash
cd backend
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Start Employee Portal

```bash
cd employee-portal
npm start
```

Employee portal runs on: `http://localhost:3001`

### 4. Test the Feature

1. Login at `http://localhost:3001/login`
   - Use: EMP001 / password123
2. Automatically redirected to File Downloads page
3. Download files and observe:
   - Download notifications
   - Risk level indicators
   - Security Dashboard alerts (open at `http://localhost:3000`)

## User Flow

```
Login (EMP001)
   ↓
File Downloads Page
   ↓
Select File → Click Download Button
   ↓
File Downloads + Toast Notification
   ↓
"📦 Downloaded: Backup_Database_Full.zip
Size: 5.0 GB | Risk: HIGH"
   ↓
Security Dashboard Alert Created
```

## API Endpoints

### Get File List

```http
GET /api/files/list

Response:
{
  "success": true,
  "count": 10,
  "files": [
    {
      "filename": "Backup_Database_Full.zip",
      "sizeMB": 5000,
      "type": "zip",
      "description": "Complete database backup file",
      "isSensitive": true,
      "riskLevel": "HIGH",
      "riskScore": 70
    },
    ...
  ]
}
```

### Download File

```http
GET /api/files/download/:filename?employee_token=EMP001

Response: File download stream
- Logs download to BulkDownloadAlert
- Creates ActiveThreat if risk > 30
- Emits real-time alert to dashboard
```

## Risk Calculation Logic

### File Size Risk

```javascript
if (sizeMB >= 1000) {
  riskLevel = "HIGH";
  riskScore = 70;
} else if (sizeMB >= 100) {
  riskLevel = "MEDIUM";
  riskScore = 50;
} else {
  riskLevel = "LOW";
  riskScore = 10;
}
```

### Additional Risk Factors

- **Sensitive Data**: Files marked as sensitive increase risk
- **File Type**: Certain extensions (.zip, .csv) may increase risk
- **Timing**: Downloads during odd hours increase risk score
- **Frequency**: Multiple downloads in short time trigger higher alerts

## Toast Notification Examples

### Low Risk Download

```
✅ Downloaded: Employee_Handbook_2024.pdf
Size: 2.5 MB | Risk: LOW
```

### Medium Risk Download

```
⚠️ Downloaded: Customer_Database_Report.xlsx
Size: 150 MB | Risk: MEDIUM
```

### High Risk Download

```
🚨 Downloaded: Backup_Database_Full.zip
Size: 5.0 GB | Risk: HIGH
```

## Dashboard Integration

When an employee downloads a file:

1. **BulkDownloadAlert** created in database
2. **Risk analysis** performed by rule engine
3. **ActiveThreat** created if risk > 30
4. **Socket.IO** emits threat to dashboard
5. **Dashboard** displays alert in real-time

### Dashboard Alert Format

```
Alert Type: Bulk Download
Employee: EMP001 (John Smith)
Risk Score: 70 (HIGH)
Details:
  - File: Backup_Database_Full.zip
  - Size: 5.0 GB
  - Anomalies: ["Critical download size (1GB+)"]
  - Sensitive: Yes
```

## File Icons

Files display appropriate icons based on type:

- 📄 PDF files
- 📝 Word documents
- 📊 Excel spreadsheets
- 📈 CSV files
- 🗜️ ZIP archives
- 📋 JSON files
- 📃 Text files
- 📁 Other files

## Navigation

From File Downloads page, users can:

- **🎯 Simulation Portal**: Go to threat simulation page
- **🚪 Logout**: Sign out and return to login

## Security Features

### Automatic Tracking

- Every download is logged
- Employee token associated with each download
- IP address and timestamp recorded
- File metadata preserved

### Path Security

- Filename sanitization to prevent directory traversal
- Files restricted to `/backend/utils/datafiles/` directory
- No access to system files outside designated folder

### Sensitive Data Flagging

Files containing keywords are flagged as sensitive:

- confidential
- secret
- private
- sensitive
- restricted
- classified
- payroll
- salary
- financial
- customer

## Testing Scenarios

### Scenario 1: Download Low Risk File

1. Login as EMP001
2. Download "Employee_Handbook_2024.pdf"
3. **Expected**: Green indicator, "✅ 2.5 MB file downloaded"
4. Dashboard shows LOW risk alert

### Scenario 2: Download Medium Risk File

1. Download "Customer_Database_Report.xlsx"
2. **Expected**: Yellow indicator, "⚠️ 150 MB file downloaded"
3. Dashboard shows MEDIUM risk alert

### Scenario 3: Download High Risk File

1. Download "Backup_Database_Full.zip"
2. **Expected**: Red indicator, "🚨 5.0 GB file downloaded"
3. Dashboard shows HIGH risk alert with 70 risk score
4. Alert includes "Critical download size" anomaly

### Scenario 4: Download Multiple Files

1. Download 3-4 large files consecutively
2. **Expected**: Multiple HIGH risk alerts
3. Employee flagged as high-risk in dashboard
4. Cumulative risk score increases

## Files Structure

```
vigilantGuard/
├── backend/
│   ├── routes/
│   │   └── fileRoutes.js          # File API endpoints
│   ├── scripts/
│   │   └── seedDataFiles.js       # File seeding script
│   └── utils/
│       └── datafiles/             # Data files directory
│           ├── metadata.json      # File metadata
│           └── [sample files]     # Mock data files
│
├── employee-portal/
│   └── src/
│       ├── pages/
│       │   ├── FileDownloads.js   # File downloads page
│       │   └── EmployeeLogin.js   # Updated to redirect to /files
│       ├── services/
│       │   └── api.js             # Added fileAPI methods
│       └── App.js                 # Added /files route
│
└── FILE_DOWNLOAD_FEATURE.md       # This guide
```

## Summary

✅ **10 sample files** with varying sizes and risk levels
✅ **Individual download buttons** for each file
✅ **Toast notifications** showing file size and risk
✅ **Automatic risk scoring** based on file size
✅ **Real-time dashboard alerts** via Socket.IO
✅ **Sensitive data flagging** for high-risk files
✅ **Complete download tracking** in database
✅ **Beautiful UI** with color-coded risk indicators

The file download system is fully integrated with the existing insider threat detection system and provides comprehensive monitoring of employee file download activities!
