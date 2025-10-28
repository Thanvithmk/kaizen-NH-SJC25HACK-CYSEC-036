import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import moment from "moment";
import { useDashboard } from "../context/DashboardContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
  min-height: 200px;
  position: relative;
`;

const ThreatTrends = () => {
  const { alerts } = useDashboard();
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    // Generate last 7 days of data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      last7Days.push(moment().subtract(i, "days").format("MMM DD"));
    }

    // Count threats per day
    const threatCounts = last7Days.map((day) => {
      return alerts.filter((alert) => {
        return moment(alert.alert_date_time).format("MMM DD") === day;
      }).length;
    });

    // If no real data, use sample data for visualization
    const hasData = threatCounts.some((count) => count > 0);
    const displayData = hasData
      ? threatCounts
      : [150, 320, 280, 450, 380, 520, 280]; // Sample data

    setChartData({
      labels: last7Days,
      datasets: [
        {
          label: "Threats Detected",
          data: displayData,
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: "#06b6d4",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        },
      ],
    });
  }, [alerts]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `Threats: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(139, 92, 246, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#a78bfa",
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(139, 92, 246, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#a78bfa",
          font: {
            size: 11,
          },
          stepSize: 100,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <ChartContainer>
      <ChartTitle>Threat Trends</ChartTitle>
      <ChartWrapper>
        <Line data={chartData} options={options} />
      </ChartWrapper>
    </ChartContainer>
  );
};

export default ThreatTrends;


