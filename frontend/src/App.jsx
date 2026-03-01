import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SiteHeader from "./components/SiteHeader.jsx";
import HomePage from "./pages/HomePage.jsx";
import ThemesPage from "./pages/ThemesPage.jsx";

import { INITIAL_THEMES, POKEMON } from "./data/mockData.js";

function hexToRgba(hex, a) {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function makeThemeFromPokemon(p) {
  return {
    id: `t_${crypto.randomUUID()}`,
    pokemonKey: p.key,
    pokemonName: p.name,
    types: p.types,
    dex: p.dex,
    imageSrc: p.imageSrc,
    isFavorite: true,
    palette: p.palette,
  };
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [themes, setThemes] = useState(INITIAL_THEMES);

  const [searchText, setSearchText] = useState("Pikachu");
  const [currentPokemonKey, setCurrentPokemonKey] = useState("pikachu");
  const currentPokemon = useMemo(
    () => POKEMON.find((p) => p.key === currentPokemonKey) || POKEMON[0],
    [currentPokemonKey],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--bloom-1-color",
      hexToRgba(currentPokemon.palette.primary, 0.22),
    );
    root.style.setProperty(
      "--bloom-2-color",
      hexToRgba(currentPokemon.palette.accent, 0.16),
    );
  }, [currentPokemon]);

  useEffect(() => {
    document.body.classList.toggle("theme-dark", isDarkMode);
    document.body.classList.toggle("theme-light", !isDarkMode);
  }, [isDarkMode]);

  function generateTheme() {
    const normalized = searchText.trim().toLowerCase();

    const match =
      POKEMON.find((p) => p.name.toLowerCase() === normalized) ||
      POKEMON.find((p) => p.name.toLowerCase().includes(normalized)) ||
      POKEMON[0];

    setCurrentPokemonKey(match.key);
  }

  function toggleThemeFavorite(themeId, nextChecked) {
    setThemes((prev) =>
      prev.map((t) =>
        t.id === themeId ? { ...t, isFavorite: nextChecked } : t,
      ),
    );
  }

  function saveCurrentTheme() {
    setThemes((prev) => {
      const already = prev.some((t) => t.pokemonKey === currentPokemon.key);
      if (already) return prev;

      const newTheme = makeThemeFromPokemon(currentPokemon);
      return [newTheme, ...prev];
    });
  }

  function removeThemeByKey(pokemonKey) {
    setThemes((prev) => prev.filter((t) => t.pokemonKey !== pokemonKey));
  }

  return (
    <>
      <SiteHeader
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((v) => !v)}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              pokemon={currentPokemon}
              searchText={searchText}
              onSearchTextChange={setSearchText}
              onGenerate={generateTheme}
              onSave={saveCurrentTheme}
              onRemove={removeThemeByKey}
              themes={themes}
            />
          }
        />
        <Route
          path="/themes"
          element={
            <ThemesPage
              themes={themes}
              onToggleFavorite={toggleThemeFavorite}
              onRemove={removeThemeByKey}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
