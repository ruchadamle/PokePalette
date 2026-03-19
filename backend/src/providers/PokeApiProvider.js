import { getPokeApiCollection } from "../mongo.js";
import { getEnvVar } from "../getEnvVar.js";
import { generateWebsitePaletteFromImage } from "./paletteGenerator.js";
import {
  getGenerationVBlackWhiteSpriteAbsolutePath,
  getGenerationVBlackWhiteSpriteRelativePath,
  hasGenerationVBlackWhiteSprite,
} from "../spritePaths.js";

const DEFAULT_POKEMON_KEYS = ["pikachu", "charmander", "bulbasaur", "squirtle", "joltik"];
const PALETTE_VERSION = 2;
const SPRITE_VERSION = "gen-v-black-white-local-v2";
const DEFAULT_BACKEND_ASSET_BASE_URL = `http://localhost:${Number.parseInt(getEnvVar("PORT", false), 10) || 3000}`;
const BACKEND_ASSET_BASE_URL = (getEnvVar("BACKEND_ASSET_BASE_URL", false) ?? DEFAULT_BACKEND_ASSET_BASE_URL)
  .trim()
  .replace(/\/+$/, "");

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
    const dex = readDexNumberFromPayload(payload);
    const types = readTypesFromPayload(payload);

    const sprite = getPreferredSprite(payload);
    const palette = await generateWebsitePaletteFromImage(sprite.paletteSource);

    const pokemon = {
      key: payload.name,
      name: capitalize(payload.name),
      types,
      dex,
      imageSrc: sprite.publicUrl,
      spriteVersion: SPRITE_VERSION,
      palette,
      paletteVersion: PALETTE_VERSION,
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
    spriteVersion: document.spriteVersion ?? null,
    palette: document.palette,
    paletteVersion: document.paletteVersion ?? null,
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
    && document.spriteVersion === SPRITE_VERSION
    && typeof document.palette === "object"
    && document.palette
    && document.paletteVersion === PALETTE_VERSION
  );
}

function getPreferredSprite(payload) {
  const dex = readDexNumberFromPayload(payload);
  const localRelativePath = getGenerationVBlackWhiteSpriteRelativePath(dex);
  const localFilePath = getGenerationVBlackWhiteSpriteAbsolutePath(dex);
  const remoteFallback = payload.sprites?.versions?.["generation-v"]?.["black-white"]?.front_default
    || payload.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default
    || payload.sprites?.front_default
    || payload.sprites?.other?.["official-artwork"]?.front_default
    || "";

  if (hasGenerationVBlackWhiteSprite(dex)) {
    return {
      publicUrl: `${BACKEND_ASSET_BASE_URL}${localRelativePath}`,
      paletteSource: localFilePath,
    };
  }

  return {
    publicUrl: remoteFallback,
    paletteSource: remoteFallback,
  };
}

function readDexNumberFromPayload(payload) {
  const dex = Number(payload?.id);
  if (!Number.isInteger(dex) || dex <= 0) {
    throw new Error("PokeAPI payload is missing a valid dex number.");
  }
  return dex;
}

function readTypesFromPayload(payload) {
  if (!Array.isArray(payload?.types) || payload.types.length === 0) {
    throw new Error("PokeAPI payload is missing Pokemon types.");
  }

  const types = payload.types
    .slice()
    .sort((a, b) => (Number(a?.slot) || 0) - (Number(b?.slot) || 0))
    .map((entry) => capitalize(entry?.type?.name ?? ""))
    .filter(Boolean);

  if (types.length === 0) {
    throw new Error("PokeAPI payload contains invalid Pokemon types.");
  }

  return types;
}

function capitalize(value) {
  if (!value) {
    return "";
  }
  return value[0].toUpperCase() + value.slice(1);
}
