import React from "react";

export default function SwatchList({ swatches, titleLevel = "h3" }) {
  const TitleTag = titleLevel;

  return (
    <div className="swatches">
      {swatches.map((s) => (
        <div className="swatch" key={s.role}>
          {s.tokenClass ? (
            <span className={`chip ${s.tokenClass}`} />
          ) : (
            <span className="chip" style={s.chipStyle} />
          )}

          <div>
            <TitleTag
              className={TitleTag === "h4" ? "swatch-title" : undefined}
            >
              {s.role}
            </TitleTag>
            <p className={TitleTag === "h4" ? "muted" : undefined}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
