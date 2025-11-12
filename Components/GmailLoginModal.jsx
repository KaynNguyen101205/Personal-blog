import React, { useState, useEffect } from "react";
import { loginWithGmail, isValidGmail, logoutGmail } from "@/utils/auth";

export default function GmailLoginModal({ onSuccess, onCancel }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    checkTheme();
    const interval = setInterval(checkTheme, 100);
    return () => clearInterval(interval);
  }, []);

  const bgColor = isDarkMode ? "#1B3C53" : "#F9F3EF";
  const textColor = isDarkMode ? "#D2C1B6" : "#1B3C53";
  const subtleTextColor = isDarkMode ? "#D2C1B6" : "#456882";
  const shadowLight = isDarkMode ? "#2a5370" : "#ffffff";
  const shadowDark = isDarkMode ? "#0d1f2a" : "#d9cec4";
  const inputBgColor = isDarkMode ? "#ffffff" : "#ffffff";
  const inputTextColor = isDarkMode ? "#000000" : "#1B3C53";

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (isValidGmail(email)) {
      if (loginWithGmail(email)) {
        onSuccess();
      } else {
        alert("Failed to login. Please try again.");
        setIsLoading(false);
      }
    } else {
      alert("Please enter a valid Gmail address (@gmail.com)");
      setIsLoading(false);
    }
  };

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
          Login with Gmail
        </h2>
        <p style={{ marginBottom: "1rem", color: subtleTextColor, fontSize: "0.9rem" }}>
          Please enter your Gmail address to comment:
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@gmail.com"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "12px",
              border: `2px solid ${isDarkMode ? bgColor : subtleTextColor}`,
              backgroundColor: inputBgColor,
              color: inputTextColor,
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
                backgroundColor: isDarkMode ? "#ffffff" : "#1B3C53",
                color: isDarkMode ? "#1B3C53" : "#D2C1B6",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  border: `2px solid ${isDarkMode ? "#ffffff" : subtleTextColor}`,
                  backgroundColor: isDarkMode ? "#1B3C53" : "#ffffff",
                  color: isDarkMode ? textColor : "#1B3C53",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

