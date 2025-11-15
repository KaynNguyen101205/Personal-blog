import React, { useState } from "react";
import { setUserMode, verifyAdminPassword } from "@/utils/auth";
import { useTheme } from "@src/hooks/useTheme";

export default function AuthModal({ onSelect, adminOnly = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(adminOnly);
  const { isDarkMode, palette } = useTheme();

  const handleGuest = () => {
    setUserMode("guest");
    onSelect("guest");
  };

  const handleAdminClick = () => {
    setShowPasswordInput(true);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (verifyAdminPassword(password)) {
      setUserMode("admin", true);
      onSelect("admin");
    } else {
      alert("Access denied. Incorrect password.");
      setPassword("");
      setIsLoading(false);
    }
  };
  const bgColor = palette.surfaceBackground;
  const textColor = palette.textPrimary;
  const subtleTextColor = palette.textSecondary;
  const inputBgColor = "#ffffff";
  const inputTextColor = "#1B3C53";
  const shadowLight = palette.shadowLight;
  const shadowDark = palette.shadowDark;
  const primaryButtonBg = isDarkMode ? "#ffffff" : palette.textPrimary;
  const primaryButtonColor = isDarkMode ? palette.textPrimary : palette.pageBackground;
  const secondaryButtonBg = isDarkMode ? bgColor : "#ffffff";
  const secondaryButtonBorder = isDarkMode ? "#ffffff" : subtleTextColor;
  const secondaryButtonColor = isDarkMode ? textColor : palette.textPrimary;

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
        {!showPasswordInput ? (
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
                  backgroundColor: primaryButtonBg,
                  color: primaryButtonColor,
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
                  backgroundColor: bgColor,
                  color: textColor,
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
          <form onSubmit={handlePasswordSubmit}>
            <p style={{ marginBottom: "1rem", color: subtleTextColor, fontSize: "0.9rem" }}>
              Please enter the admin password:
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "12px",
                border: isDarkMode ? `2px solid ${bgColor}` : `2px solid ${subtleTextColor}`,
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
                  backgroundColor: primaryButtonBg,
                  color: primaryButtonColor,
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
                    setShowPasswordInput(false);
                    setPassword("");
                  }
                }}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  border: `2px solid ${secondaryButtonBorder}`, // White border in dark mode, dark border in light mode
                  backgroundColor: secondaryButtonBg, // Dark blue in dark mode, white in light mode
                  color: secondaryButtonColor, // Light text in dark mode, dark text in light mode
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

