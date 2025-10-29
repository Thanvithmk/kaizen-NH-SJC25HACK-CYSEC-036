import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const DashboardLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0a1f 0%, #2d1b4e 50%, #1a0b2e 100%);
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 260px;
  padding: 32px;
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  p {
    color: #a78bfa;
    font-size: 14px;
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: rgba(30, 20, 50, 0.8);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;

  .label {
    font-size: 12px;
    color: #a78bfa;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .value {
    font-size: 32px;
    font-weight: 800;
    color: #e9d5ff;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 10px 20px;
  background: ${(props) =>
    props.active ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.2)"};
  border: 2px solid
    ${(props) =>
      props.active ? "rgba(139, 92, 246, 0.6)" : "rgba(139, 92, 246, 0.4)"};
  border-radius: 10px;
  color: #c4b5fd;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.6);
  }
`;

const TableContainer = styled.div`
  background: rgba(30, 20, 50, 0.8);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #e9d5ff;
`;

const TableHead = styled.thead`
  background: rgba(139, 92, 246, 0.2);
`;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  transition: background 0.3s ease;

  &:hover {
    background: rgba(139, 92, 246, 0.1);
  }
`;

const TableHeader = styled.th`
  padding: 16px 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #a78bfa;
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: 14px 12px;
  font-size: 14px;
  color: #c4b5fd;
`;

const RiskBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${(props) =>
    props.level === "Critical"
      ? "rgba(239, 68, 68, 0.2)"
      : props.level === "High"
      ? "rgba(245, 158, 11, 0.2)"
      : props.level === "Medium"
      ? "rgba(59, 130, 246, 0.2)"
      : "rgba(16, 185, 129, 0.2)"};
  color: ${(props) =>
    props.level === "Critical"
      ? "#fca5a5"
      : props.level === "High"
      ? "#fbbf24"
      : props.level === "Medium"
      ? "#93c5fd"
      : "#6ee7b7"};
  border: 1px solid
    ${(props) =>
      props.level === "Critical"
        ? "rgba(239, 68, 68, 0.4)"
        : props.level === "High"
        ? "rgba(245, 158, 11, 0.4)"
        : props.level === "Medium"
        ? "rgba(59, 130, 246, 0.4)"
        : "rgba(16, 185, 129, 0.4)"};
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.4);
`;

const SolveButton = styled.button`
  padding: 8px 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #a78bfa;
  font-size: 18px;
  font-weight: 600;
`;

const ActiveThreats = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    unsolved: 0,
    critical: 0,
    high: 0,
  });

  useEffect(() => {
    fetchThreats();
  }, [filter]);

  const fetchThreats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("solved", "N"); // Only unsolved threats

      if (filter !== "all") {
        params.append("alert_type", filter);
      }

      const response = await axios.get(
        `${API_BASE_URL}/alerts?${params.toString()}`
      );

      if (response.data.success) {
        setThreats(response.data.alerts);

        // Calculate stats
        const total = response.data.total;
        const unsolved = response.data.alerts.length;
        const critical = response.data.alerts.filter(
          (t) => t.risk_level === "Critical"
        ).length;
        const high = response.data.alerts.filter(
          (t) => t.risk_level === "High"
        ).length;

        setStats({ total, unsolved, critical, high });
      }
    } catch (error) {
      toast.error("Failed to load threats");
      console.error("Error fetching threats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSolved = async (threatId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/alerts/${threatId}/solve`
      );

      if (response.data.success) {
        toast.success("Threat marked as solved!");
        fetchThreats(); // Refresh the list
      }
    } catch (error) {
      toast.error("Failed to update threat status");
      console.error("Error marking threat as solved:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Sidebar />
        <MainContent>
          <LoadingSpinner>Loading active threats...</LoadingSpinner>
        </MainContent>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Sidebar />
      <MainContent>
        <Header>
          <h1>Active Threats</h1>
          <p>Unsolved security threats requiring attention</p>
        </Header>

        <StatsBar>
          <StatCard>
            <div className="label">Total Active</div>
            <div className="value">{stats.unsolved}</div>
          </StatCard>
          <StatCard>
            <div className="label">Critical</div>
            <div className="value">{stats.critical}</div>
          </StatCard>
          <StatCard>
            <div className="label">High Risk</div>
            <div className="value">{stats.high}</div>
          </StatCard>
        </StatsBar>

        <FilterBar>
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All Types
          </FilterButton>
          <FilterButton
            active={filter === "login"}
            onClick={() => setFilter("login")}
          >
            Login Threats
          </FilterButton>
          <FilterButton
            active={filter === "bulk"}
            onClick={() => setFilter("bulk")}
          >
            Download Threats
          </FilterButton>
          <FilterButton
            active={filter === "geo"}
            onClick={() => setFilter("geo")}
          >
            Geographic Threats
          </FilterButton>
        </FilterBar>

        <TableContainer>
          {threats.length === 0 ? (
            <LoadingSpinner>No active threats found</LoadingSpinner>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Date & Time</TableHeader>
                  <TableHeader>Employee Token</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Risk Score</TableHeader>
                  <TableHeader>Risk Level</TableHeader>
                  <TableHeader>Details</TableHeader>
                  <TableHeader>Action</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {threats.map((threat) => (
                  <TableRow key={threat._id}>
                    <TableCell>{formatDate(threat.alert_date_time)}</TableCell>
                    <TableCell>
                      <strong>{threat.employee_token}</strong>
                    </TableCell>
                    <TableCell>
                      <TypeBadge>{threat.alert_type}</TypeBadge>
                    </TableCell>
                    <TableCell>
                      <strong>{threat.risk_score}</strong>
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={threat.risk_level}>
                        {threat.risk_level}
                      </RiskBadge>
                    </TableCell>
                    <TableCell>
                      {threat.details?.filename && (
                        <div>File: {threat.details.filename}</div>
                      )}
                      {threat.details?.total_size_mb && (
                        <div>Size: {threat.details.total_size_mb} MB</div>
                      )}
                      {threat.details?.anomalies && (
                        <div style={{ fontSize: "12px", color: "#a78bfa" }}>
                          {threat.details.anomalies[0]}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <SolveButton
                        onClick={() => handleMarkAsSolved(threat._id)}
                      >
                        Mark as Solved
                      </SolveButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </TableContainer>
      </MainContent>
    </DashboardLayout>
  );
};

export default ActiveThreats;
