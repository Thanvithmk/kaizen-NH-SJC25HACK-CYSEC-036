import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const RegistrationContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0a1f 0%, #2d1b4e 50%, #1a0b2e 100%);
  padding: 20px;
`;

const RegistrationCard = styled.div`
  background: rgba(30, 20, 50, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 24px;
  padding: 48px 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 32px;
    font-weight: 800;
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
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
  gap: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${(props) => (props.twoColumns ? "1fr 1fr" : "1fr")};
  gap: 16px;
`;

const FormGroup = styled.div`
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
  padding: 12px 16px;
  background: rgba(15, 10, 31, 0.6);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 10px;
  color: #e9d5ff;
  font-size: 14px;
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

const Select = styled.select`
  padding: 12px 16px;
  background: rgba(15, 10, 31, 0.6);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 10px;
  color: #e9d5ff;
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;

  option {
    background: #1a0b2e;
    color: #e9d5ff;
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

const LocationSection = styled.div`
  background: rgba(15, 10, 31, 0.4);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-top: 10px;

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: #a78bfa;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  label {
    font-size: 13px;
    color: #c4b5fd;
    cursor: pointer;
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
  margin-top: 12px;
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

const SecondaryButton = styled(Button)`
  background: transparent;
  border: 2px solid rgba(139, 92, 246, 0.4);
  box-shadow: none;

  &:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.1);
  }
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 13px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 10px;
  color: #6ee7b7;
  font-size: 13px;
  text-align: center;
`;

const EmployeeRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    emp_name: "",
    emp_id: "",
    password: "",
    confirmPassword: "",
    location_type: "Office",
    country: "",
    city: "",
    ip_range: "",
    usual_login_time: "09:00",
    usual_logout_time: "17:00",
    enableGeoVerification: true,
    strictMode: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.emp_name.trim()) {
      setError("Employee name is required");
      return false;
    }
    if (!formData.emp_id.trim()) {
      setError("Employee ID is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.country.trim()) {
      setError("Country is required");
      return false;
    }
    if (!formData.city.trim()) {
      setError("City is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const registrationData = {
        emp_name: formData.emp_name,
        emp_id: formData.emp_id,
        password: formData.password,
        location_type: formData.location_type,
        country: formData.country,
        city: formData.city,
        ip_range: formData.ip_range || "",
        usual_login_time: formData.usual_login_time,
        usual_logout_time: formData.usual_logout_time,
        location_verification_enabled: formData.enableGeoVerification,
        strict_mode: formData.strictMode,
      };

      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        registrationData
      );

      if (response.data.success) {
        setSuccess(
          `Registration successful! Your employee token is: ${response.data.employee_token}`
        );
        toast.success("Registration successful!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationContainer>
      <RegistrationCard>
        <Logo>
          <h1>📝 Employee Registration</h1>
          <p>Vigilant Guard - Insider Threat Detection</p>
        </Logo>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          {/* Personal Information */}
          <FormGroup>
            <Label htmlFor="emp_name">Full Name *</Label>
            <Input
              id="emp_name"
              name="emp_name"
              type="text"
              placeholder="John Smith"
              value={formData.emp_name}
              onChange={handleChange}
              disabled={loading || success}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="emp_id">Employee ID *</Label>
            <Input
              id="emp_id"
              name="emp_id"
              type="text"
              placeholder="E001"
              value={formData.emp_id}
              onChange={handleChange}
              disabled={loading || success}
              required
            />
          </FormGroup>

          {/* Password */}
          <FormRow twoColumns>
            <FormGroup>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={loading || success}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading || success}
                required
              />
            </FormGroup>
          </FormRow>

          {/* Location Information */}
          <LocationSection>
            <h3>🌍 Primary Location</h3>

            <FormGroup>
              <Label htmlFor="location_type">Location Type</Label>
              <Select
                id="location_type"
                name="location_type"
                value={formData.location_type}
                onChange={handleChange}
                disabled={loading || success}
              >
                <option value="Office">Office</option>
                <option value="Home">Home/Remote</option>
                <option value="Hybrid">Hybrid</option>
              </Select>
            </FormGroup>

            <FormRow twoColumns>
              <FormGroup>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="United States"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={loading || success}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="New York"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={loading || success}
                  required
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label htmlFor="ip_range">IP Range (Optional)</Label>
              <Input
                id="ip_range"
                name="ip_range"
                type="text"
                placeholder="192.168.1.0/24"
                value={formData.ip_range}
                onChange={handleChange}
                disabled={loading || success}
              />
            </FormGroup>

            <FormRow twoColumns>
              <FormGroup>
                <Label htmlFor="usual_login_time">Usual Login Time</Label>
                <Input
                  id="usual_login_time"
                  name="usual_login_time"
                  type="time"
                  value={formData.usual_login_time}
                  onChange={handleChange}
                  disabled={loading || success}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="usual_logout_time">Usual Logout Time</Label>
                <Input
                  id="usual_logout_time"
                  name="usual_logout_time"
                  type="time"
                  value={formData.usual_logout_time}
                  onChange={handleChange}
                  disabled={loading || success}
                />
              </FormGroup>
            </FormRow>
          </LocationSection>

          {/* Security Settings */}
          <LocationSection>
            <h3>🔒 Security Settings</h3>

            <Checkbox>
              <input
                type="checkbox"
                id="enableGeoVerification"
                name="enableGeoVerification"
                checked={formData.enableGeoVerification}
                onChange={handleChange}
                disabled={loading || success}
              />
              <label htmlFor="enableGeoVerification">
                Enable geolocation verification (recommended)
              </label>
            </Checkbox>

            <Checkbox>
              <input
                type="checkbox"
                id="strictMode"
                name="strictMode"
                checked={formData.strictMode}
                onChange={handleChange}
                disabled={loading || success || !formData.enableGeoVerification}
              />
              <label htmlFor="strictMode">
                Enable strict mode (only verified locations allowed)
              </label>
            </Checkbox>
          </LocationSection>

          {/* Buttons */}
          <Button type="submit" disabled={loading || success}>
            {loading
              ? "Creating Account..."
              : success
              ? "✓ Registered!"
              : "Create Account"}
          </Button>

          <SecondaryButton
            type="button"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            ← Back to Login
          </SecondaryButton>
        </Form>
      </RegistrationCard>
    </RegistrationContainer>
  );
};

export default EmployeeRegistration;
