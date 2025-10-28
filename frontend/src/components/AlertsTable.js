import React, { useState, useEffect } from "react";
import styled from "styled-components";
import moment from "moment";
import { useDashboard } from "../context/DashboardContext";

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  tr:hover {
    background: #f9fafb;
  }
`;

const RiskBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;

  ${(props) => {
    switch (props.level) {
      case "Critical":
        return "background: #fee2e2; color: #991b1b;";
      case "High":
        return "background: #fef3c7; color: #92400e;";
      case "Medium":
        return "background: #dbeafe; color: #1e40af;";
      default:
        return "background: #d1fae5; color: #065f46;";
    }
  }}
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  background: #f3f4f6;
  color: #4b5563;
`;

const ActionButton = styled.button`
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.variant === "solve" &&
    `
    background: #10b981;
    color: white;
    
    &:hover {
      background: #059669;
    }
  `}

  ${(props) =>
    props.variant === "view" &&
    `
    background: #3b82f6;
    color: white;
    margin-left: 8px;
    
    &:hover {
      background: #2563eb;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #9ca3af;

  .icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .message {
    font-size: 16px;
    font-weight: 500;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 2px solid ${(props) => (props.active ? "#667eea" : "#e5e7eb")};
  background: ${(props) => (props.active ? "#667eea" : "white")};
  color: ${(props) => (props.active ? "white" : "#6b7280")};
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    background: ${(props) => (props.active ? "#667eea" : "#f3f4f6")};
  }
`;

const AlertsTable = () => {
  const { alerts, fetchAlerts, solveAlert, loading } = useDashboard();
  const [filter, setFilter] = useState("all");
  const [solving, setSolving] = useState(null);

  useEffect(() => {
    const params =
      filter === "all" ? { solved: "N" } : { solved: "N", alert_type: filter };
    fetchAlerts(params);
  }, [filter, fetchAlerts]);

  const handleSolve = async (alertId) => {
    setSolving(alertId);
    await solveAlert(alertId);
    setSolving(null);
  };

  const getAlertTypeLabel = (type) => {
    const labels = {
      login: "Login",
      geo: "Geographic",
      bulk: "Bulk Download",
    };
    return labels[type] || type;
  };

  return (
    <>
      <FilterBar>
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All Alerts
        </FilterButton>
        <FilterButton
          active={filter === "login"}
          onClick={() => setFilter("login")}
        >
          Login
        </FilterButton>
        <FilterButton
          active={filter === "geo"}
          onClick={() => setFilter("geo")}
        >
          Geographic
        </FilterButton>
        <FilterButton
          active={filter === "bulk"}
          onClick={() => setFilter("bulk")}
        >
          Bulk Download
        </FilterButton>
      </FilterBar>

      {loading ? (
        <EmptyState>
          <div className="icon">⏳</div>
          <div className="message">Loading alerts...</div>
        </EmptyState>
      ) : alerts.length === 0 ? (
        <EmptyState>
          <div className="icon">✅</div>
          <div className="message">No active threats detected</div>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Employee</th>
                <th>Alert Type</th>
                <th>Risk Level</th>
                <th>Risk Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert._id}>
                  <td>
                    {moment(alert.alert_date_time).format("MMM DD, h:mm A")}
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {alert.employee_name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {alert.employee_token}
                      </div>
                    </div>
                  </td>
                  <td>
                    <TypeBadge>{getAlertTypeLabel(alert.alert_type)}</TypeBadge>
                  </td>
                  <td>
                    <RiskBadge level={alert.risk_level}>
                      {alert.risk_level}
                    </RiskBadge>
                  </td>
                  <td style={{ fontWeight: 600 }}>{alert.risk_score}</td>
                  <td>
                    <ActionButton
                      variant="solve"
                      onClick={() => handleSolve(alert._id)}
                      disabled={solving === alert._id}
                    >
                      {solving === alert._id ? "Solving..." : "Mark Solved"}
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default AlertsTable;

