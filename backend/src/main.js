import cors from "cors";
import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { closeMongo, connectToMongo } from "./mongo.js";
import { CredentialsProvider } from "./providers/CredentialsProvider.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
import { registerThemeRoutes } from "./routes/themeRoutes.js";
import { getSpriteStaticRootDir } from "./spritePaths.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const jwtSecret = (getEnvVar("JWT_SECRET", false) ?? "").trim();
const configuredOrigins = (getEnvVar("FRONTEND_ORIGIN", false) ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();
app.use(cors(configuredOrigins.length > 0 ? { origin: configuredOrigins } : undefined));
app.use(express.json());

app.use("/sprites", express.static(getSpriteStaticRootDir()));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const credentialsProvider = new CredentialsProvider();
registerAuthRoutes(app, credentialsProvider);
registerThemeRoutes(app);

app.use((error, req, res, next) => {
  console.error("Unhandled server error", error);
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).json({ error: "Internal server error." });
});

let server = null;

async function start() {
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing in backend/.env.");
  }

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
