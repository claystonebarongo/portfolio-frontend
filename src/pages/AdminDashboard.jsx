import React, { useState, useEffect } from "react";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserTrustees, setSelectedUserTrustees] = useState(null);
  const adminId = localStorage.getItem("userId"); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users?admin_id=${adminId}`);
      
      const usersWithStats = await Promise.all(res.data.map(async (u) => {
        try {
          const stats = await api.get(`/admin/user-stats/${u.id}?admin_id=${adminId}`);
          const trusteeRes = await api.get(`/admin/user-trustees/${u.id}?admin_id=${adminId}`);
          
          const confirmations = trusteeRes.data.filter(t => 
            t.status && t.status.toLowerCase() === 'confirmed'
          ).length;

          return { 
            ...u, 
            doc_count: stats.data.doc_count,
            confirm_count: confirmations 
          };
        } catch { 
          return { ...u, doc_count: 0, confirm_count: 0 }; 
        }
      }));
      setUsers(usersWithStats);
    } catch (err) { 
      console.error("Access Denied or Connection Error."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleReleaseAssets = async (userId, name) => {
    if (!window.confirm(`INITIALIZE FINAL ASSET RELEASE FOR ${name}?`)) return;
    try {
      await api.post(`/admin/approve-release`, { admin_user_id: adminId, target_user_id: userId });
      alert("PROTOCOL EXECUTED: Assets released.");
      fetchUsers();
    } catch (err) { alert("Execution failed."); }
  };

  const handleResetPassword = async (userId, name) => {
    if (!window.confirm(`Reset password for ${name} to 'RESET1234'?`)) return;
    try {
      await api.post(`/admin/reset-password/${userId}?admin_id=${adminId}`);
      alert(`SUCCESS: ${name}'s password is now RESET1234`);
    } catch (err) {
      alert("Reset failed. Check backend endpoint.");
    }
  };

  const toggleTrustees = async (userId) => {
    if (selectedUserTrustees?.id === userId) { 
      setSelectedUserTrustees(null); 
      return; 
    }
    try {
      const res = await api.get(`/admin/user-trustees/${userId}?admin_id=${adminId}`);
      setSelectedUserTrustees({ id: userId, list: res.data });
    } catch (err) { alert("Intercept failed."); }
  };

  const purgeNode = async (targetId, name) => {
    if (!window.confirm(`PERMANENTLY PURGE ${name}?`)) return;
    try {
      await api.delete(`/admin/delete-node/${targetId}?admin_id=${adminId}`);
      fetchUsers();
    } catch (err) { alert("Purge failed."); }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const crisisUsers = filteredUsers.filter(u => 
    u.status && u.status.toUpperCase() === 'PENDING_VERIFICATION'
  );

  const completedUsers = filteredUsers.filter(u => 
    u.status && u.status.toUpperCase() === 'TRIGGERED'
  );

  const healthyUsers = filteredUsers.filter(u => 
    (!u.status || u.status.toUpperCase() !== 'PENDING_VERIFICATION') &&
    (u.status?.toUpperCase() !== 'TRIGGERED')
  );

  const totalDocs = users.reduce((sum, u) => sum + (u.doc_count || 0), 0);

  return (
    <div className="admin-wrapper">
      <style>{`
        /* GLOBAL RESET & SCROLL FIX */
        html, body { 
          margin: 0; 
          padding: 0; 
          background: #050505; 
          color: white; 
          min-height: 100vh;
          overflow-x: hidden;
          overflow-y: auto; /* Ensures browser level scrolling */
        }

        .admin-wrapper { 
          background: #050505; 
          min-height: 100vh; 
          display: flex; 
          flex-direction: column; 
          font-family: 'Inter', sans-serif; 
        }

        .admin-header { 
          padding: 20px 5%; 
          border-bottom: 2px solid #ff4444; 
          background: rgba(5, 5, 5, 0.95); 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          position: sticky; 
          top: 0; 
          z-index: 100; 
          backdrop-filter: blur(10px); 
        }

        .admin-title { color: #ff4444; margin: 0; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 2px; }
        
        .node-container { 
          padding: 20px 5%; 
          width: 90%; 
          margin: 0 auto; 
          flex: 1 0 auto; /* Allows container to grow with content */
        }
        
        .search-container { margin-bottom: 30px; }
        .admin-search { 
          width: 100%; padding: 15px; background: #111; border: 1px solid #333; 
          color: #00fbff; border-radius: 4px; font-family: 'Courier New', monospace; outline: none;
        }

        .crisis-card { background: rgba(255, 68, 68, 0.1); border: 1px solid #ff4444; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 5px solid #ff4444; }
        .release-btn { background: #00fbff; color: #000; border: none; padding: 12px; border-radius: 4px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 10px; transition: 0.3s; }
        .release-btn:disabled { background: #222; color: #555; cursor: not-allowed; border: 1px solid #333; }
        
        .desktop-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
        .desktop-table tr { background: #0a0a0a; }
        .desktop-table td, .desktop-table th { padding: 15px; text-align: left; }
        
        .action-btn { background: none; border: 1px solid #ff4444; color: #ff4444; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 0.7rem; margin-left: 5px; }
        .reset-btn { border-color: #ffbb00; color: #ffbb00; }
        
        .trustee-detail-box { background: rgba(255, 187, 0, 0.05); padding: 15px; border-radius: 4px; margin-top: 5px; border: 1px solid rgba(255, 187, 0, 0.2); }
        
        .stats-footer { 
          background: #000; 
          border-top: 1px solid #222; 
          padding: 20px 5%; 
          display: flex; 
          justify-content: space-around; 
          color: #666; 
          font-size: 0.7rem; 
          letter-spacing: 1px; 
          margin-top: auto; /* Sticks footer to bottom if content is short */
        }
      `}</style>

      <div className="admin-header">
        <h1 className="admin-title">SYSTEM CONTROL</h1>
        <button onClick={() => { localStorage.clear(); navigate("/login"); }} 
          style={{ background: 'none', border: '1px solid #ff4444', color: '#ff4444', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}>
          EXIT
        </button>
      </div>

      <div className="node-container">
        <div className="search-container">
          <input 
            type="text" className="admin-search" placeholder="SEARCH NODES BY NAME OR EMAIL..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#ff4444' }}>SCANNING NETWORK...</div>
        ) : (
          <>
            {/* 1. ACTIVE CRISIS SECTION */}
            {crisisUsers.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ color: '#ff4444', fontSize: '0.9rem', marginBottom: '15px', letterSpacing: '1px' }}>⚠️ CRISIS PROTOCOLS ACTIVE</h2>
                {crisisUsers.map(u => {
                  const isReady = u.confirm_count >= 2;
                  return (
                    <div key={u.id} className="crisis-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span><strong>{u.name}</strong> ({u.email})</span>
                        <span style={{ color: isReady ? '#00ff88' : '#ffbb00', fontWeight: 'bold' }}>
                           SIGNATURES: {u.confirm_count} / 2
                        </span>
                      </div>
                      <button 
                        className="release-btn" disabled={!isReady} 
                        onClick={() => handleReleaseAssets(u.id, u.name)}
                      >
                        {isReady ? "EXECUTE FINAL ASSET RELEASE" : "AWAITING SECOND TRUSTEE CONFIRMATION"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. STANDARD NODES TABLE */}
            <h3 style={{ color: '#555', fontSize: '0.7rem', marginBottom: '10px', textTransform: 'uppercase' }}>Network Nodes</h3>
            <table className="desktop-table">
              <thead>
                <tr style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  <th>Identity</th>
                  <th>Vault</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {healthyUsers.map(u => (
                  <React.Fragment key={u.id}>
                    <tr>
                      <td>
                        <div style={{ color: '#00fbff', fontWeight: 'bold' }}>{u.name}</div>
                        <div style={{ color: '#555', fontSize: '0.75rem' }}>{u.email}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{u.doc_count} DOCS</div>
                        <div onClick={() => toggleTrustees(u.id)} style={{ color: '#ffbb00', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', marginTop: '4px' }}>
                          {selectedUserTrustees?.id === u.id ? "HIDE NETWORK" : "VIEW TRUSTEES"}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#00fbff', fontSize: '0.75rem', fontWeight: 'bold' }}>● ONLINE</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="action-btn reset-btn" onClick={() => handleResetPassword(u.id, u.name)}>RESET PWD</button>
                        <button className="action-btn" onClick={() => purgeNode(u.id, u.name)}>PURGE</button>
                      </td>
                    </tr>
                    {selectedUserTrustees?.id === u.id && (
                      <tr>
                        <td colSpan="4" style={{ padding: '0 15px 15px 15px', background: '#0a0a0a' }}>
                          <div className="trustee-detail-box">
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.7rem', color: '#ffbb00' }}>APPOINTED TRUSTEES</h4>
                            {selectedUserTrustees.list.map((t, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                                <span>{t.full_name} <small style={{ color: '#555' }}>({t.relation})</small></span>
                                <span style={{ color: t.status && t.status.toLowerCase() === 'confirmed' ? '#ff4444' : '#00fbff', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                  {t.status?.toUpperCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* 3.  (HISTORY) */}
            {completedUsers.length > 0 && (
              <div style={{ marginTop: '50px', borderTop: '1px solid #222', paddingTop: '20px', paddingBottom: '50px' }}>
                <h3 style={{ color: '#00ff88', fontSize: '0.7rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  ✔ COMPLETED RELEASES
                </h3>
                <table className="desktop-table">
                  <tbody>
                    {completedUsers.map(u => (
                      <tr key={u.id} style={{ opacity: 0.6, borderLeft: '3px solid #00ff88' }}>
                        <td>
                          <div style={{ color: '#aaa', fontWeight: 'bold' }}>{u.name}</div>
                          <div style={{ color: '#444', fontSize: '0.7rem' }}>{u.email}</div>
                        </td>
                        <td style={{ color: '#666' }}>
                          {u.doc_count} ASSETS TRANSFERRED
                        </td>
                        <td style={{ textAlign: 'right', color: '#00ff88', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          PROTOCOL SUCCESSFUL
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <div className="stats-footer">
        <span>TOTAL USERS: {users.length}</span>
        <span>VAULT ASSETS: {totalDocs} DOCUMENTS</span>
        <span>SYSTEM STATUS: <span style={{ color: '#00ff88' }}>OPERATIONAL</span></span>
      </div>
    </div>
  );
}