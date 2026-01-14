import { useState } from "react";
import { api } from "../api/api";
import Button from "../components/Button";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";

export default function VerifyPhone() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); 
  const nav = useNavigate();

  const requestOtp = async () => {
    
    if (!phone) {
      setErrors({ phone: "Please input phone number to continue" });
      return;
    }

    setLoading(true);
    setErrors({}); 
    try {
      await api.post("/request-otp", { phone_number: phone });
      setSent(true);
    } catch (err) {
      setErrors({ phone: "Failed to send OTP. Check if the number is correct." });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    
    if (!code) {
      setErrors({ code: "Please input the 6-digit code to continue" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/verify-otp", { phone_number: phone, code: code });
      
      
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("userName", response.data.full_name || "User");
        nav("/dashboard");
      } else {
        
        localStorage.setItem("verifiedPhone", phone);
        nav("/register");
      }
    } catch (err) {
      setErrors({ code: "Invalid code. Please check your terminal/SMS." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="glass-card">
        <h2 className="brand-title">Security Check</h2>
        <p className="legal-subtitle">
          {!sent 
            ? "Enter your mobile number to receive a secure access code." 
            : `Verification code sent to ${phone}`}
        </p>

        <div className="form-content">
          <Input
            label="Phone Number"
            placeholder="+254 700 000 000"
            value={phone}
            disabled={sent}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({}); 
            }}
            error={errors.phone} 
          />

          {sent && (
            <div className="otp-section" style={{marginTop: "10px"}}>
              <Input
                label="6-Digit OTP"
                placeholder="000000"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errors.code) setErrors({}); 
                }}
                maxLength={6}
                error={errors.code} 
              />
              <p className="resend-text" onClick={() => setSent(false)} style={{cursor: 'pointer', marginTop: '10px'}}>
                Change number or resend?
              </p>
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            {!sent ? (
              <Button onClick={requestOtp} disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            ) : (
              <Button onClick={verifyOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify & Proceed"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}