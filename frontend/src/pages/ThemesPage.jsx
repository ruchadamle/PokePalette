import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FiltersPanel from "../components/FiltersPanel.jsx";
import ThemeCard from "../components/ThemeCard.jsx";

export default function ThemesPage({ themes, onRemove, isAuthenticated }) {
  const [sort, setSort] = useState("Most recent");
  const [type, setType] = useState("All");

  const filtered = useMemo(() => {
    let values = [...themes];

    if (type !== "All") {
      values = values.filter((theme) => theme.types.includes(type));
    }

    if (sort === "Alphabetical") {
      values.sort((left, right) => left.pokemonName.localeCompare(right.pokemonName));
    } else if (sort === "Pokedex number") {
      values.sort((left, right) => left.dex - right.dex);
    }

    return values;
  }, [themes, sort, type]);

  return (
    <main id="main" className="container themes-page">
      <section className="page-head">
        <h1>My Themes</h1>
      </section>

      {!isAuthenticated && (
        <section className="panel status-panel">
          <p>
            <Link to="/login">Log in</Link> to view and manage saved themes.
          </p>
        </section>
      )}

      {isAuthenticated && (
        <>
          <FiltersPanel
            sort={sort}
            type={type}
            onSortChange={setSort}
            onTypeChange={setType}
            themes={themes}
          />

          <section aria-label="Saved themes">
            <div className="theme-grid">
              {filtered.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  onToggleFavorite={(next) => {
                    if (!next) {
                      onRemove?.(theme.pokemonKey);
                    }
                  }}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
