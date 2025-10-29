import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { employeeAPI } from "../services/api";
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

  useEffect(() => {
    // Connect to Socket.IO
    const socket = socketService.connect();

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Removed threat notification popup - monitoring should be invisible to employees

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
      const response = await employeeAPI.login({
        employeeId: formData.employeeId.toUpperCase(),
        password: formData.password,
        ip_address: "127.0.0.1", // In production, get actual IP
        location: {
          country: "United States",
          city: "New York",
          latitude: 40.7128,
          longitude: -74.006,
        },
      });

      if (response.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("employeeId", response.employee.emp_token);
        localStorage.setItem("employeeName", response.employee.emp_name);
        localStorage.setItem("loginTime", new Date().toISOString());

        toast.success(`Welcome back, ${response.employee.emp_name}!`);
        navigate("/files");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Login failed. Please try again.";
      const failedAttempts = err.response?.data?.failedAttempts;

      if (failedAttempts) {
        setError(`${errorMsg}. Please try again.`);

        if (failedAttempts >= 5) {
          toast.error(
            "Too many failed attempts. Please contact IT support if you need help.",
            {
              autoClose: 5000,
            }
          );
        } else if (failedAttempts >= 3) {
          toast.warning(
            "Multiple incorrect password attempts. Please check your credentials.",
            {
              autoClose: 4000,
            }
          );
        }
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info(
      "Please contact your system administrator to reset your password.",
      {
        autoClose: 5000,
      }
    );
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
      </ContentWrapper>
    </PageContainer>
  );
};

export default EmployeeLogin;
