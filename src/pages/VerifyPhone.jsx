import { useState } from "react";
import { api } from "../api/api";
import Button from "../components/Button";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";

export default function VerifyPhone() {
  // We keep the state name 'phone' if you prefer, but it's better to use 'email' 
  // internally so you don't get confused when debugging the API calls.
  const [email, setEmail] = useState(""); 
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); 
  const nav = useNavigate();

  const requestOtp = async () => {
    // Validation for Email format
    if (!email || !email.includes("@")) {
      setErrors({ email: "Please input a valid email address to continue" });
      return;
    }

    setLoading(true);
    setErrors({}); 
    try {
      // Hits your backend @app.post("/request-otp") [cite: 2026-01-08]
      // Sending { "email": email } as defined in your OTPRequest schema [cite: 2026-01-08]
      await api.post("/request-otp", { email: email });
      setSent(true);
    } catch (err) {
      setErrors({ email: "Failed to dispatch code. Ensure the email is correct." });
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
      // Hits your backend @app.post("/verify-otp") [cite: 2026-01-08]
      // Sending { "email": email, "code": code } as defined in your OTPVerify schema [cite: 2026-01-08]
      const response = await api.post("/verify-otp", { email: email, code: code });
      
      // Checking for the "Verified" status returned by your backend [cite: 2026-01-08]
      if (response.data.status === "Verified") {
        // We store the email so the Register page can auto-fill it
        localStorage.setItem("verifiedEmail", email);
        nav("/register");
      }
    } catch (err) {
      setErrors({ code: "Invalid or expired code. Please check your inbox." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="glass-card">
        <h2 className="brand-title">Identity Verification</h2>
        <p className="legal-subtitle">
          {!sent 
            ? "Enter your email to receive a secure vault access code." 
            : `Security code dispatched to ${email}`}
        </p>

        <div className="form-content">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            disabled={sent}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({}); 
            }}
            error={errors.email} 
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
              <p className="resend-text" onClick={() => setSent(false)} style={{cursor: 'pointer', marginTop: '10px', fontSize: '0.85rem'}}>
                Change email or resend code?
              </p>
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            {!sent ? (
              <Button onClick={requestOtp} disabled={loading}>
                {loading ? "Dispatching..." : "Send Verification Code"}
              </Button>
            ) : (
              <Button onClick={verifyOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify Identity"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}