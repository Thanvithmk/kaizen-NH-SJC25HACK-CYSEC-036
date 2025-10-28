# Frontend - Vigilant Guard Dashboard

## Overview

React.js dashboard for the Insider Threat Detection System.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
# Create .env file with API URL

# Start development server
npm start

# Build for production
npm run build
```

## Features

- 🔐 Secure authentication
- 📊 Real-time statistics
- 🚨 Live alert monitoring
- 📈 Interactive charts
- 🔔 Push notifications
- ⚡ WebSocket updates

## Components

### Pages

- **Login** - Employee authentication
- **Dashboard** - Main security dashboard

### Components

- **Header** - Navigation and user info
- **StatsCards** - Key metrics display
- **AlertsTable** - Interactive alerts list
- **HighRiskEmployees** - Top 5 risk list
- **AlertDistribution** - Pie chart visualization

### Context

- **AuthContext** - Authentication state
- **DashboardContext** - Dashboard data and real-time updates

## Styling

Uses Styled Components for component-level styling:

- Modular and maintainable
- Theme-based design
- Responsive layout

## API Integration

All API calls handled through `services/api.js`:

- Centralized axios instance
- Automatic token injection
- Error handling

## Real-time Updates

WebSocket connection via `services/socket.js`:

- Auto-reconnection
- Event-based updates
- Subscription management

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Development

```bash
# Start dev server (port 3000)
npm start

# Run tests
npm test

# Build production
npm run build
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

