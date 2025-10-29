import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { simulationAPI } from "../services/api";
import socketService from "../services/socket";

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0a1f 0%, #2d1b4e 50%, #1a0b2e 100%);
  padding: 40px 20px;
  position: relative;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
  position: relative;
  z-index: 1;

  h1 {
    font-size: 48px;
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
    font-size: 18px;
    color: #a78bfa;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const LoginSection = styled.div`
  max-width: 480px;
  margin: 0 auto 60px;
`;

const LoginCard = styled.div`
  background: rgba(30, 20, 50, 0.8);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 24px;
  padding: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #e9d5ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  padding: 14px 18px;
  background: rgba(15, 10, 31, 0.6);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  color: #e9d5ff;
  font-size: 15px;
  font-weight: 500;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: #a78bfa;
    opacity: 0.6;
  }

  &:focus {
    border-color: #8b5cf6;
    background: rgba(15, 10, 31, 0.8);
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 16px 24px;
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.6);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ForgotPasswordLink = styled.div`
  text-align: center;
  margin-top: 12px;

  button {
    background: none;
    border: none;
    color: #a78bfa;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.3s ease;

    &:hover {
      color: #8b5cf6;
    }
  }
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 40px 0 30px;
  gap: 16px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(139, 92, 246, 0.3);
  }

  span {
    color: #a78bfa;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const SimulationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 32px;
  margin-top: 40px;
`;

const ThreatCard = styled.div`
  background: ${(props) => props.gradient || "rgba(30, 20, 50, 0.6)"};
  border: 2px solid ${(props) => props.borderColor || "rgba(139, 92, 246, 0.2)"};
  border-radius: 20px;
  padding: 28px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px ${(props) => props.shadowColor || "rgba(139, 92, 246, 0.3)"};
    border-color: ${(props) => props.hoverBorderColor || "rgba(139, 92, 246, 0.4)"};
  }
`;

const ThreatIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ThreatTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${(props) => props.color || "#e2e8f0"};
  margin-bottom: 12px;
