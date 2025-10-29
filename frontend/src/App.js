import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import Dashboard from "./pages/Dashboard";
import ActiveThreats from "./pages/ActiveThreats";
import SolvedThreats from "./pages/SolvedThreats";
import Logs from "./pages/Logs";

function App() {
  return (
    <Router>
      <AuthProvider>
        <DashboardProvider>
          <div className="App">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/dashboard/active-threats"
                element={<ActiveThreats />}
              />
              <Route
                path="/dashboard/solved-threats"
                element={<SolvedThreats />}
              />
              <Route path="/dashboard/logs" element={<Logs />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </DashboardProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
