import React, { useMemo, useRef, useState } from "react";

export default function PokemonCard({
  pokemonName,
  typeLabel,
  dexNumber,
  imageSrc,
  options, // expects [{ key, name, dex }]
  value,
  onChange,
  onGenerate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [hadEdit, setHadEdit] = useState(false);
  const blurTimeout = useRef(null);

  const sorted = useMemo(
    () => [...options].sort((a, b) => a.dex - b.dex),
    [options],
  );

  const filtered = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.dex).includes(q.replace("#", "")),
    );
  }, [draft, sorted]);

  function openAndClear() {
    setIsOpen(true);
    setDraft("");
    setHadEdit(false);
  }

  function restoreIfUnchanged() {
    if (!hadEdit || draft.trim() === "") {
      setDraft(value);
    }
    setIsOpen(false);
  }

  return (
    <article className="panel pokemon-card">
      <div className="pokemon-card-inner">
        <h2 className="pokemon-title">{pokemonName}</h2>

        <img
          className="pokemon-image"
          src={imageSrc}
          alt={`${pokemonName} artwork`}
        />

        <p className="pokemon-meta muted">
          {typeLabel} • {dexNumber}
        </p>

        <hr className="pokemon-divider" />

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            onGenerate?.();
          }}
        >
          <label htmlFor="pokemon-search">Search Pokémon</label>

          <div className="combo">
            <input
              id="pokemon-search"
              name="pokemon"
              type="text"
              className="fat-input"
              placeholder="Start typing…"
              value={draft}
              onFocus={() => {
                if (blurTimeout.current) clearTimeout(blurTimeout.current);
                openAndClear();
              }}
              onBlur={() => {
                blurTimeout.current = setTimeout(
                  () => restoreIfUnchanged(),
                  120,
                );
              }}
              onChange={(e) => {
                setDraft(e.target.value);
                setHadEdit(true);
                setIsOpen(true);
              }}
              aria-autocomplete="list"
              aria-expanded={isOpen}
              autoComplete="off"
            />

            {isOpen && (
              <div
                className="combo-menu"
                role="listbox"
                aria-label="Pokémon options"
              >
                {filtered.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className="combo-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setDraft(p.name);
                      setHadEdit(true);
                      onChange?.(p.name); // commit selection
                      setIsOpen(false);
                    }}
                  >
                    <span className="combo-dex">
                      #{String(p.dex).padStart(3, "0")}
                    </span>
                    <span className="combo-name">{p.name}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="combo-empty">No matches</div>
                )}
              </div>
            )}
          </div>

          <button className="btn-primary" type="submit">
            Generate theme
          </button>
        </form>
      </div>
    </article>
  );
}
