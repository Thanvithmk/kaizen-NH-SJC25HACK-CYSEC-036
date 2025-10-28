import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { dashboardAPI, alertsAPI } from "../services/api";
import socketService from "../services/socket";
import { toast } from "react-toastify";

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [stats, setStats] = useState({
    activeUsers: 0,
    activeThreats: 0,
    solvedThreats: 0,
    totalEmployees: 0,
    recentAlertsCount: 0,
    highRiskAlerts: 0,
    systemStatus: "Online",
    lastUpdated: new Date(),
  });

  const [alerts, setAlerts] = useState([]);
  const [highRiskEmployees, setHighRiskEmployees] = useState([]);
  const [alertDistribution, setAlertDistribution] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await dashboardAPI.getStats();
      if (response.success) {
        setStats(response.stats);
        setAlertDistribution(response.alertDistribution || []);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await alertsAPI.getAlerts(params);
      if (response.success) {
        setAlerts(response.alerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch high-risk employees
  const fetchHighRiskEmployees = useCallback(async () => {
    try {
      const response = await dashboardAPI.getHighRiskEmployees(5);
      if (response.success) {
        setHighRiskEmployees(response.employees);
      }
    } catch (error) {
      console.error("Error fetching high-risk employees:", error);
    }
  }, []);

  // Solve an alert
  const solveAlert = async (alertId) => {
    try {
      const response = await alertsAPI.solveAlert(alertId);
      if (response.success) {
        toast.success("Alert marked as solved");
        // Refresh data
        await Promise.all([fetchStats(), fetchAlerts({ solved: "N" })]);
        return { success: true };
      }
    } catch (error) {
      console.error("Error solving alert:", error);
      toast.error("Failed to solve alert");
      return { success: false };
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeDashboard = async () => {
      await Promise.all([
        fetchStats(),
        fetchAlerts({ solved: "N", limit: 50 }),
        fetchHighRiskEmployees(),
      ]);
    };

    initializeDashboard();
  }, [fetchStats, fetchAlerts, fetchHighRiskEmployees]);

  // Setup real-time updates
  useEffect(() => {
    socketService.connect();

    // Listen for new alerts
    const handleNewAlert = (alertData) => {
      console.log("New alert received:", alertData);
      toast.warning("🚨 New threat detected!", {
        autoClose: 5000,
      });

      // Refresh data
      fetchStats();
      fetchAlerts({ solved: "N", limit: 50 });
      fetchHighRiskEmployees();
    };

    // Listen for stats updates
    const handleStatsUpdate = (statsData) => {
      console.log("Stats updated:", statsData);
      setStats((prevStats) => ({ ...prevStats, ...statsData }));
      setLastUpdate(new Date());
    };

    socketService.on("newAlert", handleNewAlert);
    socketService.on("statsUpdate", handleStatsUpdate);

    // Cleanup
    return () => {
      socketService.off("newAlert", handleNewAlert);
      socketService.off("statsUpdate", handleStatsUpdate);
    };
  }, [fetchStats, fetchAlerts, fetchHighRiskEmployees]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
      fetchAlerts({ solved: "N", limit: 50 });
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStats, fetchAlerts]);

  const value = {
    stats,
    alerts,
    highRiskEmployees,
    alertDistribution,
    loading,
    lastUpdate,
    fetchStats,
    fetchAlerts,
    fetchHighRiskEmployees,
    solveAlert,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

