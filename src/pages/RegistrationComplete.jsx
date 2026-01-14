import React from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.jpeg"; 

export default function RegistrationComplete() {
  const nav = useNavigate();
  
  
  const userInitial = "U"; 

  return (
    <div className="main-container">
      <div className="glass-card success-card">
        {}
        <div className="brand-logo-container">
          <img src={Logo} alt="Immortalized Portfolio Logo" className="brand-logo-img" />
        </div>

        <div className="success-icon-container">
          <div className="success-ring"></div>
          <div className="checkmark">✓</div>
        </div>

        <h2 className="brand-title">Identity Verified</h2>
        <p className="success-subtitle">
          Welcome to **Portfolio Immortalized**. Your secure digital vault is now active and protected.
        </p>

        {}
        <div className="profile-preview">
            <div className="initial-avatar">{userInitial}</div>
            <p className="avatar-hint">Your dashboard avatar is ready</p>
        </div>

        <Button onClick={() => nav("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}