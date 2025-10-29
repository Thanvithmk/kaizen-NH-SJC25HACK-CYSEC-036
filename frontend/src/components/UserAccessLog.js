import React, { useEffect, useState } from "react";
import styled from "styled-components";
import moment from "moment";
import { dashboardAPI } from "../services/api";

const LogContainer = styled.div`
  background: rgba(30, 20, 50, 0.6);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const LogTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #e9d5ff;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const DownloadButton = styled.button`
  background: transparent;
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #a78bfa;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(139, 92, 246, 0.1);
    border-color: #8b5cf6;
    color: #c4b5fd;
  }
`;

const TableWrapper = styled.div`
  flex: 1;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(139, 92, 246, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(139, 92, 246, 0.5);
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;

  thead {
    th {
      text-align: left;
      padding: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #a78bfa;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    }
  }

  tbody {
    tr {
      background: rgba(15, 10, 31, 0.4);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(139, 92, 246, 0.1);
        transform: translateX(4px);
      }

      td {
        padding: 14px 12px;
        font-size: 13px;
        color: #c4b5fd;
        border-top: 1px solid rgba(139, 92, 246, 0.1);
        border-bottom: 1px solid rgba(139, 92, 246, 0.1);

        &:first-child {
          border-left: 1px solid rgba(139, 92, 246, 0.1);
          border-radius: 8px 0 0 8px;
          font-weight: 600;
          color: #e9d5ff;
        }

        &:last-child {
          border-right: 1px solid rgba(139, 92, 246, 0.1);
          border-radius: 0 8px 8px 0;
        }
      }
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: ${(props) => {
    switch (props.status) {
      case "Success":
        return "rgba(16, 185, 129, 0.2)";
      case "Pending":
        return "rgba(245, 158, 11, 0.2)";
      case "Blocked":
        return "rgba(239, 68, 68, 0.2)";
      default:
        return "rgba(107, 114, 128, 0.2)";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "Success":
        return "#10b981";
      case "Pending":
        return "#f59e0b";
      case "Blocked":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  }};

  .icon {
    font-size: 14px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #a78bfa;

  .icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .message {
    font-size: 14px;
  }
`;

const UserAccessLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getRecentActivity(5);
      // Map the response to include action field
      const logsWithAction = (response.activity || []).map((log) => ({
        ...log,
        action: log.logout_timestamp ? "Logged Out" : "Logged In",
        // Map status to expected format
        success_status:
          log.risk_level === "High"
            ? "Blocked"
            : log.risk_level === "Medium"
            ? "Pending"
            : log.success_status || "Success",
      }));
      setLogs(logsWithAction);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Create CSV content
    const headers = ["User", "IP Address", "Login Time", "Action", "Status"];
    const csvContent = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.employee_token,
          log.ip_address,
          moment(log.login_timestamp).format("DD MMM YYYY, hh:mm A"),
          log.action || "Logged In",
          log.success_status,
        ].join(",")
      ),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-access-log-${moment().format("YYYY-MM-DD")}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <LogContainer>
        <LogHeader>
          <LogTitle>User Behaviour / Access Log</LogTitle>
        </LogHeader>
        <EmptyState>
          <div className="icon">⏳</div>
          <div className="message">Loading logs...</div>
        </EmptyState>
      </LogContainer>
    );
  }

  return (
    <LogContainer>
      <LogHeader>
        <LogTitle>User Behaviour / Access Log</LogTitle>
        <DownloadButton onClick={handleDownload}>
          <span>⬇</span>
          <span>Download</span>
        </DownloadButton>
      </LogHeader>

      {logs.length === 0 ? (
        <EmptyState>
          <div className="icon">📋</div>
          <div className="message">No access logs available</div>
        </EmptyState>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>User</th>
                <th>IP Address</th>
                <th>Login Time</th>
                <th>Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.employee_token}</td>
                  <td>{log.ip_address}</td>
                  <td>
                    {moment(log.login_timestamp).format("DD MMM YYYY, hh:mm A")}
                  </td>
                  <td>{log.action || "Logged In"}</td>
                  <td>
                    <StatusBadge status={log.success_status}>
                      <span className="icon">
                        {log.success_status === "Success"
                          ? "✓"
                          : log.success_status === "Pending"
                          ? "⚠"
                          : "✕"}
                      </span>
                      <span>{log.success_status}</span>
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </LogContainer>
  );
};

export default UserAccessLog;
