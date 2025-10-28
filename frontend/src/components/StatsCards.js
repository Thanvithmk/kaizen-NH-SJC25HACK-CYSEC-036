import React from "react";
import styled from "styled-components";

const StatsSection = styled.div`
  margin-bottom: 32px;
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px;
`;

const Card = styled.div`
  background: ${(props) => props.bg || "rgba(139, 92, 246, 0.2)"};
  border: 2px solid ${(props) => props.borderColor || "rgba(139, 92, 246, 0.4)"};
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.borderColor || "rgba(139, 92, 246, 0.4)"};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(139, 92, 246, 0.3);
    border-color: ${(props) => props.hoverBorder || props.borderColor || "#8b5cf6"};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CardIcon = styled.div`
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #e9d5ff;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardValue = styled.div`
  font-size: ${(props) => props.fontSize || "48px"};
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
`;

const CardFooter = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
`;

const RiskCard = styled(Card)`
  background: ${(props) => props.riskBg};
  border-color: ${(props) => props.riskBorder};
  
  &:hover {
    border-color: ${(props) => props.riskBorder};
  }
`;

const StatsCards = ({ stats }) => {
  return (
    <StatsSection>
      <TopRow>
        <Card
          bg="rgba(139, 92, 246, 0.2)"
          borderColor="rgba(139, 92, 246, 0.5)"
          hoverBorder="#8b5cf6"
        >
          <CardHeader>
            <CardIcon>👥</CardIcon>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardValue>{stats.activeUsers || 2735}</CardValue>
          {stats.totalEmployees > 0 && (
            <CardFooter>Total: {stats.totalEmployees}</CardFooter>
          )}
        </Card>

        <Card
          bg="rgba(139, 92, 246, 0.2)"
          borderColor="rgba(139, 92, 246, 0.5)"
          hoverBorder="#8b5cf6"
        >
          <CardHeader>
            <CardIcon>✅</CardIcon>
            <CardTitle>Solved Incidents</CardTitle>
          </CardHeader>
          <CardValue>{stats.solvedThreats || 800}</CardValue>
          <CardFooter>Last 2222</CardFooter>
        </Card>

        <Card
          bg="rgba(139, 92, 246, 0.2)"
          borderColor="rgba(139, 92, 246, 0.5)"
          hoverBorder="#8b5cf6"
        >
          <CardHeader>
            <CardIcon>🛡️</CardIcon>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardValue fontSize="32px">
            {stats.systemStatus || "Online"}
          </CardValue>
        </Card>
      </TopRow>

      <BottomRow>
        <Card
          bg="rgba(139, 92, 246, 0.2)"
          borderColor="rgba(139, 92, 246, 0.5)"
          hoverBorder="#8b5cf6"
        >
          <CardHeader>
            <CardIcon>⚠️</CardIcon>
            <CardTitle>Active threats</CardTitle>
          </CardHeader>
          <CardValue>{stats.activeThreats || 1500}</CardValue>
        </Card>

        <RiskCard
          riskBg="rgba(239, 68, 68, 0.15)"
          riskBorder="rgba(239, 68, 68, 0.5)"
        >
          <CardHeader>
            <CardTitle>High Risk</CardTitle>
          </CardHeader>
          <CardValue>{stats.highRiskAlerts || 80}</CardValue>
        </RiskCard>

        <RiskCard
          riskBg="rgba(245, 158, 11, 0.15)"
          riskBorder="rgba(245, 158, 11, 0.5)"
        >
          <CardHeader>
            <CardTitle>Medium Risk</CardTitle>
          </CardHeader>
          <CardValue>{stats.mediumRiskAlerts || 160}</CardValue>
        </RiskCard>

        <RiskCard
          riskBg="rgba(16, 185, 129, 0.15)"
          riskBorder="rgba(16, 185, 129, 0.5)"
        >
          <CardHeader>
            <CardTitle>Low Risk</CardTitle>
          </CardHeader>
          <CardValue>{stats.lowRiskAlerts || 1260}</CardValue>
        </RiskCard>
      </BottomRow>
    </StatsSection>
  );
};

export default StatsCards;
