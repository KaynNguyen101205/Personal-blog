import React from "react";

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
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const bgColor = isDarkMode ? '#1B3C53' : '#F9F3EF';
  const textColor = isDarkMode ? '#D2C1B6' : '#1B3C53';
  const labelColor = isDarkMode ? '#D2C1B6' : '#456882';

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