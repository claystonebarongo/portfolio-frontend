import React, { useState, useEffect } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { api } from "../api/api";
import BottomNav from "../components/BottomNav";

export default function Network() {
  const [activeTab, setActiveTab] = useState("trustees");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState([]);
  const [errors, setErrors] = useState({});
  const userId = localStorage.getItem("userId");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    relationship: ""
  });

  const fetchData = async () => {
    try {
      const res = await api.get(`/user-network?user_id=${userId}&type=${activeTab}`);
      setListData(res.data);
    } catch (err) {
      console.error("Network Fetch Error", err);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [activeTab, userId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!formData.name || !formData.email) {
      setErrors({ name: "Required field", email: "Required field" });
      return;
    }

    setLoading(true);
    try {
      const endpoint = activeTab === "trustees" ? "/add-trustee" : "/add-beneficiary";
      const payload = {
        user_id: parseInt(userId),
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "N/A",
        relationship: formData.relationship
      };

      await api.post(endpoint, payload);
      setShowAddForm(false);
      setFormData({ name: "", email: "", phone: "", relationship: "" });
      fetchData(); 
    } catch (err) {
      alert("Error adding member.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Permanently remove this ${activeTab.slice(0, -1)}?`)) return;
    try {
      const endpoint = activeTab === "trustees" 
        ? `/remove-trustee/${id}?user_id=${userId}` 
        : `/remove-beneficiary/${id}?user_id=${userId}`;
      await api.delete(endpoint);
      fetchData();
    } catch (err) {
      alert("Failed to remove member.");
    }
  };

  
  const handleResendInvite = async (member) => {
    try {
      await api.post("/add-trustee", {
        user_id: userId,
        name: member.full_name,
        email: member.email,
        phone: "N/A",
        relationship: member.relation_type
      });
      alert("Invitation resent successfully!");
    } catch (err) {
      alert("Could not resend invitation.");
    }
  };

  return (
    <div className="tab-page-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <div className="portfolio-header" style={{ padding: '30px 20px', flexShrink: 0 }}>
        <p className="label-dim text-center">PROTOCOL DELEGATION</p>
        <h2 className="page-title text-center" style={{ color: '#00fbff' }}>NETWORK</h2>
      </div>

      <div style={{ display: 'flex', gap: '10px', padding: '0 20px 20px' }}>
        <button 
          onClick={() => setActiveTab("trustees")}
          style={{ 
            flex: 1, padding: '12px', borderRadius: '8px', border: activeTab === 'trustees' ? '1px solid #00fbff' : '1px solid #333',
            background: activeTab === 'trustees' ? 'rgba(0, 251, 255, 0.1)' : 'transparent',
            color: activeTab === 'trustees' ? '#00fbff' : '#888', fontWeight: 'bold'
          }}
        >
          TRUSTEES ({listData.filter(t => t.status === 'accepted').length})
        </button>
        <button 
          onClick={() => setActiveTab("beneficiaries")}
          style={{ 
            flex: 1, padding: '12px', borderRadius: '8px', border: activeTab === 'beneficiaries' ? '1px solid #00fbff' : '1px solid #333',
            background: activeTab === 'beneficiaries' ? 'rgba(0, 251, 255, 0.1)' : 'transparent',
            color: activeTab === 'beneficiaries' ? '#00fbff' : '#888', fontWeight: 'bold'
          }}
        >
          BENEFICIARIES
        </button>
      </div>

      <div className="scroll-content" style={{ paddingBottom: '120px', overflowY: 'auto', flex: 1, paddingLeft: '20px', paddingRight: '20px' }}>
        
        <button className="glass-card" onClick={() => setShowAddForm(true)} style={{ 
          width: '100%', padding: '20px', marginBottom: '25px', cursor: 'pointer', border: '1px dashed #00fbff', background: 'transparent'
        }}>
          <span style={{ color: '#00fbff', fontWeight: 'bold' }}>+ ADD {activeTab.toUpperCase()}</span>
        </button>

        <div className="category-list">
          {listData.map((member) => (
            <div key={member.id} className="category-item" style={{ width: '100%', marginBottom: '15px', position: 'relative', minHeight: '80px' }}>
              <div className="category-icon-bg">👤</div>
              <div className="category-text">
                {/* NEW: TYPE BADGE */}
                <span style={{ fontSize: '0.6rem', color: '#00fbff', letterSpacing: '1px' }}>
                   {activeTab === 'trustees' ? 'SECURE TRUSTEE' : 'ASSET BENEFICIARY'}
                </span>
                <p className="cat-name">{member.full_name}</p>
                <p className="label-dim" style={{ fontSize: '0.7rem' }}>{member.relation_type} • {member.email}</p>
                
                {/* NEW: RESEND BUTTON FOR PENDING TRUSTEES */}
                {activeTab === 'trustees' && member.status === 'pending' && (
                  <button onClick={() => handleResendInvite(member)} style={{ background: 'none', border: 'none', color: '#00fbff', fontSize: '0.65rem', padding: 0, textDecoration: 'underline', cursor: 'pointer', marginTop: '5px' }}>
                    Resend Invitation
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="status-indicator">
                      <div className={`dot ${activeTab === 'beneficiaries' ? 'green' : (member.status === 'accepted' ? 'green' : 'orange')}`}></div>
                      <span className="status-text" style={{ fontSize: '0.6rem' }}>
                          {activeTab === 'beneficiaries' ? 'READY' : member.status?.toUpperCase()}
                      </span>
                  </div>

                  <button onClick={() => handleDelete(member.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem', padding: '5px' }}>
                      &times;
                  </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {}
      {showAddForm && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '30px', border: '1px solid #00fbff' }}>
            <h3 style={{ color: '#00fbff', marginBottom: '20px' }}>New {activeTab.slice(0, -1)}</h3>
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Input label="Legal Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} error={errors.name} />
              <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} error={errors.email} />
              <Input label="Relationship" placeholder="Spouse, Lawyer, etc." value={formData.relationship} onChange={(e) => setFormData({...formData, relationship: e.target.value})} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <Button type="submit" disabled={loading} style={{ flex: 2 }}>{loading ? "..." : "Authorize"}</Button>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, background: '#222', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}