import React from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const HeaderContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }

  span {
    font-size: 14px;
    opacity: 0.9;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const UserInfo = styled.div`
  text-align: right;

  .name {
    font-weight: 600;
    font-size: 15px;
  }

  .token {
    font-size: 13px;
    opacity: 0.8;
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  color: white;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: white;
    color: #667eea;
  }
`;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <div>
            <h1>🛡️ Vigilant Guard</h1>
            <span>Security Dashboard</span>
          </div>
        </Logo>

        <UserSection>
          <UserInfo>
            <div className="name">
              {user?.employee_name || "Security Admin"}
            </div>
            <div className="token">{user?.employee_token || "N/A"}</div>
          </UserInfo>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </UserSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;

