import React, { useState, useEffect } from "react";
import { api } from "../api/api";
import "../App.css";

export default function TrusteeDashboard() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const queryParams = new URLSearchParams(window.location.search);
  const trusteeEmail = queryParams.get("email") || localStorage.getItem("userEmail");

  useEffect(() => {
    if (trusteeEmail) fetchNodes();
  }, [trusteeEmail]);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trustee/my-invitations?email=${trusteeEmail}`);
      setNodes(res.data);
    } catch (err) {
      console.error("Connection error to secure mesh.");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id, status) => {
    try {
      await api.post("/trustee/respond", { trustee_id: id, status: status });
      fetchNodes();
    } catch (err) {
      alert("Action failed.");
    }
  };

  //  Sending as Query Params so the Backend can process the Admin notification
  const handleVerifyStatus = async (trusteeId, userId, confirmed) => {
    const actionText = confirmed ? "CONFIRM DEATH" : "VETO (ALIVE)";
    if (!window.confirm(`Are you sure you want to execute ${actionText}? This action is logged.`)) return;

    try {
      //  use Query strings to match Python's @app.post expected params
      await api.post(`/trustee/verify-status?trustee_id=${trusteeId}&user_id=${userId}&confirmed_dead=${confirmed}`);
      
      alert(confirmed 
        ? "STATUS UPDATED: User moved to PENDING_VERIFICATION. Admin has been notified for asset release." 
        : "STATUS RESET: User is marked as ACTIVE. Timer has been reset."
      );
      fetchNodes();
    } catch (err) {
      console.error("Verification error:", err.response?.data);
      alert("Transmission failed. Please check your network connection.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="main-container" style={{ flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {}
      <div className="glass-header" style={{ width: '100%', padding: '20px 0', borderBottom: '1px solid rgba(0, 251, 255, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '90%', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="avatar-glow">G</div>
            <div>
              <p className="label-dim" style={{ fontSize: '0.7rem', margin: 0 }}>CLEARANCE: GUARDIAN</p>
              <h1 className="user-title" style={{ fontSize: '1.2rem', margin: 0 }}>Trustee Terminal</h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="health-badge" style={{ fontSize: '0.7rem' }}>NODE: {trusteeEmail?.split('@')[0].toUpperCase()}</div>
            <button onClick={handleLogout} className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.7rem', color: '#ff4d4d', borderColor: '#ff4d4d' }}>LOGOUT</button>
          </div>
        </div>
      </div>

      {}
      <div className="scroll-content" style={{ flex: 1, overflowY: 'auto', padding: '30px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 className="section-header" style={{ textAlign: 'center', marginBottom: '30px', letterSpacing: '3px' }}>ACTIVE DESIGNATIONS</h3>

          {loading ? (
            <p className="label-dim" style={{ textAlign: 'center' }}>DECRYPTING MESH...</p>
          ) : nodes.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p className="legal-subtitle">NO ACTIVE PROTOCOLS FOUND</p>
            </div>
          ) : (
            nodes.map((node) => (
              <div key={node.id} className="glass-card" style={{ marginBottom: '25px', padding: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                
                {/* User Info Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div>
                    <h2 style={{ color: '#00fbff', margin: '0', fontSize: '1.3rem' }}>{node.owner_name}</h2>
                    <p className="label-dim" style={{ fontSize: '0.8rem' }}>RELATION: {node.relation_type?.toUpperCase()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '5px 10px', borderRadius: '15px' }}>
                    <span className="label-dim" style={{ fontSize: '0.6rem' }}>SIGNAL:</span>
                    <div className={`dot ${node.owner_trigger_status === 'active' ? 'green' : 'red'}`} style={{ boxShadow: node.owner_trigger_status === 'active' ? '0 0 8px #00ff88' : '0 0 8px #ff4d4d' }}></div>
                  </div>
                </div>

                {/* Status-specific instruction box */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '3px solid var(--accent-blue)' }}>
                    <p className="label-dim" style={{ fontSize: '0.75rem', lineHeight: '1.5', margin: 0 }}>
                        {node.status === 'pending' 
                          ? "Reviewing this request authorizes you as a digital executor. You will be notified if this node's vital signal drops."
                          : "MONITORING ACTIVE. You are authorized to confirm a crisis or veto false alarms using the command console below."}
                    </p>
                </div>

                {/* Actions: Reorganized for clarity */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {node.status === "pending" ? (
                    <>
                      <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleResponse(node.id, 'accepted')}>ACCEPT</button>
                      <button className="secondary-btn" style={{ flex: 1 }} onClick={() => handleResponse(node.id, 'declined')}>DECLINE</button>
                    </>
                  ) : (
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                className="btn-primary" 
                                style={{ flex: 1, background: 'rgba(255, 77, 77, 0.1)', border: '1px solid #ff4d4d', color: '#ff4d4d' }}
                                onClick={() => handleVerifyStatus(node.id, node.owner_id, true)}
                            >
                                CONFIRM DEATH
                            </button>
                            <button 
                                className="btn-primary" 
                                style={{ flex: 1, background: 'rgba(0, 251, 255, 0.1)' }}
                                onClick={() => handleVerifyStatus(node.id, node.owner_id, false)}
                            >
                                VETO (ALIVE)
                            </button>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ padding: '15px', textAlign: 'center', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="legal-subtitle" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
            SECURE TERMINAL // NO LOGS RETAINED // AES-256
        </p>
      </div>
    </div>
  );
}