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

// File API
export const fileAPI = {
  // Get list of available files
  getFileList: async () => {
    const response = await api.get("/files/list");
    return response.data;
  },

  // Download a file (returns blob for download)
  downloadFile: (filename, employeeToken) => {
    const url = `${API_BASE_URL}/files/download/${filename}?employee_token=${employeeToken}`;
    return url;
  },
};

export default api;
