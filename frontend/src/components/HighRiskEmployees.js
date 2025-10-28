import React from "react";
import styled from "styled-components";
import { useDashboard } from "../context/DashboardContext";

const EmployeeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmployeeCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: ${(props) => {
    if (props.score >= 75) return "#fee2e2";
    if (props.score >= 50) return "#fef3c7";
    if (props.score >= 25) return "#dbeafe";
    return "#d1fae5";
  }};
  border-radius: 8px;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateX(4px);
  }
`;

const EmployeeInfo = styled.div`
  flex: 1;
`;

const EmployeeName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const EmployeeToken = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const ThreatTypes = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 6px;
`;

const TypeTag = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
`;

const RiskScore = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const Score = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${(props) => {
    if (props.score >= 75) return "#991b1b";
    if (props.score >= 50) return "#92400e";
    if (props.score >= 25) return "#1e40af";
    return "#065f46";
  }};
`;

const ScoreLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;

  .icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .message {
    font-size: 14px;
  }
`;

const HighRiskEmployees = () => {
  const { highRiskEmployees } = useDashboard();

  const getAlertTypeLabel = (type) => {
    const labels = {
      login: "🔐 Login",
      geo: "🌍 Geo",
      bulk: "📦 Bulk",
    };
    return labels[type] || type;
  };

  if (highRiskEmployees.length === 0) {
    return (
      <EmptyState>
        <div className="icon">✅</div>
        <div className="message">No high-risk employees detected</div>
      </EmptyState>
    );
  }

  return (
    <EmployeeList>
      {highRiskEmployees.map((employee, index) => (
        <EmployeeCard
          key={employee.employee_token}
          score={employee.total_risk_score}
        >
          <EmployeeInfo>
            <EmployeeName>
              {index + 1}. {employee.employee_name}
            </EmployeeName>
            <EmployeeToken>{employee.employee_token}</EmployeeToken>
            <ThreatTypes>
              {employee.alert_types.map((type) => (
                <TypeTag key={type}>{getAlertTypeLabel(type)}</TypeTag>
              ))}
            </ThreatTypes>
          </EmployeeInfo>
          <RiskScore>
            <Score score={employee.total_risk_score}>
              {employee.total_risk_score}
            </Score>
            <ScoreLabel>{employee.threat_count} Threats</ScoreLabel>
          </RiskScore>
        </EmployeeCard>
      ))}
    </EmployeeList>
  );
};

export default HighRiskEmployees;

