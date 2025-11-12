import React from "react";
import { Loader2 } from "lucide-react";

export default function NeumorphicButton({ 
  children, 
  onClick, 
  type = "button",
  variant = "default",
  disabled = false,
  loading = false,
  icon: Icon,
  className = ""
}) {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const bgColor = isDarkMode ? '#1B3C53' : '#F9F3EF';
  const textColor = isDarkMode ? '#D2C1B6' : '#1B3C53';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        px-6 py-3 rounded-2xl font-medium
        transition-all duration-300
        flex items-center justify-center gap-2
        ${variant === "primary" ? "neumorphic-shadow neumorphic-hover" : "neumorphic-inset"}
        ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      style={{ 
        color: textColor,
        backgroundColor: bgColor
      }}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        Icon && <Icon className="w-5 h-5" />
      )}
      <span>{children}</span>
    </button>
  );
}