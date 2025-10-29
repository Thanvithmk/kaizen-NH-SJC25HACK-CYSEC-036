import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import StatsCards from "../components/StatsCards";
import ThreatTrends from "../components/ThreatTrends";
import NetworkActivityMap from "../components/NetworkActivityMap";
import UserAccessLog from "../components/UserAccessLog";
import AlertDistribution from "../components/AlertDistribution";

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
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchBar = styled.div`
  position: relative;
  max-width: 400px;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 20px 14px 48px;
  background: rgba(30, 20, 50, 0.6);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 50px;
  color: #e9d5ff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: #a78bfa;
  }

  &:focus {
    border-color: #8b5cf6;
    background: rgba(30, 20, 50, 0.8);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #a78bfa;
  font-weight: 600;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserInfo = styled.div`
  text-align: right;

  .name {
    font-size: 14px;
    font-weight: 600;
    color: #e9d5ff;
  }

  .token {
    font-size: 12px;
    color: #a78bfa;
  }
`;

const LogoutButton = styled.button`
  padding: 10px 20px;
  background: rgba(139, 92, 246, 0.2);
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 10px;
  color: #e9d5ff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(139, 92, 246, 0.3);
    border-color: #8b5cf6;
    transform: translateY(-2px);
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
`;

const FullWidthSection = styled.div`
  margin-bottom: 24px;
`;

const Dashboard = () => {
  const { stats } = useDashboard();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <DashboardLayout>
      <Sidebar />

      <MainContent>
        <Header>
          <SearchBar>
            <SearchIcon>⌕</SearchIcon>
            <SearchInput type="text" placeholder="Search here" />
          </SearchBar>

          <UserSection>
            <UserInfo>
              <div className="name">
                {user?.employee_name || "Security Admin"}
              </div>
              <div className="token">{user?.employee_token || "N/A"}</div>
            </UserInfo>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </UserSection>
        </Header>

        <StatsCards stats={stats} />

        <TwoColumnGrid>
          <ThreatTrends />
          <NetworkActivityMap />
        </TwoColumnGrid>

        <TwoColumnGrid>
          <UserAccessLog />
          <AlertDistribution />
        </TwoColumnGrid>
      </MainContent>
    </DashboardLayout>
  );
};

export default Dashboard;
