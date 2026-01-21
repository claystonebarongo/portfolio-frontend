import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Register() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    full_name: "",
    // Pull the email verified in the previous step
    email: localStorage.getItem("verifiedEmail") || "", 
    password: "",
    phone_number: "", // Added to match UserCreate schema
    date_of_birth: "",
    terms_accepted: true // Required by your backend logic
  });

  // Security check: If they didn't verify an email, send them back to the start
  useEffect(() => {
    if (!formData.email) {
      nav("/verify-phone");
    }
  }, [formData.email, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valErrors = {};

    if (!formData.full_name) valErrors.full_name = "Please input name to continue";
    if (!formData.email) valErrors.email = "Please input email to continue";
    if (!formData.phone_number) valErrors.phone_number = "Phone number is required";
    if (!formData.date_of_birth) valErrors.date_of_birth = "Please input DOB to continue";
    if (!formData.password) valErrors.password = "Please input password to continue";

    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors); 
      return;
    }

    setLoading(true);
    try {
      // Hits @app.post("/register")
      await api.post("/register", formData);
      
      // Cleanup storage after success
      localStorage.removeItem("verifiedEmail");
      nav("/registration-complete");
    } catch (err) {
      const serverMsg = err.response?.data?.detail || "Registration failed. Please try again.";
      setErrors({ server: serverMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="glass-card">
        <h2 className="brand-title">Enroll in Vault</h2>
        <p className="legal-subtitle">Complete your profile to secure your digital legacy.</p>

        <form onSubmit={handleSubmit}>
          <Input 
            label="Full Legal Name" 
            placeholder="e.g., John Doe"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            error={errors.full_name}
          />

          <Input 
            label="Verified Email" 
            type="email"
            value={formData.email}
            disabled={true} // Locked because it was already verified
            error={errors.email}
          />

          <Input 
            label="Phone Number" 
            placeholder="+254..."
            value={formData.phone_number}
            onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            error={errors.phone_number}
          />

          <Input 
            label="Date of Birth" 
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
            error={errors.date_of_birth}
          />

          <Input 
            label="Master Password" 
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            error={errors.password}
          />

          {errors.server && (
            <p className="error-text" style={{textAlign: 'center', marginBottom: '15px'}}>{errors.server}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Creating Vault..." : "Complete Registration"}
          </Button>
        </form>
      </div>
    </div>
  );
}