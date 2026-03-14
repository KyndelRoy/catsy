import React from "react";
import { C, BADGE_MAP } from "../lib/theme";

export function Badge({ variant, children }) {
  const s = BADGE_MAP[variant] || BADGE_MAP.inactive;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      borderRadius: 9999, fontSize: 11, fontWeight: 600,
      padding: "2px 8px", lineHeight: 1.6,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {children}
    </span>
  );
}

export function Btn({ variant = "outline", onClick, children, style }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: 8, fontSize: 12, fontWeight: 500,
    cursor: "pointer", whiteSpace: "nowrap", userSelect: "none",
    transition: "background 0.15s, opacity 0.15s", fontFamily: "inherit",
    padding: "4px 10px",
  };
  const variants = {
    primary: { background: C.fg, color: "hsl(240,5.9%,10%)", border: "none", padding: "7px 14px", fontSize: 13 },
    outline: { background: "transparent", color: C.fg, border: `1px solid ${C.borderMd}` },
    danger: { background: "transparent", color: C.red, border: `1px solid ${C.redBorder}` },
    success: { background: "transparent", color: C.green, border: `1px solid ${C.greenBorder}` },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick}>
      {children}
    </button>
  );
}

export function Card({ title, action, onAction, children, style }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...style }}>
      {title && (
        <div style={{ padding: "14px 20px", borderBottom: `1px solid hsl(240,3.7%,12%)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "hsl(0,0%,90%)" }}>{title}</span>
          {action && <span style={{ fontSize: 12, color: C.muted, cursor: "pointer", fontWeight: 500 }} onClick={onAction}>{action}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

import { Icon } from "./Icon";

export function PageHeader({ title, subtitle, action, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.fg, letterSpacing: "-0.02em" }}>{title}</h2>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{subtitle}</p>
      </div>
      {action && <Btn variant="primary" onClick={onAction}><Icon name="plus" size={14} /> {action}</Btn>}
    </div>
  );
}

export function Select({ value, onChange, children, style }) {
  return (
    <select value={value} onChange={onChange} style={{
      borderRadius: 8, border: `1px solid ${C.borderMd}`, background: C.input,
      padding: "7px 12px", fontSize: 13, color: C.fg, outline: "none",
      cursor: "pointer", fontFamily: "inherit", ...style,
    }}>
      {children}
    </select>
  );
}

export function Input({ value, onChange, placeholder, type = "text", style, min, max, step }) {
  return (
    <input type={type} min={min} max={max} step={step} value={value} onChange={onChange} placeholder={placeholder} style={{
      borderRadius: 8, border: `1px solid ${C.borderMd}`, background: C.input,
      padding: "7px 12px", fontSize: 13, color: C.fg, outline: "none",
      fontFamily: "inherit", ...style,
    }} />
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "hsl(240,5.9%,7%)", border: `1px solid ${C.borderMd}`, borderRadius: 12, width: 520, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.fg, letterSpacing: "-0.01em" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted, padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        {footer && <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>{footer}</div>}
      </div>
    </div>
  );
}

export function FormGroup({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, subColor, accentColor, icon }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accentColor }} />
      <div style={{ marginBottom: 12, fontSize: 18, color: accentColor }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: C.fg }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: subColor || C.muted, fontWeight: 500, marginTop: 8 }}>{sub}</div>
    </div>
  );
}

export function Stars({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name={i <= rating ? "starFilled" : "star"} size={13} color={i <= rating ? C.yellow : "hsl(240,3.7%,25%)"} />
      ))}
    </div>
  );
}

export function TH({ children, style }) {
  return (
    <th style={{
      padding: "10px 16px", textAlign: "left", fontSize: 10,
      fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
      color: C.muted, background: "hsl(240,3.7%,8%)",
      borderBottom: `1px solid ${C.border}`, ...style,
    }}>
      {children}
    </th>
  );
}

export function TD({ children, style, last }) {
  return (
    <td style={{
      padding: "12px 16px", fontSize: 13, color: "hsl(0,0%,90%)",
      borderBottom: last ? "none" : `1px solid hsl(240,3.7%,12%)`,
      verticalAlign: "middle", ...style,
    }}>
      {children}
    </td>
  );
}

export function Table({ headers, children }) {
  return (
    <div className="card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{headers.map((h, i) => <TH key={i}>{h}</TH>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
