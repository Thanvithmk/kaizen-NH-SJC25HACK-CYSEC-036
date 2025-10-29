# Active Threats Page Documentation

## Overview

Created a comprehensive Active Threats page that displays all threats from the `ActiveThreat` database collection in a filterable table format with statistics.

---

## Page Location

**URL:** `/threats`  
**Component:** `employee-portal/src/pages/ActiveThreats.js`

---

## Features

### 1. **Statistics Dashboard**

Four key metrics displayed at the top:

- **Total Threats**: Total count of all threats
- **Unsolved**: Number of threats with `solved: "N"`
- **Critical**: Threats with risk level "Critical" (score ≥ 75)
- **High Risk**: Threats with risk level "High" (score ≥ 50)

### 2. **Filter Bar**

Interactive filters to narrow down threat display:

- **All Threats** - Shows all records
- **Unsolved** - Only unsolved threats (`solved: "N"`)
- **Solved** - Only solved threats (`solved: "Y"`)
- **Login Threats** - Filter by `alert_type: "login"`
- **Download Threats** - Filter by `alert_type: "bulk"`
- **Geographic Threats** - Filter by `alert_type: "geo"`

### 3. **Threats Table**

Comprehensive table with the following columns:

| Column      | Description                                    | Data Type         |
| ----------- | ---------------------------------------------- | ----------------- |
| Date & Time | When the threat occurred                       | Formatted date    |
| Employee    | Employee name and ID                           | String            |
| Type        | Threat type (login/bulk/geo)                   | Badge             |
| Risk Score  | Numerical risk score (0-100)                   | Number            |
| Risk Level  | Critical/High/Medium/Low                       | Color-coded badge |
| Status      | Solved/Unsolved                                | Badge             |
| Details     | Specific threat information (file, size, etc.) | JSON details      |

---

## Database Integration

### API Endpoint

**GET** `/api/alerts`

**Query Parameters:**

- `alert_type` - Filter by type (login, bulk, geo)
- `solved` - Filter by solved status (Y, N)
- `employee_token` - Filter by specific employee
- `risk_level` - Filter by risk level
- `limit` - Number of results (default: 50)
- `skip` - Pagination offset

### Response Format

```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "alerts": [
    {
      "_id": "abc123",
      "alert_date_time": "2025-10-29T04:29:33.000Z",
      "risk_score": 40,
      "alert_type": "bulk",
      "employee_token": "EMP001",
      "employee_name": "John Doe",
      "solved": "N",
      "risk_level": "Medium",
      "details": {
        "filename": "Backup_Database_Full.zip",
        "total_size_mb": 5000,
        "anomalies": ["Critical download size (1GB+)"]
      }
    }
  ]
}
```

---

## UI Components

### Color Coding

**Risk Level Badges:**

- **Critical** (≥75): Red background, red text
- **High** (50-74): Orange background, orange text
- **Medium** (25-49): Blue background, blue text
- **Low** (<25): Green background, green text

**Status Badges:**

- **Unsolved**: Red background
- **Solved**: Green background

**Type Badges:**

- All types: Purple background with uniform styling

---

## Navigation

### Entry Points

1. **From File Downloads Page:**

   - Click "View Active Threats" button in the top-left corner
   - Navigates to `/threats`

2. **Direct URL:**
   - Navigate to `http://localhost:3001/threats`

### Exit Points

1. **Back to Files Button:**

   - Top-left corner
   - Returns to `/files` page

2. **Logout Button:**
   - Top-right corner in user info
   - Returns to `/login` page

---

## Authentication

**Protected Route:** Yes

- Checks for `localStorage.getItem("isLoggedIn")`
- If not logged in, redirects to `/login`
- Retrieves employee name from `localStorage.getItem("employeeName")`

---

## Styling Theme

### Color Palette

- **Background:** Dark purple gradient (`#0f0a1f` → `#2d1b4e` → `#1a0b2e`)
- **Primary:** Purple (`#8b5cf6`, `#a78bfa`)
- **Cards:** Dark semi-transparent (`rgba(30, 20, 50, 0.8)`)
- **Borders:** Purple with transparency (`rgba(139, 92, 246, 0.3)`)
- **Text:** Light purple (`#e9d5ff`, `#c4b5fd`, `#a78bfa`)

### Effects

- Backdrop blur on cards
- Hover effects on buttons and table rows
- Smooth transitions (0.3s ease)
- Box shadows on hover

---

## Files Modified/Created

### New Files

```
employee-portal/src/pages/ActiveThreats.js
```

### Modified Files

