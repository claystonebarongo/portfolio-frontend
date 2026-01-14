import React, { useState, useEffect } from "react";
import { api, BASE_URL } from "../api/api"; // Added BASE_URL import
import Button from "../components/Button";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();
  const [pulseLoading, setPulseLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Authorized User";

  
  const calculateHealth = () => {
    let score = 40; 
    if (userData?.profile_pic) score += 20;
    if (userData?.id_number) score += 20;
    if (userData?.trigger_status === "ACTIVE") score += 20; 
    return Math.min(score, 100);
  };

  const healthScore = calculateHealth();

  useEffect(() => {
    let timerInterval;
    const initDashboard = async () => {
      if (!userId) return;
      try {
        const res = await api.get(`/user-status?user_id=${userId}`);
        setUserData(res.data);

        // Logic: Deadline = Last Active + Frequency from Settings
        const lastActiveDate = new Date(res.data.last_active);
        const frequencyDays = res.data.check_in_frequency_days || 90;
        const deadline = new Date(lastActiveDate.getTime() + (frequencyDays * 24 * 60 * 60 * 1000));

        timerInterval = setInterval(() => {
          const now = new Date().getTime();
          const distance = deadline.getTime() - now;
          
          if (distance < 0) {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            clearInterval(timerInterval);
          } else {
            setTimeLeft({
              days: Math.floor(distance / (1000 * 60 * 60 * 24)),
              hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
              seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
          }
        }, 1000);
      } catch (err) { console.error("Dashboard error:", err); }
    };

    initDashboard();
    return () => clearInterval(timerInterval);
  }, [userId]);

  const handlePulse = async () => {
    setPulseLoading(true);
    try {
      await api.post(`/pulse-check?user_id=${userId}`);
      window.location.reload(); 
    } catch (err) { alert("Pulse check failed."); }
    finally { setPulseLoading(false); }
  };

  return (
    <div className="tab-page-container">
      <div className="glass-header">
        <div className="top-row">
          <div className="user-meta">
            {/* PROFILE PICTURE LOGIC */}
            <div className="avatar-glow" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {userData?.profile_pic ? (
                <img 
                  src={`${BASE_URL}/${userData.profile_pic}`} // Changed from 127.0.0.1 to BASE_URL
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span>{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            
            <div className="text-group">
              <h2 className="user-title">{userName}</h2>
              <p className="label-dim">Vault: {userData?.trigger_status || "Loading..."}</p>
            </div>
          </div>
          <div className="health-badge" style={{ color: healthScore > 70 ? '#00fbff' : '#ffcc00' }}>
             {healthScore}% Secure
          </div>
        </div>

        <div className="live-timer-grid">
          <div className="timer-box"><h3>{timeLeft.days}</h3><p>DAYS</p></div>
          <div className="timer-box"><h3>{timeLeft.hours}</h3><p>HRS</p></div>
          <div className="timer-box"><h3>{timeLeft.minutes}</h3><p>MIN</p></div>
          <div className="timer-box red-tick"><h3>{timeLeft.seconds}</h3><p>SEC</p></div>
        </div>
      </div>

      <div className="scroll-content">
        <div className="pulse-action-card glass-card" style={{textAlign: 'center', padding: '30px 20px'}}>
          <h3 className="cat-name">LIFE CONFIRMATION</h3>
          <p className="label-dim" style={{marginBottom: '25px', fontSize: '0.9rem'}}>
            Timer resets to <b>{userData?.check_in_frequency_days} days</b> on click.
          </p>
          
          <Button onClick={handlePulse} disabled={pulseLoading} className="pulse-btn-glow">
            {pulseLoading ? "Verifying..." : "I AM ALIVE"}
          </Button>
        </div>

        <h3 className="section-header" style={{marginTop: '30px'}}>Security Audit</h3>
        <div className="activity-list">
          <div className="glass-card activity-card">
            <div className="act-icon">🛰️</div>
            <div className="act-details">
              <p className="act-name">Satellite Node: Active</p>
              <p className="act-meta">Protocol frequency: {userData?.check_in_frequency_days} Days</p>
            </div>
          </div>
          <div className="glass-card activity-card" style={{marginTop: '12px'}}>
            <div className="act-icon">🆔</div>
            <div className="act-details">
              <p className="act-name">Verified Identity</p>
              <p className="act-meta">{userData?.id_number ? `ID: ${userData.id_number}` : "No ID on file"}</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}