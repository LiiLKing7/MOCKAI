import React from "react";
import "./glass-button.css";

export function GlassButton({ children, onClick, active = false, className = "" }) {
  return (
    <div className={`glass-button-wrap cursor-pointer rounded-full ${className}`} onClick={onClick}>
      <button className={`glass-button ${active ? 'active-state' : ''}`} type="button">
        <span className="glass-button-text">{children}</span>
      </button>
      <div className="glass-button-shadow rounded-full" />
    </div>
  );
}
