import React, { useMemo } from "react";
import FavoriteToggle from "./FavoriteToggle.jsx";
import SwatchList from "./SwatchList.jsx";
import { toSwatches } from "../data/themeUtils.js";

export default function ThemeCard({ theme, onToggleFavorite }) {
  const swatches = useMemo(() => toSwatches(theme.palette), [theme.palette]);

  // Make each card control its own theme vars (so heart color can match this theme)
  const themeVars = {
    "--theme-bg": theme.palette.bg,
    "--theme-primary": theme.palette.primary,
    "--theme-accent": theme.palette.accent,
    "--theme-text": theme.palette.text,
    "--theme-primary-ink": theme.palette.text,
    "--theme-accent-ink": theme.palette.bg,
  };

  return (
    <article className="theme-card" style={themeVars}>
      <header className="theme-head">
        <img
          className="sprite-img"
          src={theme.imageSrc}
          alt={`${theme.pokemonName} artwork`}
        />

        <div>
          <h3>{theme.pokemonName}</h3>
          <p className="muted">
            {theme.types.join(" / ")} • #{String(theme.dex).padStart(3, "0")}
          </p>
        </div>

        <FavoriteToggle
          size="small"
          checked={theme.isFavorite}
          onChange={(next) => onToggleFavorite?.(next)}
          ariaLabel={`Toggle favorite for ${theme.pokemonName}`}
        />
      </header>

      <div className="theme-swatches" aria-label="Theme colors">
        <SwatchList swatches={swatches} titleLevel="h4" />
      </div>
    </article>
  );
}
