import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);

      if (response.success) {
        const { token, employee_token, employee_name } = response;
        const userData = { employee_token, employee_name };

        setToken(token);
        setUser(userData);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        toast.success(`Welcome, ${employee_name || employee_token}!`);
        return { success: true };
      }

      return { success: false, message: "Login failed" };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      if (user?.employee_token) {
        await authAPI.logout(user.employee_token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.info("Logged out successfully");
    }
  };

  const register = async (employeeData) => {
    try {
      const response = await authAPI.register(employeeData);

      if (response.success) {
        toast.success("Employee registered successfully!");
        return {
          success: true,
          employee_token: response.employee_token,
        };
      }

      return { success: false, message: "Registration failed" };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

