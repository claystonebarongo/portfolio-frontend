import React, { useState, useEffect } from "react";
import { api, BASE_URL } from "../api/api"; // Added BASE_URL import
import BottomNav from "../components/BottomNav";

export default function Portfolio() {
  const [uploading, setUploading] = useState(false);
  const [fileHistory, setFileHistory] = useState([]);
  const userId = localStorage.getItem("userId");

  const fetchVaultContent = async () => {
    try {
      const res = await api.get(`/user-documents?user_id=${userId}`);
      setFileHistory(res.data);
    } catch (err) {
      console.error("Could not load vault history", err);
    }
  };

  useEffect(() => {
    if (userId) fetchVaultContent();
  }, [userId]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file || !userId) return;
    
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("user_id", userId);
    
    const endpoint = type === "will" ? "/upload-will" : "/upload-video";
    
    try {
      await api.post(endpoint, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0, 
      });
      fetchVaultContent(); 
    } catch (err) {
      alert("Vaulting failed.");
    } finally {
      setUploading(false);
      e.target.value = null; 
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Permanently delete?")) return;
    try {
      await api.delete(`/delete-document/${docId}`);
      setFileHistory(fileHistory.filter(item => item.id !== docId));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  return (
    <div className="tab-page-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <div className="portfolio-header" style={{ padding: '30px 20px', flexShrink: 0 }}>
        <p className="label-dim text-center">SECURE ASSET MANAGEMENT</p>
        <h2 className="page-title text-center">THE VAULT</h2>
      </div>

      <div className="scroll-content" style={{ paddingBottom: '120px', overflowY: 'auto', flex: 1, paddingLeft: '20px', paddingRight: '20px' }}>
        
        <div className="glass-card" style={{ 
          marginBottom: '30px', 
          padding: '25px 20px', 
          width: '100%', 
          border: '1px solid rgba(0, 251, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(0, 251, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <p className="label-dim" style={{ marginBottom: '20px', fontSize: '0.8rem', letterSpacing: '1px' }}>ADD NEW ASSETS</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '350px' }}>
            <label className="secondary-btn" style={{ 
              width: '100%', 
              padding: '15px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '12px',
              cursor: 'pointer'
            }}>
              <span style={{ fontSize: '1.2rem' }}>📄</span>
              <span style={{ fontWeight: 'bold' }}>{uploading ? "VAULTING..." : "UPLOAD WILL"}</span>
              <input type="file" hidden accept=".pdf" onChange={(e) => handleFileUpload(e, "will")} />
            </label>

            <label className="secondary-btn" style={{ 
              width: '100%', 
              padding: '15px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '12px',
              cursor: 'pointer'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🎬</span>
              <span style={{ fontWeight: 'bold' }}>{uploading ? "VAULTING..." : "UPLOAD VIDEO"}</span>
              <input type="file" hidden accept="video/*" onChange={(e) => handleFileUpload(e, "video")} />
            </label>
          </div>
          
          {uploading && (
            <div style={{ marginTop: '15px' }} className="status-indicator">
              <div className="dot green"></div>
              <span className="status-text" style={{ color: '#00fbff' }}>ENCRYPTING DATA...</span>
            </div>
          )}
        </div>

        <h3 className="section-header" style={{ marginBottom: '15px' }}>
          VAULT INVENTORY ({fileHistory.length})
        </h3>

        <div className="category-list">
          {fileHistory.length > 0 ? (
            fileHistory.map((item) => (
              <div key={item.id} className="category-item">
                <div className="category-icon-bg">
                  {item.doc_type?.toString().toUpperCase().includes("WILL") ? "📄" : "🎬"}
                </div>
                
                <div className="category-text">
                  <p className="cat-name">{item.file_name}</p>
                  <p className="label-dim" style={{ fontSize: '0.7rem' }}>
                    {new Date(item.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="status-indicator">
                    <div className="dot green"></div>
                    <span className="status-text">SECURED</span>
                  </div>
                  <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1.1rem' }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center label-dim" style={{ marginTop: '40px' }}>
              <p>Vault is currently empty.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}