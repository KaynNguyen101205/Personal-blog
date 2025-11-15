import React from "react";
import { Loader2 } from "lucide-react";
import { useTheme } from "@src/hooks/useTheme";

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
  const { palette } = useTheme();
  const bgColor = palette.surfaceBackground;
  const textColor = palette.textPrimary;
  
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