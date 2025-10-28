import React from "react";
import styled from "styled-components";
import { Chart as ChartJS, ArcElement, Tooltip, Legend as ChartLegend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useDashboard } from "../context/DashboardContext";

ChartJS.register(ArcElement, Tooltip, ChartLegend);

const ChartContainer = styled.div`
  background: rgba(30, 20, 50, 0.6);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #e9d5ff;
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ChartWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 250px;
  position: relative;
`;

const ChartCanvas = styled.div`
  width: 100%;
  max-width: 300px;
  height: 300px;
  margin: 0 auto;
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

const CustomLegend = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(15, 10, 31, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
`;

const LegendLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .color {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    background: ${(props) => props.color};
  }

  .label {
    font-size: 13px;
    font-weight: 500;
    color: #c4b5fd;
  }
`;

const LegendValue = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #e9d5ff;
`;

const AlertDistribution = () => {
  const { alertDistribution } = useDashboard();

  const typeLabels = {
    login: "Login Alerts",
    geo: "Geographic",
    bulk: "Bulk Download",
  };

  const typeColors = {
    login: "#ef4444",
    geo: "#f59e0b",
    bulk: "#10b981",
  };

  const chartData = {
    labels: alertDistribution.map((item) => typeLabels[item.type] || item.type),
    datasets: [
      {
        data: alertDistribution.map((item) => item.count),
        backgroundColor: alertDistribution.map(
          (item) => typeColors[item.type] || "#6b7280"
        ),
        borderColor: "#1a0b2e",
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "70%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(30, 20, 50, 0.95)",
        titleColor: "#e9d5ff",
        bodyColor: "#c4b5fd",
        borderColor: "#8b5cf6",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (alertDistribution.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>Alert Distribution</ChartTitle>
        <EmptyState>
          <div className="icon">📊</div>
          <div className="message">No alert data available</div>
        </EmptyState>
      </ChartContainer>
    );
  }

  const total = alertDistribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <ChartContainer>
      <ChartTitle>Alert Distribution</ChartTitle>
      <ChartWrapper>
        <ChartCanvas>
          <Doughnut data={chartData} options={options} />
        </ChartCanvas>
      </ChartWrapper>

      <CustomLegend>
        {alertDistribution.map((item) => (
          <LegendItem key={item.type}>
            <LegendLabel color={typeColors[item.type]}>
              <div className="color" />
              <div className="label">{typeLabels[item.type] || item.type}</div>
            </LegendLabel>
            <LegendValue>
              {item.count} ({((item.count / total) * 100).toFixed(0)}%)
            </LegendValue>
          </LegendItem>
        ))}
      </CustomLegend>
    </ChartContainer>
  );
};

export default AlertDistribution;
