import { getPokeApiCollection } from "../mongo.js";

const DEFAULT_POKEMON_KEYS = ["pikachu", "charmander", "bulbasaur", "squirtle", "joltik"];

const TYPE_COLORS = {
  bug: { bg: "#EEF8D3", primary: "#8BC34A", accent: "#2C4020", text: "#1D2A17" },
  electric: { bg: "#FFF9DC", primary: "#F2C94C", accent: "#6B4E16", text: "#2F2412" },
  fire: { bg: "#FFE3D6", primary: "#FF6A2A", accent: "#2E1B14", text: "#1A1A1A" },
  grass: { bg: "#DFF7E6", primary: "#2FAF64", accent: "#163022", text: "#1A1A1A" },
  poison: { bg: "#F1E4FF", primary: "#9B51E0", accent: "#2A173D", text: "#1A1322" },
  water: { bg: "#E3F2FF", primary: "#2D9CDB", accent: "#14324A", text: "#0F1A24" },
};

const DEFAULT_PALETTE = { bg: "#EDF2F7", primary: "#5A67D8", accent: "#1F2A44", text: "#111827" };

export class PokeApiProvider {
  async getPokemonCatalog() {
    const collection = getPokeApiCollection();
    const existing = (await collection.find({}).sort({ dex: 1 }).toArray())
      .filter(isUsablePokemonDocument)
      .map(formatPokemonDocument);
    if (existing.length >= DEFAULT_POKEMON_KEYS.length) {
      return existing;
    }

    await Promise.all(DEFAULT_POKEMON_KEYS.map((key) => this.fetchAndStorePokemon(key)));
    const refreshed = await collection.find({}).sort({ dex: 1 }).toArray();
    return refreshed.filter(isUsablePokemonDocument).map(formatPokemonDocument);
  }

  async getPokemonByKey(pokemonKey) {
    const normalizedKey = normalizePokemonKey(pokemonKey);
    if (!normalizedKey) {
      return null;
    }

    const collection = getPokeApiCollection();
    const existing = await collection.findOne({ key: normalizedKey });
    if (isUsablePokemonDocument(existing)) {
      return formatPokemonDocument(existing);
    }

    return this.fetchAndStorePokemon(normalizedKey);
  }

  async fetchAndStorePokemon(pokemonKey) {
    const normalizedKey = normalizePokemonKey(pokemonKey);
    if (!normalizedKey) {
      return null;
    }

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(normalizedKey)}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`PokeAPI request failed with status ${response.status}.`);
    }

    const payload = await response.json();
    const types = (payload.types ?? [])
      .sort((a, b) => a.slot - b.slot)
      .map((entry) => capitalize(entry.type?.name ?? ""));

    const primaryType = (payload.types?.[0]?.type?.name ?? "").toLowerCase();
    const pokemon = {
      key: payload.name,
      name: capitalize(payload.name),
      types,
      dex: payload.id,
      imageSrc:
        payload.sprites?.other?.["official-artwork"]?.front_default
        || payload.sprites?.front_default
        || "",
      palette: TYPE_COLORS[primaryType] ?? DEFAULT_PALETTE,
      updatedAt: new Date(),
    };

    const collection = getPokeApiCollection();
    await collection.updateOne(
      { key: pokemon.key },
      {
        $set: pokemon,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );

    return pokemon;
  }
}

function normalizePokemonKey(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
}

function formatPokemonDocument(document) {
  return {
    key: document.key,
    name: document.name,
    types: document.types,
    dex: document.dex,
    imageSrc: document.imageSrc,
    palette: document.palette,
  };
}

function isUsablePokemonDocument(document) {
  return Boolean(
    document
    && typeof document.key === "string"
    && typeof document.name === "string"
    && Array.isArray(document.types)
    && typeof document.dex === "number"
    && typeof document.imageSrc === "string"
    && document.imageSrc.length > 0
    && typeof document.palette === "object"
    && document.palette,
  );
}

function capitalize(value) {
  if (!value) {
    return "";
  }
  return value[0].toUpperCase() + value.slice(1);
}
