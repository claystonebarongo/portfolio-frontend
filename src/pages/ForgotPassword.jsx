import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import Input from "../components/Input";
import Button from "../components/Button";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = Request Code, 2 = Verify & Reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const nav = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      
      await api.post("/forgot-password/request-otp", { email });
      setMessage({ type: "success", text: "Security code dispatched to your email." });
      setStep(2);
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.detail || "Vault check failed. Verify email." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      
      await api.post("/forgot-password/confirm", {
        email: email,
        otp_code: otp,
        new_password: newPassword
      });
      alert("Vault access updated. Please re-authenticate.");
      nav("/login");
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.detail || "Invalid Protocol. Check your code." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="glass-card">
        <h2 className="brand-title">{step === 1 ? "Recovery" : "Verify Access"}</h2>
        <p className="legal-subtitle">
          {step === 1 
            ? "Enter your registered email to receive a recovery code." 
            : "Enter the 6-digit code and your new vault password."}
        </p>

        {message.text && (
          <p style={{
            color: message.type === "success" ? "#00fbff" : "#ff4d4d", 
            textAlign: 'center', 
            fontSize: '0.85rem',
            marginBottom: '15px',
            textShadow: '0 0 10px rgba(0,0,0,0.5)'
          }}>
            {message.text}
          </p>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP}>
            <Input 
              label="Vault Identifier (Email)" 
              type="email" 
              placeholder="name@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <Button type="submit" disabled={loading}>
              {loading ? "SEARCHING..." : "DISPATCH CODE"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetConfirm}>
            <Input 
              label="6-Digit OTP" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              required 
              placeholder="000000" 
            />
            <Input 
              label="New Master Password" 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              placeholder="••••••••" 
            />
            <Button type="submit" disabled={loading}>
              {loading ? "RESETTING..." : "RESTORE ACCESS"}
            </Button>
          </form>
        )}
        
        <p className="resend-text" style={{marginTop: '25px', textAlign: 'center'}}>
           <span 
             onClick={() => nav("/login")} 
             style={{color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.9rem'}}
           >
             Return to Authentication
           </span>
        </p>
      </div>
    </div>
  );
}