```
employee-portal/src/App.js
- Added import for ActiveThreats component
- Added route: /threats

employee-portal/src/pages/FileDownloads.js
- Added "View Active Threats" button
- Added goToThreats() navigation function
- Re-added NavButton styled component
```

---

## Usage Examples

### Example 1: View All Threats

1. Login as employee (EMP001)
2. Navigate to File Downloads
3. Click "View Active Threats"
4. See all threats in table format

### Example 2: Filter Unsolved Threats

1. On Active Threats page
2. Click "Unsolved" filter button
3. Table updates to show only unsolved threats

### Example 3: View Download Threats

1. On Active Threats page
2. Click "Download Threats" filter button
3. Table shows only `alert_type: "bulk"` threats

### Example 4: Check Statistics

1. View stats bar at top of page
2. See total, unsolved, critical, and high risk counts
3. Statistics update based on active filter

---

## Data Flow

```
Page Load
    ↓
Check Authentication (localStorage)
    ↓
Fetch Threats from API (/api/alerts)
    ↓
Calculate Statistics
    ↓
Render Stats Bar + Filter Bar + Table
    ↓
User Clicks Filter
    ↓
Update Filter State
    ↓
Re-fetch with Filter Parameters
    ↓
Update Table Display
```

---

## Testing Checklist

### ✅ Basic Functionality

- [ ] Page loads without errors
- [ ] Redirects to login if not authenticated
- [ ] Displays loading spinner while fetching
- [ ] Shows threats in table format

### ✅ Statistics

- [ ] Total count matches database
- [ ] Unsolved count is correct
- [ ] Critical threats counted correctly
- [ ] High risk threats counted correctly

### ✅ Filters

- [ ] "All Threats" shows all records
- [ ] "Unsolved" filters correctly
- [ ] "Solved" filters correctly
- [ ] "Login Threats" filters by type
- [ ] "Download Threats" filters by type
- [ ] "Geographic Threats" filters by type
- [ ] Active filter is highlighted

### ✅ Table Display

- [ ] Date format is readable
- [ ] Employee name and ID displayed
- [ ] Type badge shows correctly
- [ ] Risk score is numeric
- [ ] Risk level badge color-coded
- [ ] Status badge shows Solved/Unsolved
- [ ] Details show relevant information

### ✅ Navigation

- [ ] "Back to Files" button works
- [ ] Logout button clears session
- [ ] User info displays employee name

### ✅ Responsive Design

- [ ] Table scrolls horizontally on small screens
- [ ] Filter buttons wrap on mobile
- [ ] Stats cards adjust to screen size

---

## Database Query

### Sample MongoDB Query

```javascript
// Get all unsolved critical threats
db.activethreats
  .find({
    solved: "N",
    risk_score: { $gte: 75 },
  })
  .sort({ alert_date_time: -1 });

// Get all download threats for EMP001
db.activethreats.find({
  alert_type: "bulk",
  employee_token: "EMP001",
});
```

---

## Performance Considerations

1. **Pagination:** API supports `limit` and `skip` parameters
2. **Indexing:** Database has indexes on `employee_token`, `solved`, and `alert_date_time`
3. **Filtering:** Done server-side to reduce data transfer
4. **Caching:** Consider implementing if needed for large datasets

---

## Future Enhancements

### Potential Features

1. **Pagination Controls:** Add next/previous buttons for large datasets
2. **Search:** Search by employee name or ID
3. **Date Range Filter:** Filter threats by date range
4. **Export:** Download threats as CSV/Excel
5. **Mark as Solved:** Button to update threat status
6. **Details Modal:** Click row to see full threat details
7. **Real-time Updates:** Use Socket.IO to update table when new threats appear
8. **Sort Columns:** Click column headers to sort

---

## Integration with Existing System

### Backend

- ✅ Uses existing `/api/alerts` endpoint
- ✅ Leverages ActiveThreat model
- ✅ Gets employee names from EmployeePattern
- ✅ Risk level calculation in backend

### Frontend

- ✅ Consistent styling with other pages
- ✅ Uses same authentication flow
- ✅ Matches color scheme and theme
- ✅ Reuses navigation patterns

---

## Security Notes

1. **Authentication Required:** Page checks login status
2. **API Security:** Should add JWT or session tokens in production
3. **Data Validation:** Backend validates all query parameters
4. **XSS Protection:** React escapes all rendered data
5. **SQL Injection:** Not applicable (using MongoDB)

---

## Summary

✅ **Complete Active Threats Management Page**

- Displays all threats from database
- Interactive filtering system
- Statistics dashboard
- Color-coded risk indicators
- Integrated with existing auth flow
- Responsive table design
- Easy navigation between pages

**Access:** `http://localhost:3001/threats` (after login)

---

Last Updated: October 29, 2025
