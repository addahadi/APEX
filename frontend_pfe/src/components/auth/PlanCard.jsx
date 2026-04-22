import React from "react";
import { P } from "../../lib/design-tokens";

export default function PlanCard({
  title,
  price,
  subtitle,
  features,
  buttonText,
  highlight,
  onClick,
  disabled,
}) {
  return (
    <div
      style={{
        background: highlight ? P.main : P.surface,
        color: highlight ? "#fff" : P.txt,
        border: `1px solid ${highlight ? P.main : P.border}`,
        borderRadius: 12,
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        boxShadow: highlight ? "0 8px 24px rgba(16,78,216,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
        transform: highlight ? "translateY(-4px)" : "none",
        transition: "all 0.2s ease"
      }}
    >
      <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>{price}</div>
      <p style={{ fontSize: 15, color: highlight ? "rgba(255,255,255,0.8)" : P.txt3, marginBottom: 24, minHeight: 40 }}>
        {subtitle}
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 32, flex: 1 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, fontSize: 15, fontWeight: f.bold ? 600 : 400 }}>
            {/* simple icon replacement */}
            <span style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              width: 24, 
              height: 24, 
              borderRadius: "50%", 
              background: highlight ? "rgba(255,255,255,0.2)" : `${P.main}15`, 
              color: highlight ? "#fff" : P.main,
              fontSize: 12
            }}>✓</span>
            {f.text}
          </li>
        ))}
      </ul>

      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 8,
          background: highlight ? "#fff" : P.main,
          color: highlight ? P.main : "#fff",
          fontSize: 16,
          fontWeight: 600,
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          transition: "transform 0.15s ease, opacity 0.15s ease",
        }}
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {buttonText}
      </button>
    </div>
  );
}
