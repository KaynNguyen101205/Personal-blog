import React from "react";
import { useTheme } from "@src/hooks/useTheme";

export default function NeumorphicInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
  rows = 4,
  required = false,
  className = ""
}) {
  const { palette } = useTheme();
  const bgColor = palette.surfaceBackground;
  const textColor = palette.textPrimary;
  const labelColor = palette.textSecondary;

  const baseClasses = `
    w-full px-5 py-4 rounded-2xl
    neumorphic-inset
    transition-all duration-300
    focus:outline-none
    font-medium
    ${className}
  `;

  const style = {
    backgroundColor: bgColor,
    color: textColor,
    border: 'none'
  };

  return (
    <div className="space-y-3">
      {label && (
        <label 
          className="block font-semibold pl-2" 
          style={{ color: labelColor }}
        >
          {label}
          {required && <span style={{ color: '#c66' }}> *</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className={baseClasses}
          style={style}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={baseClasses}
          style={style}
        />
      )}
    </div>
  );
}