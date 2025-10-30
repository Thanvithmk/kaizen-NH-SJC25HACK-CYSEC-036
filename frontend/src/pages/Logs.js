import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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

  h1 {
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  p {
    color: #a78bfa;
    font-size: 14px;
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: rgba(30, 20, 50, 0.8);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;

  .label {
    font-size: 12px;
    color: #a78bfa;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .value {
    font-size: 32px;
    font-weight: 800;
    color: #e9d5ff;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterButton = styled.button`
  padding: 10px 20px;
  background: ${(props) =>
    props.active ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.2)"};
  border: 2px solid
    ${(props) =>
      props.active ? "rgba(139, 92, 246, 0.6)" : "rgba(139, 92, 246, 0.4)"};
  border-radius: 10px;
  color: #c4b5fd;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.6);
  }
`;

const SearchInput = styled.input`
  padding: 10px 18px;
  background: rgba(30, 20, 50, 0.6);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 10px;
  color: #e9d5ff;
  font-size: 13px;
  outline: none;
  flex: 1;
  max-width: 300px;
  transition: all 0.3s ease;

  &::placeholder {
    color: #a78bfa;
  }

  &:focus {
    border-color: #8b5cf6;
    background: rgba(30, 20, 50, 0.8);
  }
`;

const TableContainer = styled.div`
  background: rgba(30, 20, 50, 0.8);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #e9d5ff;
`;

const TableHead = styled.thead`
  background: rgba(139, 92, 246, 0.2);
`;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  transition: background 0.3s ease;

  &:hover {
    background: rgba(139, 92, 246, 0.1);
  }
`;

const TableHeader = styled.th`
  padding: 16px 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #a78bfa;
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: 14px 12px;
  font-size: 14px;
  color: #c4b5fd;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${(props) =>
    props.status === "Success"
      ? "rgba(16, 185, 129, 0.2)"
      : props.status === "Failed"
      ? "rgba(239, 68, 68, 0.2)"
      : "rgba(245, 158, 11, 0.2)"};
  color: ${(props) =>
    props.status === "Success"
      ? "#6ee7b7"
      : props.status === "Failed"
      ? "#fca5a5"
      : "#fbbf24"};
  border: 1px solid
    ${(props) =>
      props.status === "Success"
        ? "rgba(16, 185, 129, 0.4)"
        : props.status === "Failed"
        ? "rgba(239, 68, 68, 0.4)"
        : "rgba(245, 158, 11, 0.4)"};
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #a78bfa;
  font-size: 18px;
  font-weight: 600;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
`;

const PageButton = styled.button`
  padding: 8px 16px;
  background: ${(props) =>
    props.active ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.2)"};
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 8px;
  color: #c4b5fd;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(139, 92, 246, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    login: 0,
    downloads: 0,
    geographic: 0,
  });

  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/dashboard/recent-activity?limit=500`
      );

      if (response.data.success) {
        setLogs(response.data.activity);

        // Calculate stats
        const total = response.data.activity.length;
        const login = response.data.activity.filter(
          (l) => l.activity_type === "login"
        ).length;
        const downloads = response.data.activity.filter(
          (l) => l.activity_type === "bulk_download"
        ).length;
        const geographic = response.data.activity.filter(
          (l) => l.activity_type === "geographic"
        ).length;

        setStats({ total, login, downloads, geographic });
      }
    } catch (error) {
      toast.error("Failed to load logs");
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilteredLogs = () => {
    let filtered = logs;

    // Filter by activity type
    if (filter === "login") {
      filtered = filtered.filter((l) => l.activity_type === "login");
    } else if (filter === "downloads") {
      filtered = filtered.filter((l) => l.activity_type === "bulk_download");
    } else if (filter === "geographic") {
      filtered = filtered.filter((l) => l.activity_type === "geographic");
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (l) =>
          l.employee_token?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getPaginatedLogs = () => {
    const filtered = getFilteredLogs();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredLogs().length / ITEMS_PER_PAGE);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Sidebar />
        <MainContent>
          <LoadingSpinner>Loading login activity logs...</LoadingSpinner>
        </MainContent>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Sidebar />
      <MainContent>
        <Header>
          <h1>Activity Logs</h1>
          <p>
            Comprehensive user activity including logins, downloads, and alerts
          </p>
        </Header>

        <StatsBar>
          <StatCard>
            <div className="label">Total Activities</div>
            <div className="value">{stats.total}</div>
          </StatCard>
          <StatCard>
            <div className="label">Login Activities</div>
            <div className="value">{stats.login}</div>
          </StatCard>
          <StatCard>
            <div className="label">File Downloads</div>
            <div className="value">{stats.downloads}</div>
          </StatCard>
          <StatCard>
            <div className="label">Geographic Alerts</div>
            <div className="value">{stats.geographic}</div>
          </StatCard>
        </StatsBar>

        <FilterBar>
          <FilterButton
            active={filter === "all"}
            onClick={() => {
              setFilter("all");
              setCurrentPage(1);
            }}
          >
            All Activities
          </FilterButton>
          <FilterButton
            active={filter === "login"}
            onClick={() => {
              setFilter("login");
              setCurrentPage(1);
            }}
          >
            Logins
          </FilterButton>
          <FilterButton
            active={filter === "downloads"}
            onClick={() => {
              setFilter("downloads");
              setCurrentPage(1);
            }}
          >
            File Downloads
          </FilterButton>
          <FilterButton
            active={filter === "geographic"}
            onClick={() => {
              setFilter("geographic");
              setCurrentPage(1);
            }}
          >
            Geographic Alerts
          </FilterButton>
          <SearchInput
            type="text"
            placeholder="Search by employee, IP, location..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </FilterBar>

        <TableContainer>
          {getPaginatedLogs().length === 0 ? (
            <LoadingSpinner>No logs found</LoadingSpinner>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Activity Type</TableHeader>
                    <TableHeader>Employee Token</TableHeader>
                    <TableHeader>IP Address</TableHeader>
                    <TableHeader>Location</TableHeader>
                    <TableHeader>Details</TableHeader>
                    <TableHeader>Timestamp</TableHeader>
                    <TableHeader>Status</TableHeader>
                  </TableRow>
                </TableHead>
                <tbody>
                  {getPaginatedLogs().map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <StatusBadge
                          status={
                            log.activity_type === "login"
                              ? "Success"
                              : log.activity_type === "bulk_download"
                              ? "Warning"
                              : "Failed"
                          }
                        >
                          {log.activity_type === "login"
                            ? "Login"
                            : log.activity_type === "bulk_download"
                            ? "Download"
                            : "Geo Alert"}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <strong>{log.employee_token}</strong>
                      </TableCell>
                      <TableCell>{log.ip_address || "N/A"}</TableCell>
                      <TableCell>
                        {log.city && log.country
                          ? `${log.city}, ${log.country}`
                          : log.location || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {log.activity_type === "bulk_download"
                          ? `${
                              log.details?.total_files
                            } files, ${log.details?.total_size_mb?.toFixed(
                              2
                            )} MB`
                          : log.activity_type === "geographic"
                          ? `Distance: ${log.details?.distance_km?.toFixed(
                              0
                            )} km`
                          : log.details?.logout_timestamp
                          ? "Session ended"
                          : "Active session"}
                      </TableCell>
                      <TableCell>{formatDate(log.timestamp)}</TableCell>
                      <TableCell>
                        <StatusBadge status={log.status}>
                          {log.status}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>

              {getTotalPages() > 1 && (
                <Pagination>
                  <PageButton
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </PageButton>
                  {Array.from({ length: getTotalPages() }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === getTotalPages() ||
                        Math.abs(page - currentPage) <= 2
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span style={{ color: "#a78bfa", padding: "0 8px" }}>
                            ...
                          </span>
                        )}
                        <PageButton
                          active={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PageButton>
                      </React.Fragment>
                    ))}
                  <PageButton
                    onClick={() =>
                      setCurrentPage((p) => Math.min(getTotalPages(), p + 1))
                    }
                    disabled={currentPage === getTotalPages()}
                  >
                    Next
                  </PageButton>
                </Pagination>
              )}
            </>
          )}
        </TableContainer>
      </MainContent>
    </DashboardLayout>
  );
};

export default Logs;
