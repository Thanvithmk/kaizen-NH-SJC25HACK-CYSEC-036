# Backend - Vigilant Guard API

## Overview

Node.js/Express.js backend for the Insider Threat Detection System.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Seed database
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register employee
- `POST /api/auth/login` - Employee login
- `POST /api/auth/logout` - Employee logout
- `GET /api/auth/sessions` - Get active sessions

### Dashboard

- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/high-risk-employees` - Get high-risk list
- `GET /api/dashboard/recent-activity` - Get recent logins

### Alerts

- `GET /api/alerts` - Get all alerts (with filters)
- `GET /api/alerts/:id` - Get specific alert
- `PUT /api/alerts/:id/solve` - Mark alert as solved
- `DELETE /api/alerts/:id` - Delete alert

### Geographic

- `GET /api/geographic/overview` - Get location overview
- `GET /api/geographic/alerts` - Get geographic alerts
- `PUT /api/geographic/:id/verify` - Verify geographic alert

### Employees

- `GET /api/employees` - Get all employees
- `GET /api/employees/active` - Get active employees
- `GET /api/employees/:token` - Get employee details
- `PUT /api/employees/:token` - Update employee pattern

## Services

### Auth Service

- Handles login/logout
- Manages sessions
- Triggers geographic analysis
- Auto-logout after inactivity

### Folder Monitoring Service

- Watches Downloads, Desktop, Documents
- Tracks file activity
- Triggers bulk download alerts
- Privacy-focused (no content reading)

### Location Service

- IP to location lookup
- Geographic anomaly detection
- Travel time calculations

### Rule Engine

- Risk score calculation
- Anomaly type determination
- Risk level assessment

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/threat_detection
PORT=5000
JWT_SECRET=your_secret_key
SESSION_TIMEOUT_MINUTES=30
FILE_SCAN_INTERVAL_SECONDS=30
```

## Database Models

- **LoginActivity** - Login/logout records
- **BulkDownloadAlert** - File download alerts
- **GeographicAlert** - Location anomalies
- **EmployeePattern** - Employee baselines
- **ActiveThreat** - Consolidated threats

## Real-time Features

WebSocket events:

- `newAlert` - New threat detected
- `statsUpdate` - Dashboard stats updated

## Development

```bash
# Run with auto-reload
npm run dev

# Seed test data
npm run seed
```

