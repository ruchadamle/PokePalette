import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { createTheme, deleteTheme, fetchPokemon, fetchThemes } from "./api/themeApi.js";
import SiteHeader from "./components/SiteHeader.jsx";
import HomePage from "./pages/HomePage.jsx";
import ThemesPage from "./pages/ThemesPage.jsx";
import { hexToRgba } from "./data/themeUtils.js";

const DEFAULT_USER_ID = (import.meta.env.VITE_USER_ID ?? "").trim() || "demo-user";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [pokemonList, setPokemonList] = useState([]);
  const [themes, setThemes] = useState([]);
  const [searchText, setSearchText] = useState("Pikachu");
  const [currentPokemonKey, setCurrentPokemonKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isMutatingTheme, setIsMutatingTheme] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const currentPokemon = useMemo(
    () => pokemonList.find((pokemon) => pokemon.key === currentPokemonKey) || pokemonList[0] || null,
    [currentPokemonKey, pokemonList],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setIsLoading(true);
      setLoadError("");

      try {
        const [pokemon, savedThemes] = await Promise.all([
          fetchPokemon(),
          fetchThemes(DEFAULT_USER_ID),
        ]);

        if (cancelled) {
          return;
        }

        setPokemonList(pokemon);
        setThemes(savedThemes);

        const initialPokemon = pokemon.find((entry) => entry.key === "pikachu") || pokemon[0] || null;
        setCurrentPokemonKey(initialPokemon?.key ?? "");
        setSearchText(initialPokemon?.name ?? "");
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message || "Could not load data from server.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useEffect(() => {
    if (!currentPokemon) {
      return;
    }

    const root = document.documentElement;
    root.style.setProperty("--bloom-1-color", hexToRgba(currentPokemon.palette.primary, 0.22));
    root.style.setProperty("--bloom-2-color", hexToRgba(currentPokemon.palette.accent, 0.16));
  }, [currentPokemon]);

  useEffect(() => {
    document.body.classList.toggle("theme-dark", isDarkMode);
    document.body.classList.toggle("theme-light", !isDarkMode);
  }, [isDarkMode]);

  function generateTheme() {
    if (pokemonList.length === 0) {
      return;
    }

    const normalized = searchText.trim().toLowerCase();
    const matchedPokemon = pokemonList.find((pokemon) => pokemon.name.toLowerCase() === normalized)
      || pokemonList.find((pokemon) => pokemon.name.toLowerCase().includes(normalized))
      || pokemonList[0];

    setCurrentPokemonKey(matchedPokemon.key);
    setSearchText(matchedPokemon.name);
  }

  async function saveCurrentTheme() {
    if (!currentPokemon) {
      return;
    }

    const alreadySaved = themes.some((theme) => theme.pokemonKey === currentPokemon.key);
    if (alreadySaved) {
      return;
    }

    setActionError("");
    setIsMutatingTheme(true);
    try {
      const createdTheme = await createTheme(DEFAULT_USER_ID, currentPokemon.key);
      setThemes((prevThemes) => [createdTheme, ...prevThemes]);
    } catch (error) {
      if (error.status === 409 && error.payload?.theme) {
        const existingTheme = error.payload.theme;
        setThemes((prevThemes) => [
          existingTheme,
          ...prevThemes.filter((theme) => theme.pokemonKey !== existingTheme.pokemonKey),
        ]);
        return;
      }
      setActionError(error.message || "Could not save theme.");
    } finally {
      setIsMutatingTheme(false);
    }
  }

  async function removeThemeByKey(pokemonKey) {
    setActionError("");
    setIsMutatingTheme(true);
    try {
      await deleteTheme(DEFAULT_USER_ID, pokemonKey);
      setThemes((prevThemes) => prevThemes.filter((theme) => theme.pokemonKey !== pokemonKey));
    } catch (error) {
      if (error.status === 404) {
        setThemes((prevThemes) => prevThemes.filter((theme) => theme.pokemonKey !== pokemonKey));
        return;
      }
      setActionError(error.message || "Could not remove theme.");
    } finally {
      setIsMutatingTheme(false);
    }
  }

  return (
    <>
      <SiteHeader
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((value) => !value)}
      />

      {isLoading ? (
        <main id="main" className="container">
          <section className="panel status-panel" role="status" aria-live="polite">
            <h1>Loading...</h1>
            <p className="muted">Fetching Pokemon and saved themes from the server.</p>
          </section>
        </main>
      ) : loadError ? (
        <main id="main" className="container">
          <section className="panel status-panel status-error" role="alert">
            <h1>Could not load data</h1>
            <p>{loadError}</p>
            <button className="btn-primary" type="button" onClick={() => setReloadToken((count) => count + 1)}>
              Retry
            </button>
          </section>
        </main>
      ) : (
        <>
          {actionError && (
            <section className="container status-inline-wrap" role="alert">
              <p className="status-inline-error">{actionError}</p>
            </section>
          )}

          <Routes>
            <Route
              path="/"
              element={(
                <HomePage
                  pokemon={currentPokemon}
                  pokemonOptions={pokemonList}
                  searchText={searchText}
                  onSearchTextChange={setSearchText}
                  onGenerate={generateTheme}
                  onSave={saveCurrentTheme}
                  onRemove={removeThemeByKey}
                  isSavingTheme={isMutatingTheme}
                  themes={themes}
                />
              )}
            />
            <Route
              path="/themes"
              element={(
                <ThemesPage
                  themes={themes}
                  onRemove={removeThemeByKey}
                />
              )}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      )}
    </>
  );
}
