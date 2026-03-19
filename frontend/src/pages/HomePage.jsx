import React, { useMemo } from "react";
import FavoriteToggle from "../components/FavoriteToggle.jsx";
import PokemonCard from "../components/PokemonCard.jsx";
import SwatchList from "../components/SwatchList.jsx";
import ThemePreview from "../components/ThemePreview.jsx";
import { toSwatches } from "../data/themeUtils.js";

export default function HomePage({
  pokemon,
  pokemonOptions,
  searchText,
  onSearchTextChange,
  onGenerate,
  onSave,
  onRemove,
  isAuthenticated,
  themes,
}) {
  const options = useMemo(
    () => pokemonOptions.map((entry) => ({ key: entry.key, name: entry.name, dex: entry.dex })),
    [pokemonOptions],
  );

  if (!pokemon) {
    return (
      <main id="main" className="container home-page">
        <section className="panel status-panel">
          <h1>No Pokemon found</h1>
          <p className="muted">The server did not return Pokemon data.</p>
        </section>
      </main>
    );
  }

  const swatches = toSwatches(pokemon.palette);
  const isSaved = themes?.some((theme) => theme.pokemonKey === pokemon.key) ?? false;

  const themeVars = {
    "--theme-bg": pokemon.palette.bg,
    "--theme-primary": pokemon.palette.primary,
    "--theme-accent": pokemon.palette.accent,
    "--theme-text": pokemon.palette.text,
    "--theme-primary-ink": pokemon.palette.text,
    "--theme-accent-ink": pokemon.palette.bg,
  };

  return (
    <main id="main" className="container home-page">
      <section className="page-head">
        <h1>Generate a theme</h1>
        <p className="muted">Choose a Pokemon to generate a color palette.</p>
      </section>

      <section className="grid home-grid" style={themeVars} aria-label="Generated theme output">
        <PokemonCard
          pokemonName={pokemon.name}
          typeLabel={pokemon.types ? pokemon.types.join(" / ") : pokemon.type}
          dexNumber={`#${String(pokemon.dex).padStart(3, "0")}`}
          imageSrc={pokemon.imageSrc}
          options={options}
          value={searchText}
          onChange={onSearchTextChange}
          onGenerate={() => onGenerate?.()}
        />

        <article className="panel swatch-panel">
          <div className="panel-top">
            <h2>Theme swatches</h2>
            <FavoriteToggle
              checked={isSaved}
              disabled={!isAuthenticated}
              title={!isAuthenticated ? "Log in to save themes." : ""}
              onChange={(next) => {
                if (!isAuthenticated) {
                  return;
                }
                if (next) {
                  onSave?.();
                } else {
                  onRemove?.(pokemon.key);
                }
              }}
              ariaLabel="Toggle theme in My Themes"
            />
          </div>

          <SwatchList swatches={swatches} />

          <ThemePreview palette={pokemon.palette} />
        </article>
      </section>
    </main>
  );
}
