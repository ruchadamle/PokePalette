import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FiltersPanel from "../components/FiltersPanel.jsx";
import ThemeCard from "../components/ThemeCard.jsx";

export default function ThemesPage({ themes, onRemove, isAuthenticated }) {
  const [sort, setSort] = useState("Most recent");
  const [type, setType] = useState("All");

  const filtered = useMemo(() => {
    let arr = [...themes];

    if (type !== "All") {
      arr = arr.filter((t) => t.types.includes(type));
    }

    if (sort === "Alphabetical") {
      arr.sort((a, b) => a.pokemonName.localeCompare(b.pokemonName));
    } else if (sort === "Pokédex number") {
      arr.sort((a, b) => a.dex - b.dex);
    }

    return arr;
  }, [themes, sort, type]);

  return (
    <main id="main" className="container">
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
              {filtered.map((t) => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  onToggleFavorite={(next) => {
                    if (!next) {
                      onRemove?.(t.pokemonKey);
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
