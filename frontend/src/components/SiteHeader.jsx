import React from "react";
import { NavLink } from "react-router-dom";
import { FaMoon, FaSun, FaUserCircle } from "react-icons/fa";

export default function SiteHeader({ isDarkMode, onToggleDarkMode, isAuthenticated, username }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="header-left">
          <NavLink className="brand" to="/" aria-label="PokePalette home">
            <img
              className="brand-logo"
              src="/pokeball.png"
              alt="PokePalette logo"
            />
            <span className="brand-text">PokePalette</span>
          </NavLink>

          <button
            type="button"
            className={`dm-switch ${isDarkMode ? "on" : "off"}`}
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
            title={isDarkMode ? "Dark mode enabled" : "Light mode enabled"}
          >
            <span className="dm-switch-track">
              <span className="dm-switch-thumb">
                {isDarkMode ? <FaMoon className="dm-icon" aria-hidden="true" /> : <FaSun className="dm-icon" aria-hidden="true" />}
              </span>
            </span>
          </button>
        </div>

        <nav className="nav" aria-label="Primary navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/themes">My Themes</NavLink>

          <NavLink to="/login" className="account-link">
            <FaUserCircle className="user-icon" aria-hidden="true" />
            <span className="account-text">
              {isAuthenticated ? `Logged in as: ${username}` : "Log in"}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
