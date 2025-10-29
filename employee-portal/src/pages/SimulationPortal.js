import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { simulationAPI } from "../services/api";
import socketService from "../services/socket";

const PortalContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 40px 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;

  h1 {
    font-size: 48px;
    font-weight: 800;
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
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
    font-size: 18px;
    color: #94a3b8;
    font-weight: 500;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const EmployeeSelector = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(6, 182, 212, 0.3);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 40px;

  h3 {
    font-size: 20px;
    color: #e2e8f0;
    margin-bottom: 20px;
    font-weight: 600;
  }

  .input-group {
    display: flex;
    gap: 16px;
    align-items: center;

    label {
      font-size: 16px;
      color: #cbd5e1;
      font-weight: 600;
    }

    input {
      flex: 1;
      padding: 14px 20px;
      background: rgba(15, 23, 42, 0.6);
      border: 2px solid rgba(6, 182, 212, 0.3);
      border-radius: 12px;
      color: #e2e8f0;
      font-size: 16px;
      font-weight: 600;
      outline: none;
      transition: all 0.3s ease;

      &:focus {
        border-color: #06b6d4;
        background: rgba(15, 23, 42, 0.8);
      }
    }
  }
`;

const ThreatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
  margin-bottom: 40px;
`;

const ThreatCard = styled.div`
  background: ${(props) => props.gradient || "rgba(255, 255, 255, 0.05)"};
  border: 2px solid
    ${(props) => props.borderColor || "rgba(255, 255, 255, 0.1)"};
  border-radius: 24px;
  padding: 32px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px
      ${(props) => props.shadowColor || "rgba(0, 0, 0, 0.3)"};
  }
`;

const ThreatIcon = styled.div`
  font-size: 52px;
  margin-bottom: 20px;
`;

const ThreatTitle = styled.h2`
  font-size: 26px;
  font-weight: 700;
  color: ${(props) => props.color || "#e2e8f0"};
  margin-bottom: 16px;
`;

const ThreatDescription = styled.p`
  font-size: 15px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 28px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ThreatButton = styled.button`
  padding: 14px 24px;
  background: ${(props) => props.bg || "rgba(255, 255, 255, 0.1)"};
  border: 2px solid
    ${(props) => props.borderColor || "rgba(255, 255, 255, 0.2)"};
  border-radius: 12px;
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .label {
    flex: 1;
  }

  .emoji {
    font-size: 18px;
  }

  &:hover:not(:disabled) {
    background: ${(props) => props.hoverBg || "rgba(255, 255, 255, 0.2)"};
    transform: translateX(4px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatsBar = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(6, 182, 212, 0.3);
  border-radius: 20px;
  padding: 32px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
`;

const StatItem = styled.div`
  text-align: center;

  .value {
    font-size: 42px;
    font-weight: 800;
    color: ${(props) => props.color || "#06b6d4"};
    margin-bottom: 8px;
  }

  .label {
    font-size: 14px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
  }
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

const NavButton = styled.button`
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

  &:active {
    transform: translateY(0);
  }
`;

const ConnectionStatus = styled.div`
  padding: 12px 20px;
  background: ${(props) =>
    props.connected ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"};
  border: 2px solid
    ${(props) =>
      props.connected ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)"};
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.connected ? "#10b981" : "#ef4444")};

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${(props) => (props.connected ? "#10b981" : "#ef4444")};
    animation: ${(props) =>
      props.connected ? "pulse 2s ease-in-out infinite" : "none"};
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const SimulationPortal = () => {
  const navigate = useNavigate();
  const [employeeToken, setEmployeeToken] = useState("EMP999");
  const [loading, setLoading] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    login: 0,
    bulkDownload: 0,
    geographic: 0,
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO
    const socket = socketService.connect();

    socket.on("connect", () => {
      setConnected(true);
      toast.success("🔗 Connected to Security Dashboard");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      toast.error("❌ Disconnected from Security Dashboard");
    });

    // Listen for threat confirmations
    socket.on("new_threat", (threat) => {
      toast.success(
        `✅ Threat detected in Security Dashboard!\nType: ${threat.threat_type}\nSeverity: ${threat.severity_level}`
      );
      fetchStats();
    });

    // Fetch initial stats
    fetchStats();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await simulationAPI.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  const simulateThreat = async (threatType, subType) => {
    const key = `${threatType}_${subType}`;
    setLoading((prev) => ({ ...prev, [key]: true }));

    try {
      let response;
      const data = { employee_token: employeeToken, threat_type: subType };

      switch (threatType) {
        case "login":
          response = await simulationAPI.simulateLoginThreat(data);
          break;
        case "bulk":
          response = await simulationAPI.simulateBulkDownloadThreat(data);
          break;
        case "geo":
          response = await simulationAPI.simulateGeographicThreat(data);
          break;
        default:
          throw new Error("Invalid threat type");
      }

      if (response.success) {
        toast.success(`🎯 ${response.message}`);
        await fetchStats();
      }
    } catch (error) {
      toast.error(
        `❌ ${error.response?.data?.message || "Failed to simulate threat"}`
      );
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <PortalContainer>
      <TopBar>
        <NavButton onClick={goToLogin}>
          <span>🔐</span>
          Go to Login
        </NavButton>
        <ConnectionStatus connected={connected}>
          <div className="dot" />
          {connected ? "Connected to Security Dashboard" : "Disconnected"}
        </ConnectionStatus>
      </TopBar>

      <Header>
        <h1>
          <span>👤</span>
          Employee Simulation Portal
        </h1>
        <p>
          Simulate real-time insider threats and watch them appear on the
          Security Dashboard
        </p>
      </Header>

      <ContentWrapper>
        <EmployeeSelector>
          <h3>👤 Employee Identity</h3>
          <div className="input-group">
            <label>Employee Token:</label>
            <input
              type="text"
              value={employeeToken}
              onChange={(e) => setEmployeeToken(e.target.value.toUpperCase())}
              placeholder="EMP999"
            />
          </div>
        </EmployeeSelector>

        <ThreatGrid>
          {/* Login Threats */}
          <ThreatCard
            gradient="rgba(239, 68, 68, 0.1)"
            borderColor="rgba(239, 68, 68, 0.3)"
            shadowColor="rgba(239, 68, 68, 0.4)"
          >
            <ThreatIcon>🔐</ThreatIcon>
            <ThreatTitle color="#ef4444">Login Anomaly Detection</ThreatTitle>
            <ThreatDescription>
              Simulate suspicious login activities including failed attempts,
              odd-hour access, and rapid login attempts.
            </ThreatDescription>
            <ButtonGroup>
              <ThreatButton
                bg="rgba(239, 68, 68, 0.15)"
                borderColor="rgba(239, 68, 68, 0.4)"
                hoverBg="rgba(239, 68, 68, 0.25)"
                onClick={() => simulateThreat("login", "failed_attempts")}
                disabled={loading.login_failed_attempts}
              >
                <span className="label">
                  {loading.login_failed_attempts
                    ? "Simulating..."
                    : "Failed Login Attempts"}
                </span>
                <span className="emoji">❌</span>
              </ThreatButton>

              <ThreatButton
                bg="rgba(239, 68, 68, 0.15)"
                borderColor="rgba(239, 68, 68, 0.4)"
                hoverBg="rgba(239, 68, 68, 0.25)"
                onClick={() => simulateThreat("login", "odd_hours")}
                disabled={loading.login_odd_hours}
              >
                <span className="label">
                  {loading.login_odd_hours
                    ? "Simulating..."
                    : "Odd-Hour Login (2:30 AM)"}
                </span>
                <span className="emoji">🌙</span>
              </ThreatButton>

              <ThreatButton
                bg="rgba(239, 68, 68, 0.15)"
                borderColor="rgba(239, 68, 68, 0.4)"
                hoverBg="rgba(239, 68, 68, 0.25)"
                onClick={() => simulateThreat("login", "rapid_succession")}
                disabled={loading.login_rapid_succession}
              >
                <span className="label">
                  {loading.login_rapid_succession
                    ? "Simulating..."
                    : "Rapid Login Attempts"}
                </span>
                <span className="emoji">⚡</span>
              </ThreatButton>
            </ButtonGroup>
          </ThreatCard>

          {/* Bulk Download Threats */}
          <ThreatCard
            gradient="rgba(245, 158, 11, 0.1)"
            borderColor="rgba(245, 158, 11, 0.3)"
            shadowColor="rgba(245, 158, 11, 0.4)"
          >
            <ThreatIcon>📦</ThreatIcon>
            <ThreatTitle color="#f59e0b">Bulk Download Detection</ThreatTitle>
            <ThreatDescription>
              Simulate large-scale file downloads that may indicate data
              exfiltration attempts.
            </ThreatDescription>
            <ButtonGroup>
              <ThreatButton
                bg="rgba(245, 158, 11, 0.15)"
                borderColor="rgba(245, 158, 11, 0.4)"
                hoverBg="rgba(245, 158, 11, 0.25)"
                onClick={() => simulateThreat("bulk", "large_files")}
                disabled={loading.bulk_large_files}
              >
                <span className="label">
                  {loading.bulk_large_files
                    ? "Simulating..."
                    : "Large Files (5 GB)"}
                </span>
                <span className="emoji">💾</span>
              </ThreatButton>

              <ThreatButton
                bg="rgba(245, 158, 11, 0.15)"
                borderColor="rgba(245, 158, 11, 0.4)"
                hoverBg="rgba(245, 158, 11, 0.25)"
                onClick={() => simulateThreat("bulk", "many_files")}
                disabled={loading.bulk_many_files}
              >
                <span className="label">
                  {loading.bulk_many_files
                    ? "Simulating..."
                    : "Many Files (500 files)"}
                </span>
                <span className="emoji">📁</span>
              </ThreatButton>

              <ThreatButton
                bg="rgba(245, 158, 11, 0.15)"
                borderColor="rgba(245, 158, 11, 0.4)"
                hoverBg="rgba(245, 158, 11, 0.25)"
                onClick={() => simulateThreat("bulk", "odd_hours")}
                disabled={loading.bulk_odd_hours}
              >
                <span className="label">
                  {loading.bulk_odd_hours
                    ? "Simulating..."
                    : "Odd-Hour Download (3:00 AM)"}
                </span>
                <span className="emoji">🌙</span>
              </ThreatButton>
            </ButtonGroup>
          </ThreatCard>

          {/* Geographic Threats */}
          <ThreatCard
            gradient="rgba(139, 92, 246, 0.1)"
            borderColor="rgba(139, 92, 246, 0.3)"
            shadowColor="rgba(139, 92, 246, 0.4)"
          >
            <ThreatIcon>🌍</ThreatIcon>
            <ThreatTitle color="#8b5cf6">
              Geographic Anomaly Detection
            </ThreatTitle>
            <ThreatDescription>
              Simulate impossible travel patterns, high-risk country access, and
              unusual geographic locations.
            </ThreatDescription>
            <ButtonGroup>
              <ThreatButton
                bg="rgba(139, 92, 246, 0.15)"
                borderColor="rgba(139, 92, 246, 0.4)"
                hoverBg="rgba(139, 92, 246, 0.25)"
                onClick={() => simulateThreat("geo", "impossible_travel")}
                disabled={loading.geo_impossible_travel}
              >
                <span className="label">
                  {loading.geo_impossible_travel
                    ? "Simulating..."
                    : "Impossible Travel (NY → Beijing)"}
                </span>
                <span className="emoji">✈️</span>
              </ThreatButton>

              <ThreatButton
                bg="rgba(139, 92, 246, 0.15)"
                borderColor="rgba(139, 92, 246, 0.4)"
                hoverBg="rgba(139, 92, 246, 0.25)"
                onClick={() => simulateThreat("geo", "high_risk_country")}
                disabled={loading.geo_high_risk_country}
              >
                <span className="label">
                  {loading.geo_high_risk_country
                    ? "Simulating..."
                    : "High-Risk Country Access"}
                </span>
                <span className="emoji">⚠️</span>
              </ThreatButton>

              <ThreatButton
                bg="rgba(139, 92, 246, 0.15)"
                borderColor="rgba(139, 92, 246, 0.4)"
                hoverBg="rgba(139, 92, 246, 0.25)"
                onClick={() => simulateThreat("geo", "new_location")}
                disabled={loading.geo_new_location}
              >
                <span className="label">
                  {loading.geo_new_location
                    ? "Simulating..."
                    : "New Location (Russia)"}
                </span>
                <span className="emoji">📍</span>
              </ThreatButton>
            </ButtonGroup>
          </ThreatCard>
        </ThreatGrid>

        <StatsBar>
          <StatItem color="#06b6d4">
            <div className="value">{stats.total}</div>
            <div className="label">Total Threats</div>
          </StatItem>
          <StatItem color="#ef4444">
            <div className="value">{stats.login}</div>
            <div className="label">Login Anomalies</div>
          </StatItem>
          <StatItem color="#f59e0b">
            <div className="value">{stats.bulkDownload}</div>
            <div className="label">Bulk Downloads</div>
          </StatItem>
          <StatItem color="#8b5cf6">
            <div className="value">{stats.geographic}</div>
            <div className="label">Geographic Alerts</div>
          </StatItem>
        </StatsBar>
      </ContentWrapper>
    </PortalContainer>
  );
};

export default SimulationPortal;
