import React from "react";
import styled from "styled-components";

const MapContainer = styled.div`
  background: rgba(30, 20, 50, 0.6);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const MapTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #e9d5ff;
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const MapWrapper = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #0f0a1f 0%, #1a0f2e 100%);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MapSVG = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cpath d='M150,100 Q200,80 250,100 L280,120 L300,110 L320,130 L340,120 L360,140 L380,130 L400,150 L420,140 L440,160 L460,150 L480,170 L500,160 L520,180 M200,200 L220,220 L240,210 L260,230 L280,220 L300,240 M350,180 L370,200 L390,190 L410,210 L430,200 L450,220 M100,250 L120,270 L140,260 L160,280 L180,270 L200,290 M500,250 L520,270 L540,260 L560,280 L580,270 L600,290' stroke='%235b21b6' stroke-width='1' fill='none' opacity='0.3'/%3E%3C/svg%3E");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const ActivityPoint = styled.div`
  position: absolute;
  width: ${(props) => props.size || "12px"};
  height: ${(props) => props.size || "12px"};
  background: ${(props) => props.color || "#ec4899"};
  border-radius: 50%;
  top: ${(props) => props.top || "50%"};
  left: ${(props) => props.left || "50%"};
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 20px ${(props) => props.color || "#ec4899"};

  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${(props) => props.color || "#ec4899"};
    animation: ripple 2s ease-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.2);
    }
  }

  @keyframes ripple {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(3);
      opacity: 0;
    }
  }
`;

const MapOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  opacity: 0.15;
`;

const Legend = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(30, 20, 50, 0.8);
  padding: 12px;
  border-radius: 8px;
  font-size: 11px;
  color: #c4b5fd;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(props) => props.color};
  }
`;

const NetworkActivityMap = () => {
  // Sample activity points (in production, these would be real geolocation data)
  const activityPoints = [
    { top: "30%", left: "25%", color: "#ef4444", size: "10px" }, // North America - High Risk
    { top: "35%", left: "50%", color: "#10b981", size: "8px" }, // Europe - Low Risk
    { top: "45%", left: "72%", color: "#f59e0b", size: "9px" }, // Asia - Medium Risk
    { top: "55%", left: "28%", color: "#10b981", size: "7px" }, // South America - Low Risk
    { top: "65%", left: "85%", color: "#10b981", size: "8px" }, // Australia - Low Risk
    { top: "42%", left: "55%", color: "#ef4444", size: "12px" }, // Eastern Europe - High Risk
    { top: "50%", left: "68%", color: "#f59e0b", size: "9px" }, // Middle East - Medium Risk
  ];

  return (
    <MapContainer>
      <MapTitle>Network Activity Map</MapTitle>
      <MapWrapper>
        <MapOverlay>🌍</MapOverlay>
        <MapSVG />
        {activityPoints.map((point, index) => (
          <ActivityPoint
            key={index}
            top={point.top}
            left={point.left}
            color={point.color}
            size={point.size}
          />
        ))}
        <Legend>
          <LegendItem color="#ef4444">
            <div className="dot" />
            <span>High Risk</span>
          </LegendItem>
          <LegendItem color="#f59e0b">
            <div className="dot" />
            <span>Medium Risk</span>
          </LegendItem>
          <LegendItem color="#10b981">
            <div className="dot" />
            <span>Low Risk</span>
          </LegendItem>
        </Legend>
      </MapWrapper>
    </MapContainer>
  );
};

export default NetworkActivityMap;