`;

const ThreatDescription = styled.p`
  font-size: 14px;
  color: #c4b5fd;
  line-height: 1.5;
  margin-bottom: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ThreatButton = styled.button`
  padding: 12px 20px;
  background: ${(props) => props.bg || "rgba(255, 255, 255, 0.1)"};
  border: 2px solid ${(props) => props.borderColor || "rgba(255, 255, 255, 0.2)"};
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 13px;
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
    font-size: 16px;
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

const ConnectionStatus = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  background: ${(props) =>
    props.connected ? "rgba(139, 92, 246, 0.2)" : "rgba(239, 68, 68, 0.2)"};
  border: 2px solid
    ${(props) =>
      props.connected ? "rgba(139, 92, 246, 0.5)" : "rgba(239, 68, 68, 0.5)"};
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => (props.connected ? "#a78bfa" : "#fca5a5")};
  z-index: 100;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${(props) => (props.connected ? "#a78bfa" : "#ef4444")};
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

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [employeeToken, setEmployeeToken] = useState("EMP999");
  const [simulationLoading, setSimulationLoading] = useState({});

  useEffect(() => {
    // Connect to Socket.IO
    const socket = socketService.connect();

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("new_threat", (threat) => {
      toast.success(
        `✅ Threat detected in Security Dashboard!\nType: ${threat.threat_type}`
      );
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.employeeId.trim()) {
      setError("Please enter your Employee ID");
      return;
    }

    if (!formData.password.trim()) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("employeeId", formData.employeeId);
      localStorage.setItem("loginTime", new Date().toISOString());

      toast.success(`Welcome, ${formData.employeeId}!`);
      navigate("/simulation");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info("Please contact your system administrator to reset your password.", {
      autoClose: 5000,
    });
  };

  const simulateThreat = async (threatType, subType) => {
    const key = `${threatType}_${subType}`;
    setSimulationLoading((prev) => ({ ...prev, [key]: true }));

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
      }
    } catch (error) {
      toast.error(
        `❌ ${error.response?.data?.message || "Failed to simulate threat"}`
      );
    } finally {
      setSimulationLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <PageContainer>
      <ConnectionStatus connected={connected}>
        <div className="dot" />
        {connected ? "Connected to Dashboard" : "Disconnected"}
      </ConnectionStatus>

      <Header>
        <h1>
          <span>🛡️</span>
          Vigilant Guard
        </h1>
        <p>Employee Access Portal</p>
      </Header>

      <ContentWrapper>
        <LoginSection>
          <LoginCard>
            <Form onSubmit={handleSubmit}>
              {error && <ErrorMessage>{error}</ErrorMessage>}

              <InputGroup>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  placeholder="Enter Employee ID (e.g., EMP001)"
                  value={formData.employeeId}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="username"
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </InputGroup>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </SubmitButton>
            </Form>

            <ForgotPasswordLink>
              <button type="button" onClick={handleForgotPassword}>
                Forgot Password?
              </button>
            </ForgotPasswordLink>
          </LoginCard>
        </LoginSection>

        <Divider>
          <span>Threat Simulation</span>
        </Divider>

        <LoginSection>
          <InputGroup>
            <Label htmlFor="employeeToken">Simulation Employee Token</Label>
            <Input
              type="text"
              id="employeeToken"
              name="employeeToken"
              placeholder="Enter Employee Token for Simulation (e.g., EMP999)"
              value={employeeToken}
              onChange={(e) => setEmployeeToken(e.target.value.toUpperCase())}
            />
          </InputGroup>
        </LoginSection>

        <SimulationGrid>
          {/* Login Anomaly Detection */}
          <ThreatCard
            gradient="rgba(20, 184, 166, 0.1)"
            borderColor="rgba(20, 184, 166, 0.3)"
            shadowColor="rgba(20, 184, 166, 0.4)"
          >
            <ThreatIcon>🔐</ThreatIcon>
            <ThreatTitle color="#14b8a6">Login Anomaly Detection</ThreatTitle>
            <ThreatDescription>
              Simulate suspicious login activities including failed attempts,
              odd-hour access, and rapid login attempts.
            </ThreatDescription>
            <ButtonGroup>
              <ThreatButton
                bg="rgba(20, 184, 166, 0.15)"
                borderColor="rgba(20, 184, 166, 0.4)"
                hoverBg="rgba(20, 184, 166, 0.25)"
                onClick={() => simulateThreat("login", "failed_attempts")}
                disabled={simulationLoading.login_failed_attempts}
              >
                <span className="label">
                  {simulationLoading.login_failed_attempts
                    ? "Simulating..."
                    : "Failed Login Attempts"}
                </span>
                <span className="emoji">❌</span>
              </ThreatButton>

              <ThreatButton
                bg="rgba(20, 184, 166, 0.15)"
                borderColor="rgba(20, 184, 166, 0.4)"
                hoverBg="rgba(20, 184, 166, 0.25)"
                onClick={() => simulateThreat("login", "odd_hours")}
                disabled={simulationLoading.login_odd_hours}
              >
                <span className="label">
                  {simulationLoading.login_odd_hours
                    ? "Simulating..."
                    : "Odd-Hour Login (2:30 AM)"}
                </span>
                <span className="emoji">🌙</span>
              </ThreatButton>

              <ThreatButton
                bg="rgba(20, 184, 166, 0.15)"
                borderColor="rgba(20, 184, 166, 0.4)"
                hoverBg="rgba(20, 184, 166, 0.25)"
                onClick={() => simulateThreat("login", "rapid_succession")}
                disabled={simulationLoading.login_rapid_succession}
              >
                <span className="label">
                  {simulationLoading.login_rapid_succession
                    ? "Simulating..."
                    : "Rapid Login Attempts"}
                </span>
                <span className="emoji">⚡</span>
              </ThreatButton>
            </ButtonGroup>
          </ThreatCard>

          {/* Bulk Download Detection */}
          <ThreatCard
            gradient="rgba(99, 102, 241, 0.1)"
            borderColor="rgba(99, 102, 241, 0.3)"
            shadowColor="rgba(99, 102, 241, 0.4)"
          >
            <ThreatIcon>📦</ThreatIcon>
            <ThreatTitle color="#6366f1">Bulk Download Detection</ThreatTitle>
            <ThreatDescription>
              Simulate large-scale file downloads that may indicate data
              exfiltration attempts.
            </ThreatDescription>
            <ButtonGroup>
              <ThreatButton
                bg="rgba(99, 102, 241, 0.15)"
                borderColor="rgba(99, 102, 241, 0.4)"
                hoverBg="rgba(99, 102, 241, 0.25)"
                onClick={() => simulateThreat("bulk", "large_files")}
                disabled={simulationLoading.bulk_large_files}
              >
                <span className="label">
                  {simulationLoading.bulk_large_files
                    ? "Simulating..."
                    : "Large Files (5 GB)"}
                </span>
                <span className="emoji">💾</span>
              </ThreatButton>

              <ThreatButton
                bg="rgba(99, 102, 241, 0.15)"
                borderColor="rgba(99, 102, 241, 0.4)"
                hoverBg="rgba(99, 102, 241, 0.25)"
                onClick={() => simulateThreat("bulk", "many_files")}
                disabled={simulationLoading.bulk_many_files}
              >
                <span className="label">
                  {simulationLoading.bulk_many_files
                    ? "Simulating..."
                    : "Many Files (500 files)"}
                </span>
                <span className="emoji">📁</span>
              </ThreatButton>

              <ThreatButton
                bg="rgba(99, 102, 241, 0.15)"
                borderColor="rgba(99, 102, 241, 0.4)"
                hoverBg="rgba(99, 102, 241, 0.25)"
                onClick={() => simulateThreat("bulk", "odd_hours")}
                disabled={simulationLoading.bulk_odd_hours}
              >
                <span className="label">
                  {simulationLoading.bulk_odd_hours
                    ? "Simulating..."
                    : "Odd-Hour Download (3:00 AM)"}
                </span>
                <span className="emoji">🌙</span>
              </ThreatButton>
            </ButtonGroup>
          </ThreatCard>

          {/* Geographic Anomaly Detection */}
          <ThreatCard
            gradient="rgba(236, 72, 153, 0.1)"
            borderColor="rgba(236, 72, 153, 0.3)"
            shadowColor="rgba(236, 72, 153, 0.4)"
          >
            <ThreatIcon>🌍</ThreatIcon>
            <ThreatTitle color="#ec4899">
              Geographic Anomaly Detection
            </ThreatTitle>
            <ThreatDescription>
              Simulate impossible travel patterns, high-risk country access, and
              unusual geographic locations.
            </ThreatDescription>
            <ButtonGroup>
              <ThreatButton
                bg="rgba(236, 72, 153, 0.15)"
                borderColor="rgba(236, 72, 153, 0.4)"
                hoverBg="rgba(236, 72, 153, 0.25)"
                onClick={() => simulateThreat("geo", "impossible_travel")}
                disabled={simulationLoading.geo_impossible_travel}
              >
                <span className="label">
                  {simulationLoading.geo_impossible_travel
                    ? "Simulating..."
                    : "Impossible Travel (NY → Beijing)"}
                </span>
                <span className="emoji">✈️</span>
              </ThreatButton>

              <ThreatButton
                bg="rgba(236, 72, 153, 0.15)"
                borderColor="rgba(236, 72, 153, 0.4)"
                hoverBg="rgba(236, 72, 153, 0.25)"
                onClick={() => simulateThreat("geo", "high_risk_country")}
                disabled={simulationLoading.geo_high_risk_country}
              >
                <span className="label">
                  {simulationLoading.geo_high_risk_country
                    ? "Simulating..."
                    : "High-Risk Country Access"}
                </span>
                <span className="emoji">⚠️</span>
              </ThreatButton>

              <ThreatButton
                bg="rgba(236, 72, 153, 0.15)"
                borderColor="rgba(236, 72, 153, 0.4)"
                hoverBg="rgba(236, 72, 153, 0.25)"
                onClick={() => simulateThreat("geo", "new_location")}
                disabled={simulationLoading.geo_new_location}
              >
                <span className="label">
                  {simulationLoading.geo_new_location
                    ? "Simulating..."
                    : "New Location (Russia)"}
                </span>
                <span className="emoji">📍</span>
              </ThreatButton>
            </ButtonGroup>
          </ThreatCard>
        </SimulationGrid>
      </ContentWrapper>
    </PageContainer>
  );
};

export default EmployeeLogin;
