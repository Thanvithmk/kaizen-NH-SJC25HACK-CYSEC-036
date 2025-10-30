import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fileAPI } from "../services/api";
import socketService from "../services/socket";

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0a1f 0%, #2d1b4e 50%, #1a0b2e 100%);
  padding: 40px 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 42px;
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
    font-size: 16px;
    color: #a78bfa;
    font-weight: 500;
  }
`;

const TopBar = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 100;
`;

const UserInfo = styled.div`
  padding: 12px 20px;
  background: rgba(139, 92, 246, 0.2);
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 12px;
  color: #c4b5fd;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 80px auto 40px;
`;

const FilesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const FileCard = styled.div`
  background: rgba(30, 20, 50, 0.8);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(139, 92, 246, 0.3);
  }
`;

const FileIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  text-align: center;
`;

const FileName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #e9d5ff;
  margin-bottom: 8px;
  word-break: break-word;
`;

const FileDescription = styled.p`
  font-size: 13px;
  color: #a78bfa;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #c4b5fd;

  .label {
    font-weight: 600;
    color: #a78bfa;
  }

  .value {
    font-weight: 500;
  }
`;

const DownloadButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(124, 58, 237, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #a78bfa;
  font-size: 18px;
  font-weight: 600;
`;

const FileDownloads = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});
  const [employeeToken, setEmployeeToken] = useState("");
  const [employeeName, setEmployeeName] = useState("");

  useEffect(() => {
    // Check if logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const empToken = localStorage.getItem("employeeId");
    const empName = localStorage.getItem("employeeName");

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setEmployeeToken(empToken || "");
    setEmployeeName(empName || empToken || "Employee");

    // Connect to socket
    socketService.connect();

    // Fetch files
    fetchFiles();
  }, [navigate]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fileAPI.getFileList();
      if (response.success) {
        // Map files and add sizeMB property
        const filesWithSize = response.files.map((file) => ({
          ...file,
          sizeMB: parseFloat(file.sizeInMB),
          description: getFileDescription(file.filename),
        }));
        setFiles(filesWithSize);
      }
    } catch (error) {
      toast.error("Failed to load files");
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileDescription = (filename) => {
    const descMap = {
      "Confidential_Client_Data.csv":
        "Sensitive customer information and records",
      "Payroll_Records_2024.xlsx": "Employee salary and payment details",
      "Financial_Summary_2024.pdf": "Company financial report for 2024",
      "Employee_Handbook_2024.pdf": "Company policies and procedures",
      "Product_Designs_Archive.zip": "Product design files and assets",
      "Source_Code_Repository.zip": "Source code backup archive",
      "Customer_Database_Report.xlsx": "Customer database analytics",
      "Project_Timeline.xlsx": "Project schedules and milestones",
      "Meeting_Notes_Q1.docx": "Q1 meeting minutes and notes",
      "Backup_Database_Full.zip": "Full database backup file",
    };
    return descMap[filename] || "Company document";
  };

  const handleDownload = (file) => {
    setDownloading((prev) => ({ ...prev, [file.filename]: true }));

    // Create a hidden link and trigger download
    const downloadUrl = fileAPI.downloadFile(file.filename, employeeToken);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success toast with file size
    setTimeout(() => {
      const sizeDisplay =
        file.sizeMB >= 1000
          ? `${(file.sizeMB / 1000).toFixed(2)} GB`
          : `${file.sizeMB} MB`;

      toast.success(
        `✅ Downloaded: ${file.filename}\nFile Size: ${sizeDisplay}`,
        {
          autoClose: 3000,
          position: "top-right",
        }
      );

      setDownloading((prev) => ({ ...prev, [file.filename]: false }));
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getFileIcon = (type) => {
    const iconMap = {
      ".pdf": "📄",
      ".docx": "📝",
      ".xlsx": "📊",
      ".csv": "📈",
      ".zip": "🗜️",
      ".json": "📋",
      ".txt": "📃",
    };
    return iconMap[type] || "📁";
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner>Loading files...</LoadingSpinner>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <TopBar>
        <UserInfo>
          <span>👤</span>
          {employeeName}
          <span
            style={{ marginLeft: "12px", cursor: "pointer" }}
            onClick={handleLogout}
          >
            🚪 Logout
          </span>
        </UserInfo>
      </TopBar>

      <Header>
        <h1>
          <span>📁</span>
          File Downloads
        </h1>
        <p>Available Company Files</p>
      </Header>

      <ContentWrapper>
        <FilesGrid>
          {files.map((file) => (
            <FileCard key={file.filename}>
              <FileIcon>{getFileIcon(file.type)}</FileIcon>
              <FileName>{file.filename}</FileName>
              <FileDescription>{file.description}</FileDescription>
              <FileInfo>
                <InfoRow>
                  <span className="label">Size:</span>
                  <span className="value">
                    {file.sizeMB >= 1000
                      ? `${(file.sizeMB / 1000).toFixed(2)} GB`
                      : `${file.sizeMB} MB`}
                  </span>
                </InfoRow>
                <InfoRow>
                  <span className="label">Type:</span>
                  <span className="value">
                    {file.type
                      ? file.type.replace(".", "").toUpperCase()
                      : "FILE"}
                  </span>
                </InfoRow>
              </FileInfo>
              <DownloadButton
                onClick={() => handleDownload(file)}
                disabled={downloading[file.filename]}
              >
                {downloading[file.filename] ? (
                  <>
                    <span>⏳</span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <span>⬇️</span>
                    Download File
                  </>
                )}
              </DownloadButton>
            </FileCard>
          ))}
        </FilesGrid>

        {files.length === 0 && (
          <LoadingSpinner>No files available for download</LoadingSpinner>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default FileDownloads;
