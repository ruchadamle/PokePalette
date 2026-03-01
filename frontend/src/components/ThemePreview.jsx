import React from "react";

export default function ThemePreview({ palette }) {
  const styleVars = palette
    ? {
        "--theme-bg": palette.bg,
        "--theme-primary": palette.primary,
        "--theme-accent": palette.accent,
        "--theme-text": palette.text,
        "--theme-primary-ink": palette.text,
        "--theme-accent-ink": palette.bg,
      }
    : undefined;

  return (
    <section className="preview">
      <h2>Preview</h2>
      <div className="preview-mock">
        <div
          className="preview-site"
          style={styleVars}
          aria-label="Theme preview"
        >
          <header className="preview-site-header">
            <span className="preview-brand">Preview Site</span>
            <nav className="preview-links" aria-label="Preview navigation">
              <a href="#">Nav</a>
              <a href="#">Link</a>
            </nav>
          </header>

          <main className="preview-site-main">
            <h4 className="preview-title">I'm a title!</h4>
            <p className="preview-text">I'm sample text!</p>
            <button className="preview-cta" type="button">
              I'm a button!
            </button>
          </main>
        </div>
      </div>
    </section>
  );
}
