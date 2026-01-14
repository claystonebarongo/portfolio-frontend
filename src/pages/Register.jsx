import { useState } from "react";
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
    email: "",
    password: "",
    phone_number: localStorage.getItem("verifiedPhone") || "", 
    date_of_birth: "",
    terms_accepted: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valErrors = {};

    
    if (!formData.full_name) valErrors.full_name = "Please input name to continue";
    if (!formData.email) valErrors.email = "Please input email to continue";
    if (!formData.date_of_birth) valErrors.date_of_birth = "Please input DOB to continue";
    if (!formData.password) valErrors.password = "Please input password to continue";

    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors); 
      return;
    }

    setLoading(true);
    try {
      
      await api.post("/register", formData);
      
      
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
            onChange={(e) => {
                setFormData({...formData, full_name: e.target.value});
                if(errors.full_name) setErrors({...errors, full_name: ""});
            }}
            error={errors.full_name}
          />

          <Input 
            label="Email Address" 
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => {
                setFormData({...formData, email: e.target.value});
                if(errors.email) setErrors({...errors, email: ""});
            }}
            error={errors.email}
          />

          <Input 
            label="Date of Birth" 
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => {
                setFormData({...formData, date_of_birth: e.target.value});
                if(errors.date_of_birth) setErrors({...errors, date_of_birth: ""});
            }}
            error={errors.date_of_birth}
          />

          <Input 
            label="Master Password" 
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => {
                setFormData({...formData, password: e.target.value});
                if(errors.password) setErrors({...errors, password: ""});
            }}
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