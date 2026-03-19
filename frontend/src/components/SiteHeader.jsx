import React from "react";
import { NavLink } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
const ASSET_BASE_URL = configuredApiBaseUrl ? configuredApiBaseUrl.replace(/\/+$/, "") : "http://localhost:3000";

const POKEBALL_SRC = `${ASSET_BASE_URL}/sprites/items/poke-ball.png`;
const SOLROCK_SRC = `${ASSET_BASE_URL}/sprites/pokemon/versions/generation-v/black-white/338.png`;
const LUNATONE_SRC = `${ASSET_BASE_URL}/sprites/pokemon/versions/generation-v/black-white/337.png`;

export default function SiteHeader({ isDarkMode, onToggleDarkMode, isAuthenticated, username }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="header-left">
          <NavLink className="brand" to="/" aria-label="PokePalette home">
            <img className="brand-logo" src={POKEBALL_SRC} alt="" aria-hidden="true" />
            <span className="brand-text">PokePalette</span>
          </NavLink>

          <div className="dm-toggle-wrap">
            <button
              type="button"
              className="dm-image-toggle"
              onClick={onToggleDarkMode}
              aria-label={isDarkMode ? "Toggle light mode" : "Toggle dark mode"}
              title={isDarkMode ? "Toggle light mode" : "Toggle dark mode"}
            >
              <img
                className="dm-toggle-image"
                src={isDarkMode ? LUNATONE_SRC : SOLROCK_SRC}
                alt=""
                aria-hidden="true"
              />
            </button>
            <span className="dm-toggle-text">
              {isDarkMode ? "Toggle light mode" : "Toggle dark mode"}
            </span>
          </div>
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
