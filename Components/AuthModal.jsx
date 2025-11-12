import React, { useState } from "react";
import { setUserMode } from "@/utils/auth";

const ADMIN_EMAIL = "namkhanh101205";

export default function AuthModal({ onSelect, adminOnly = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(adminOnly);

  const handleGuest = () => {
    setUserMode("guest");
    onSelect("guest");
  };

  const handleAdminClick = () => {
    setShowEmailInput(true);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (email && email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()) {
      setUserMode("admin", email.trim());
      onSelect("admin");
    } else {
      alert("Access denied. Only the admin email can access admin features.");
      setEmail("");
      setIsLoading(false);
    }
  };

  const isDarkMode = localStorage.getItem("theme") === "dark";
  const bgColor = isDarkMode ? "#1B3C53" : "#F9F3EF";
  const textColor = isDarkMode ? "#D2C1B6" : "#1B3C53";
  const subtleTextColor = isDarkMode ? "#456882" : "#456882";
  const shadowLight = isDarkMode ? "#2a5370" : "#ffffff";
  const shadowDark = isDarkMode ? "#0d1f2a" : "#d9cec4";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          backgroundColor: bgColor,
          padding: "2rem",
          borderRadius: "24px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: `8px 8px 16px ${shadowDark}, -8px -8px 16px ${shadowLight}`,
        }}
      >
        <h2 style={{ marginBottom: "1.5rem", color: textColor, fontSize: "1.5rem", fontWeight: "bold" }}>
          {adminOnly ? "Login as Admin" : "Welcome to Kayane Blog"}
        </h2>
        {!showEmailInput ? (
          <>
            <p style={{ marginBottom: "2rem", color: subtleTextColor, fontSize: "0.9rem" }}>
              How would you like to access the site?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <button
                onClick={handleGuest}
                disabled={isLoading}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#456882",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.3s",
                }}
              >
                Continue as Guest
              </button>
              <button
                onClick={handleAdminClick}
                disabled={isLoading}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#1B3C53",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.3s",
                }}
              >
                Login as Admin
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleEmailSubmit}>
            <p style={{ marginBottom: "1rem", color: subtleTextColor, fontSize: "0.9rem" }}>
              Please enter your admin email:
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "12px",
                border: `2px solid ${subtleTextColor}`,
                backgroundColor: bgColor,
                color: textColor,
                fontSize: "1rem",
                marginBottom: "1rem",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "0.75rem 1.5rem",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#1B3C53",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? "Verifying..." : "Login"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (adminOnly) {
                    onSelect("guest"); // Keep as guest if canceling admin login
                  } else {
                    setShowEmailInput(false);
                    setEmail("");
                  }
                }}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  border: `2px solid ${subtleTextColor}`,
                  backgroundColor: "transparent",
                  color: subtleTextColor,
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

