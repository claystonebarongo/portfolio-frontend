import React from "react";

export default function Input({ label, error, ...props }) {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <input 
        
        className={`glass-input ${error ? "input-error" : ""}`} 
        {...props} 
      />
      {}
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}