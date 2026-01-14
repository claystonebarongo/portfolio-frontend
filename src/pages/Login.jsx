import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) newErrors.email = "Please input email to continue";
    if (!password) newErrors.password = "Please input password to continue";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Sending JSON to match Python backend
      const response = await api.post("/token", {
        username: email,
        password: password
      });
      
      // Store user session data
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("userId", response.data.user_id); 
      localStorage.setItem("userName", response.data.full_name || "User");
      localStorage.setItem("userEmail", email);
      
      // --- THE ADMIN & TRUSTEE UPDATE ---
      // 1. Store the role (admin or user)
      localStorage.setItem("userRole", response.data.role); 

      // 2. THE TRAFFIC CONTROLLER
      if (response.data.role === "admin") {
        // Direct Admin users to the Admin panel immediately
        nav("/admin");
      } else if (response.data.is_trustee) {
        // If they are a trustee for someone, prioritize the Trustee Portal
        nav("/trustee-dashboard");
      } else {
        // Standard user flow
        nav("/dashboard");
      }
      
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      setErrors({ server: "Vault Access Denied: Invalid email or password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="glass-card">
        <h2 className="brand-title">Vault Access</h2>
        <p className="legal-subtitle">Enter credentials to unlock your secure portfolio.</p>
        
        <form onSubmit={handleLogin}>
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
                setEmail(e.target.value);
                if(errors.email) setErrors({...errors, email: ""});
            }}
            error={errors.email}
          />

          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
                setPassword(e.target.value);
                if(errors.password) setErrors({...errors, password: ""});
            }}
            error={errors.password}
          />

          {errors.server && (
            <p className="error-text" style={{textAlign: 'center', marginBottom: '15px', color: '#ff4d4d'}}>
              {errors.server}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Login to Vault"}
          </Button>
        </form>

        <p className="resend-text" style={{marginTop: '25px', textAlign: 'center'}}>
          New to the Vault? <span onClick={() => nav("/terms")} style={{color: '#00fbff', cursor: 'pointer', fontWeight: 'bold'}}>Enroll Now</span>
        </p>
      </div>
    </div>
  );
}