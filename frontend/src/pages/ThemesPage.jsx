import React, { useMemo, useState } from "react";
import FiltersPanel from "../components/FiltersPanel.jsx";
import ThemeCard from "../components/ThemeCard.jsx";

export default function ThemesPage({ themes, onRemove }) {
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
                // if user unlikes it, remove from My Themes
                if (!next) onRemove?.(t.pokemonKey);
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
