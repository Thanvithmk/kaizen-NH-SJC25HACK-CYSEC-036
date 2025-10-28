import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: (employee_token) => api.post("/auth/logout", { employee_token }),
  register: (employeeData) => api.post("/auth/register", employeeData),
  getSession: (token) => api.get(`/auth/session/${token}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getHighRiskEmployees: (limit = 5) =>
    api.get(`/dashboard/high-risk-employees?limit=${limit}`),
  getRecentActivity: (limit = 10) =>
    api.get(`/dashboard/recent-activity?limit=${limit}`),
};

// Alerts API
export const alertsAPI = {
  getAlerts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/alerts?${queryString}`);
  },
  getAlertById: (id) => api.get(`/alerts/${id}`),
  solveAlert: (id) => api.put(`/alerts/${id}/solve`),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
};

// Geographic API
export const geographicAPI = {
  getOverview: () => api.get("/geographic/overview"),
  getAlerts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/geographic/alerts?${queryString}`);
  },
  verifyAlert: (id, verified) =>
    api.put(`/geographic/${id}/verify`, { verified }),
};

// Employees API
export const employeesAPI = {
  getAll: (status) =>
    api.get(`/employees${status !== undefined ? `?status=${status}` : ""}`),
  getActive: () => api.get("/employees/active"),
  getById: (token) => api.get(`/employees/${token}`),
  update: (token, data) => api.put(`/employees/${token}`, data),
};

// Health check
export const healthCheck = () => api.get("/health");

export default api;

