import React, { useState, useEffect } from "react";
import { api, BASE_URL } from "../api/api"; // Added BASE_URL import
import Button from "../components/Button";
import Input from "../components/Input"; 
import BottomNav from "../components/BottomNav";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const userId = localStorage.getItem("userId");
  
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    id_number: "",
    nationality: "",
    check_in_frequency_days: 90
  });

  const [profilePic, setProfilePic] = useState(null);
  const [previewPic, setPreviewPic] = useState(null); // Local preview

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get(`/user-status?user_id=${userId}`);
        setProfile({
          full_name: res.data.full_name || "",
          email: res.data.email || "",
          id_number: res.data.id_number || "",
          nationality: res.data.nationality || "",
          check_in_frequency_days: res.data.check_in_frequency_days || 90
        });
        setProfilePic(res.data.profile_pic);
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        user_id: parseInt(userId),
        full_name: profile.full_name,
        id_number: profile.id_number,
        nationality: profile.nationality,
        check_in_frequency_days: parseInt(profile.check_in_frequency_days)
      };
      await api.post("/update-profile", payload);
      localStorage.setItem("userName", profile.full_name);
      setEditMode(false);
      alert("Vault Protocol Updated.");
    } catch (err) {
      alert("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    setPreviewPic(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await api.post("/upload-profile-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfilePic(res.data.path);
      setPreviewPic(null); // Clear preview once saved
      alert("Biometric image secured.");
    } catch (err) {
      alert("Picture upload failed.");
      setPreviewPic(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Close the Vault? Session will be terminated.")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  // Helper for "Vault Health"
  const getVaultHealth = () => {
    const days = profile.check_in_frequency_days;
    if (days <= 30) return { label: "CRITICAL / HIGH SENSITIVITY", color: "#ff4444" };
    if (days <= 90) return { label: "STABLE / STANDARD", color: "#00fbff" };
    return { label: "RELAXED / DORMANT", color: "#ffbb00" };
  };

  return (
    <div className="tab-page-container">
      <div className="portfolio-header" style={{ padding: '30px 20px' }}>
        <p className="label-dim text-center">SYSTEM CONTROL</p>
        <h2 className="page-title text-center" style={{ color: '#00fbff' }}>SETTINGS</h2>
      </div>

      <div className="scroll-content" style={{ paddingBottom: '120px' }}>
        
        {/* IDENTITY SECTION */}
        <div className="glass-card" style={{ marginBottom: '20px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3 style={{ color: '#00fbff', fontSize: '1rem' }}>IDENTITY VAULT</h3>
            <button onClick={() => setEditMode(!editMode)} style={{ background: 'none', border: 'none', color: '#00fbff', cursor: 'pointer', fontSize: '0.8rem' }}>
              {editMode ? "CANCEL" : "EDIT"}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <label style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}>
              <div className="avatar-glow" style={{ width: '100px', height: '100px', overflow: 'hidden', border: '2px solid #00fbff', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                {previewPic ? (
                  <img src={previewPic} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                ) : profilePic ? (
                  <img src={`${BASE_URL}/${profilePic}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2rem', color: '#00fbff' }}>{profile.full_name?.charAt(0)}</span>
                )}
                {loading && <div style={{ position: 'absolute', fontSize: '0.5rem', color: '#00fbff' }}>UPLOADING...</div>}
              </div>
              <input type="file" hidden onChange={handlePicUpload} accept="image/*" />
              <div style={{ fontSize: '0.6rem', color: '#00fbff', marginTop: '8px' }}>UPDATE PHOTO</div>
            </label>
          </div>

          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Input label="Legal Name" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} />
              <Input label="Government ID" value={profile.id_number} onChange={(e) => setProfile({...profile, id_number: e.target.value})} />
              <Input label="Nationality" value={profile.nationality} onChange={(e) => setProfile({...profile, nationality: e.target.value})} />
              <Button onClick={handleUpdateProfile} disabled={loading}>{loading ? "SAVING..." : "SAVE CHANGES"}</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p className="label-dim">NAME: <span style={{ color: 'white' }}>{profile.full_name}</span></p>
              <p className="label-dim">EMAIL: <span style={{ color: 'white' }}>{profile.email}</span></p>
              <p className="label-dim">ID: <span style={{ color: 'white' }}>{profile.id_number || "NOT SET"}</span></p>
            </div>
          )}
        </div>

        {/* SYSTEM DIAGNOSTICS */}
        <div className="glass-card" style={{ marginBottom: '20px', padding: '20px', borderLeft: `4px solid ${getVaultHealth().color}` }}>
          <h3 style={{ color: '#888', fontSize: '0.7rem', marginBottom: '10px', textTransform: 'uppercase' }}>System Diagnostics</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem' }}>VAULT STATUS:</span>
            <span style={{ color: getVaultHealth().color, fontWeight: 'bold', fontSize: '0.8rem' }}>{getVaultHealth().label}</span>
          </div>
          <div style={{ marginTop: '10px', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${(profile.check_in_frequency_days / 365) * 100}%`, height: '100%', background: getVaultHealth().color }}></div>
          </div>
        </div>

        {/* PROTOCOL SECTION */}
        <div className="glass-card" style={{ marginBottom: '20px', padding: '20px' }}>
          <h3 style={{ color: '#00fbff', fontSize: '1rem', marginBottom: '10px' }}>DEAD MAN'S SWITCH</h3>
          <p className="label-dim" style={{ fontSize: '0.8rem', marginBottom: '20px' }}>
            Distribution triggers after <span style={{ color: '#00fbff' }}>{profile.check_in_frequency_days} days</span> of inactivity.
          </p>
          <input 
            type="range" min="7" max="365" 
            value={profile.check_in_frequency_days} 
            onChange={(e) => setProfile({...profile, check_in_frequency_days: e.target.value})}
            style={{ width: '100%', accentColor: '#00fbff', marginBottom: '20px' }} 
          />
          <Button onClick={handleUpdateProfile}>UPDATE PROTOCOL</Button>
        </div>

        <button className="secondary-btn" onClick={handleLogout} style={{ width: '100%', color: '#ff4444', border: '1px solid #ff4444', padding: '15px', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>
          TERMINATE SESSION
        </button>
      </div>
      <BottomNav />
    </div>
  );
}