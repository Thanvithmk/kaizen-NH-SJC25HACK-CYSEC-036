import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const SidebarContainer = styled.aside`
  width: 260px;
  background: linear-gradient(180deg, #1a0b2e 0%, #2d1b4e 100%);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 40px;

  .icon {
    width: 40px;
    height: 40px;
  }

  .text {
    display: flex;
    flex-direction: column;

    h1 {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    span {
      font-size: 11px;
      color: #a78bfa;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 12px;
  color: #c4b5fd;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  .icon {
    font-size: 20px;
    min-width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    background: rgba(139, 92, 246, 0.15);
    color: #fff;
    transform: translateX(4px);
  }

  &.active {
    background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background: #a78bfa;
    }
  }
`;

const Footer = styled.div`
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid rgba(167, 139, 250, 0.2);

  .info {
    font-size: 12px;
    color: #a78bfa;
    text-align: center;
    line-height: 1.6;
  }
`;

const Sidebar = () => {
  return (
    <SidebarContainer>
      <Logo>
        <svg
          className="icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"
            fill="url(#gradient)"
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 12L11 14L15 10"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient
              id="gradient"
              x1="12"
              y1="2"
              x2="12"
              y2="23"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
        <div className="text">
          <h1>Vigilant</h1>
          <span>Guard</span>
        </div>
      </Logo>

      <Nav>
        <NavItem to="/dashboard" end>
          <span className="icon">▣</span>
          <span>Dashboard</span>
        </NavItem>

        <NavItem to="/dashboard/active-threats">
          <span className="icon">⚠</span>
          <span>Active Threats</span>
        </NavItem>

        <NavItem to="/dashboard/solved-threats">
          <span className="icon">✓</span>
          <span>Solved Threats</span>
        </NavItem>

        <NavItem to="/dashboard/logs">
          <span className="icon">≡</span>
          <span>Logs</span>
        </NavItem>

        <NavItem to="/dashboard/settings">
          <span className="icon">⚙</span>
          <span>Settings</span>
        </NavItem>
      </Nav>

      <Footer>
        <div className="info">
          Vigilant Guard v1.0
          <br />
          Insider Threat Detection
        </div>
      </Footer>
    </SidebarContainer>
  );
};

export default Sidebar;
