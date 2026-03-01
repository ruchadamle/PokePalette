import React, { useMemo } from "react";
import PokemonCard from "../components/PokemonCard.jsx";
import FavoriteToggle from "../components/FavoriteToggle.jsx";
import SwatchList from "../components/SwatchList.jsx";
import ThemePreview from "../components/ThemePreview.jsx";
import { POKEMON, toSwatches } from "../data/mockData.js";

export default function HomePage({
  pokemon, // current selected Pokemon object from App state
  searchText, // string in App state
  onSearchTextChange, // setter from App state
  onGenerate, // handler from App state
  onSave, // adds current Pokemon to themes (no duplicates)
  onRemove, // removes by pokemonKey
  themes, // themes array from App state
}) {
  const options = useMemo(
    () => POKEMON.map((p) => ({ key: p.key, name: p.name, dex: p.dex })),
    [],
  );

  const swatches = useMemo(() => toSwatches(pokemon.palette), [pokemon]);

  // heart reflects whether this pokemon is currently saved
  const isSaved = themes?.some((t) => t.pokemonKey === pokemon.key) ?? false;

  // Apply generated palette as CSS variables so buttons + preview can match the theme
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
        <p className="muted">Choose a Pokémon to generate a color palette.</p>
      </section>

      <section
        className="grid home-grid"
        style={themeVars}
        aria-label="Generated theme output"
      >
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
              onChange={(next) => {
                if (next) onSave?.();
                else onRemove?.(pokemon.key);
              }}
              ariaLabel="Toggle theme in My Themes"
            />
          </div>

          <SwatchList swatches={swatches} />

          <div className="actions">
            <button className="btn-primary" type="button" onClick={onSave}>
              Save theme
            </button>
          </div>

          <ThemePreview palette={pokemon.palette} />
        </article>
      </section>
    </main>
  );
}
