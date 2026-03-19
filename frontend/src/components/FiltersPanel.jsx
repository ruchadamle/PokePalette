import React, { useId, useMemo } from "react";

export default function FiltersPanel({
  sort,
  type,
  onSortChange,
  onTypeChange,
  themes,
}) {
  const sortId = useId();
  const typeId = useId();

  // Derive unique types from existing themes.
  const types = useMemo(() => {
    const unique = new Set(themes.flatMap((t) => t.types));
    return ["All", ...Array.from(unique).sort()];
  }, [themes]);

  return (
    <section className="panel">
      <h2>Filters</h2>

      <form className="filters" onSubmit={(event) => event.preventDefault()}>
        <div className="filter-item">
          <label htmlFor={sortId}>Sort</label>
          <select
            id={sortId}
            value={sort}
            onChange={(event) => onSortChange?.(event.target.value)}
          >
            <option>Most recent</option>
            <option>Alphabetical</option>
            <option>Pokedex number</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor={typeId}>Type</label>
          <select
            id={typeId}
            value={type}
            onChange={(event) => onTypeChange?.(event.target.value)}
          >
            {types.map((entryType) => (
              <option key={entryType}>{entryType}</option>
            ))}
          </select>
        </div>
      </form>
    </section>
  );
}
