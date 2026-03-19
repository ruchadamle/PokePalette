import cors from "cors";
import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { closeMongo, connectToMongo, getThemesCollection } from "./mongo.js";
import { getPokemonByKey, POKEMON_CATALOG } from "./pokemonCatalog.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const configuredOrigins = (getEnvVar("FRONTEND_ORIGIN", false) ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();
app.use(cors(configuredOrigins.length > 0 ? { origin: configuredOrigins } : undefined));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/pokemon", (req, res) => {
  res.json({ pokemon: POKEMON_CATALOG });
});

app.get("/api/users/:userId/themes", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!isValidUserId(userId)) {
      return res.status(400).json({ error: "userId must be 1-64 chars using only letters, numbers, _ or -." });
    }

    const themes = await getThemesCollection().find({ userId }).sort({ createdAt: -1 }).toArray();
    return res.json({ themes: themes.map(formatThemeDocument) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/users/:userId/themes", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!isValidUserId(userId)) {
      return res.status(400).json({ error: "userId must be 1-64 chars using only letters, numbers, _ or -." });
    }

    const pokemonKey = normalizePokemonKey(req.body?.pokemonKey);
    if (!pokemonKey) {
      return res.status(400).json({ error: "pokemonKey is required." });
    }

    const pokemon = getPokemonByKey(pokemonKey);
    if (!pokemon) {
      return res.status(404).json({ error: "Unknown pokemon key." });
    }

    const now = new Date();
    const themeToInsert = {
      userId,
      pokemonKey: pokemon.key,
      pokemonName: pokemon.name,
      types: pokemon.types,
      dex: pokemon.dex,
      imageSrc: pokemon.imageSrc,
      isFavorite: true,
      palette: pokemon.palette,
      createdAt: now,
      updatedAt: now,
    };

    const collection = getThemesCollection();

    try {
      const insertResult = await collection.insertOne(themeToInsert);
      const createdTheme = await collection.findOne({ _id: insertResult.insertedId });
      return res.status(201).json({ theme: formatThemeDocument(createdTheme) });
    } catch (error) {
      if (error?.code === 11000) {
        const existingTheme = await collection.findOne({ userId, pokemonKey: pokemon.key });
        return res.status(409).json({
          error: "Theme already exists for this user.",
          theme: formatThemeDocument(existingTheme),
        });
      }
      throw error;
    }
  } catch (error) {
    return next(error);
  }
});

app.delete("/api/users/:userId/themes/:pokemonKey", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!isValidUserId(userId)) {
      return res.status(400).json({ error: "userId must be 1-64 chars using only letters, numbers, _ or -." });
    }

    const pokemonKey = normalizePokemonKey(req.params.pokemonKey);
    if (!pokemonKey) {
      return res.status(400).json({ error: "pokemonKey is required." });
    }

    const deleteResult = await getThemesCollection().deleteOne({ userId, pokemonKey });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: "Theme not found." });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.use((error, req, res, next) => {
  console.error("Unhandled server error", error);
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).json({ error: "Internal server error." });
});

let server = null;

async function start() {
  await connectToMongo();
  server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}. CTRL+C to stop.`);
  });
}

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down.`);
  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }
  await closeMongo();
  process.exit(0);
}

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((error) => {
    console.error("Error while shutting down", error);
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((error) => {
    console.error("Error while shutting down", error);
    process.exit(1);
  });
});

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

function normalizePokemonKey(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
}

function isValidUserId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(value);
}

function formatThemeDocument(theme) {
  if (!theme) {
    return null;
  }

  return {
    id: theme._id.toString(),
    pokemonKey: theme.pokemonKey,
    pokemonName: theme.pokemonName,
    types: theme.types,
    dex: theme.dex,
    imageSrc: theme.imageSrc,
    isFavorite: Boolean(theme.isFavorite),
    palette: theme.palette,
    createdAt: theme.createdAt instanceof Date ? theme.createdAt.toISOString() : theme.createdAt,
    updatedAt: theme.updatedAt instanceof Date ? theme.updatedAt.toISOString() : theme.updatedAt,
  };
}
