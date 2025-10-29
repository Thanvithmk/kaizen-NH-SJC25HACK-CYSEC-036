import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmployeeLogin from "./pages/EmployeeLogin";
import SimulationPortal from "./pages/SimulationPortal";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EmployeeLogin />} />
        <Route path="/login" element={<EmployeeLogin />} />
        <Route path="/simulation" element={<SimulationPortal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
        theme="dark"
      />
    </Router>
  );
}

export default App;
