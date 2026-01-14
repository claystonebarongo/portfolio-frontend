import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function Terms() {
  const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const scrollRef = useRef(null);
  const nav = useNavigate();

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasReadToBottom(true);
      }
    }
  };

  // FUNCTIONAL ADDITION: Clear old session data to start fresh
  const handleAgree = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    nav("/verify-phone");
  };

  return (
    <div className="main-container">
      <div className="glass-card">
        <h1 className="brand-title">Portfolio Immortalized</h1>
        <p className="legal-subtitle">Terms & Conditions and Permissions</p>

        <div className="scroll-area" ref={scrollRef} onScroll={handleScroll}>
          <section>
            <h3>1. Permissions</h3>
            <p>We access only explicitly specified contacts. All transmissions occur via HTTPS encryption to our secure endpoint.</p>
          </section>

          <section>
            <h3>2. Data Collection</h3>
            <p>Phone number is mandatory. We also collect name, age, and ID for legal verification and multi-factor authentication.</p>
          </section>

          <section>
            <h3>3. Storage & Security</h3>
            <p>Your data is protected through military-grade encryption. We maintain strict protocols against third-party sharing.</p>
          </section>

          <section>
            <h3>4. Use of Information</h3>
            <p>Information is used for identity verification and service optimization to ensure secure document release.</p>
          </section>
        </div>

        <div className="action-area">
          {!hasReadToBottom && (
            <p className="hint-text">Please swipe down to read all to proceed</p>
          )}
          
          <div className="button-row">
            <button className="secondary-btn" onClick={() => alert("Registration required agreement.")}>
              Disagree
            </button>
            <Button 
              disabled={!hasReadToBottom} 
              onClick={handleAgree}
              style={{ opacity: hasReadToBottom ? 1 : 0.5, flex: 1 }}
            >
              Agree & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}