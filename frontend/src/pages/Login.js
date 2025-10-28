import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styled from "styled-components";

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0a1f 0%, #2d1b4e 50%, #1a0b2e 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: rgba(30, 20, 50, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 24px;
  padding: 48px 40px;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 36px;
    font-weight: 800;
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  p {
    color: #a78bfa;
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
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
  transition: all 0.3s ease;

  &::placeholder {
    color: #a78bfa;
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    background: rgba(15, 10, 31, 0.8);
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  padding: 16px;
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
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

const ErrorMessage = styled.div`
  padding: 14px 18px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 14px;
  text-align: center;
  margin-bottom: 12px;
`;

const InfoBox = styled.div`
  margin-top: 32px;
  padding: 24px;
  background: rgba(15, 10, 31, 0.6);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px;

  h4 {
    font-size: 14px;
    font-weight: 700;
    color: #a78bfa;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: 8px 0;
      color: #c4b5fd;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: "•";
        color: #8b5cf6;
        font-size: 18px;
      }
    }
  }
`;

const Login = () => {
  const [employeeToken, setEmployeeToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!employeeToken) {
      setError("Please enter your employee token");
      return;
    }

    setLoading(true);

    try {
      await login({ employee_token: employeeToken, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <h1>
            <span>🛡️</span> Vigilant Guard
          </h1>
          <p>Insider Threat Detection System</p>
        </Logo>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="employeeToken">Employee Token</Label>
            <Input
              id="employeeToken"
              type="text"
              placeholder="EMP001"
              value={employeeToken}
              onChange={(e) => setEmployeeToken(e.target.value.toUpperCase())}
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password (Optional)</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </Form>

        <InfoBox>
          <h4>📝 Demo Credentials</h4>
          <ul>
            <li>Employee Token: EMP001</li>
            <li>Employee Token: EMP002</li>
            <li>Employee Token: EMP003</li>
            <li>Password: Not required for demo</li>
          </ul>
        </InfoBox>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
