import React, { useId } from "react";
import { NavLink } from "react-router-dom";

export default function SiteHeader({ isDarkMode, onToggleDarkMode }) {
  const switchId = useId();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink className="brand" to="/" aria-label="PokePalette home">
          <img
            className="brand-logo"
            src="/pokeball.png"
            alt="PokePalette logo"
          />
          <span className="brand-text">PokePalette</span>
        </NavLink>

        <nav className="nav" aria-label="Primary navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/themes">My Themes</NavLink>

          <span className="dm-wrap">
            <label className="dm-label" htmlFor={switchId}>
              Dark mode
            </label>
            <input
              id={switchId}
              className="dm-toggle"
              type="checkbox"
              checked={isDarkMode}
              onChange={onToggleDarkMode}
            />
          </span>
        </nav>
      </div>
    </header>
  );
}
