import React from "react";

export default function PokemonLoader({ label = "Loading..." }) {
  return (
    <section className="pokeloader" role="status" aria-live="polite" aria-label={label}>
      <div className="pokeloader-wrapper">
        <div className="pokeloader-ball" aria-hidden="true" />
      </div>
      <p className="pokeloader-text">{label}</p>
    </section>
  );
}
