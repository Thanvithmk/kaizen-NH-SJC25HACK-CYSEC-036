import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Employee API
export const employeeAPI = {
  // Employee Login
  login: async (data) => {
    const response = await api.post("/employees/login", data);
    return response.data;
  },

  // Employee Registration
  register: async (data) => {
    const response = await api.post("/employees/register", data);
    return response.data;
  },
};

// Simulation API
export const simulationAPI = {
  // Simulate Login Threat
  simulateLoginThreat: async (data) => {
    const response = await api.post("/simulation/login-threat", data);
    return response.data;
  },

  // Simulate Bulk Download Threat
  simulateBulkDownloadThreat: async (data) => {
    const response = await api.post("/simulation/bulk-download-threat", data);
    return response.data;
  },

  // Simulate Geographic Threat
  simulateGeographicThreat: async (data) => {
    const response = await api.post("/simulation/geographic-threat", data);
    return response.data;
  },

  // Get simulation stats
  getStats: async () => {
    const response = await api.get("/simulation/stats");
    return response.data;
  },
};

export default api;
