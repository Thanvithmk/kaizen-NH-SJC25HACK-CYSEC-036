import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0a1f 0%, #2d1b4e 50%, #1a0b2e 100%);
  padding: 40px 20px;
`;

const TopBar = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
`;

const BackButton = styled.button`
  padding: 12px 24px;
  background: rgba(139, 92, 246, 0.2);
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 12px;
  color: #c4b5fd;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.6);
    transform: translateY(-2px);
  }
`;

const UserInfo = styled.div`
  padding: 12px 20px;
  background: rgba(139, 92, 246, 0.2);
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 12px;
  color: #c4b5fd;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;

  h1 {
    font-size: 42px;
    font-weight: 800;
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  p {
    font-size: 16px;
    color: #a78bfa;
    font-weight: 500;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1600px;
  margin: 80px auto 40px;
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

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${(props) =>
    props.solved === "N"
      ? "rgba(239, 68, 68, 0.2)"
      : "rgba(16, 185, 129, 0.2)"};
  color: ${(props) => (props.solved === "N" ? "#fca5a5" : "#6ee7b7")};
  border: 1px solid
    ${(props) =>
      props.solved === "N"
        ? "rgba(239, 68, 68, 0.4)"
        : "rgba(16, 185, 129, 0.4)"};
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #a78bfa;
  font-size: 18px;
  font-weight: 600;
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
  padding: 16px;
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
    font-size: 28px;
    font-weight: 800;
    color: #e9d5ff;
  }
`;

const ActiveThreats = () => {
  const navigate = useNavigate();
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [employeeName, setEmployeeName] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    unsolved: 0,
    critical: 0,
    high: 0,
  });

  useEffect(() => {
    // Check if logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const empName = localStorage.getItem("employeeName");
    const empToken = localStorage.getItem("employeeId");

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setEmployeeName(empName || empToken || "Employee");
    fetchThreats();
  }, [navigate, filter]);

  const fetchThreats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filter !== "all") {
        if (filter === "unsolved") {
          params.append("solved", "N");
        } else if (filter === "solved") {
          params.append("solved", "Y");
        } else {
          params.append("alert_type", filter);
        }
      }

      const response = await axios.get(
        `${API_BASE_URL}/alerts?${params.toString()}`
      );

      if (response.data.success) {
        setThreats(response.data.alerts);

        // Calculate stats
        const total = response.data.total;
        const unsolved = response.data.alerts.filter(
          (t) => t.solved === "N"
        ).length;
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const goBack = () => {
    navigate("/files");
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner>Loading threats...</LoadingSpinner>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <TopBar>
        <BackButton onClick={goBack}>
          <span>←</span>
          Back to Files
        </BackButton>
        <UserInfo>
          <span>👤</span>
          {employeeName}
          <span
            style={{ marginLeft: "12px", cursor: "pointer" }}
            onClick={handleLogout}
          >
            🚪 Logout
          </span>
        </UserInfo>
      </TopBar>

      <Header>
        <h1>
          <span>🚨</span>
          Active Threats
        </h1>
        <p>Security Monitoring Dashboard</p>
      </Header>

      <ContentWrapper>
        <StatsBar>
          <StatCard>
            <div className="label">Total Threats</div>
            <div className="value">{stats.total}</div>
          </StatCard>
          <StatCard>
            <div className="label">Unsolved</div>
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
            All Threats
          </FilterButton>
          <FilterButton
            active={filter === "unsolved"}
            onClick={() => setFilter("unsolved")}
          >
            Unsolved
          </FilterButton>
          <FilterButton
            active={filter === "solved"}
            onClick={() => setFilter("solved")}
          >
            Solved
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
            <LoadingSpinner>No threats found</LoadingSpinner>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Date & Time</TableHeader>
                  <TableHeader>Employee</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Risk Score</TableHeader>
                  <TableHeader>Risk Level</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Details</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {threats.map((threat) => (
                  <TableRow key={threat._id}>
                    <TableCell>{formatDate(threat.alert_date_time)}</TableCell>
                    <TableCell>
                      <strong>{threat.employee_name}</strong>
                      <br />
                      <small style={{ color: "#a78bfa" }}>
                        {threat.employee_token}
                      </small>
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
                      <StatusBadge solved={threat.solved}>
                        {threat.solved === "N" ? "Unsolved" : "Solved"}
                      </StatusBadge>
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
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </TableContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

export default ActiveThreats;
