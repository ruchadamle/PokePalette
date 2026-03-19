import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const BASE_DIR_CANDIDATES = [
  REPO_ROOT,
  path.join(REPO_ROOT, "backend"),
];
const PACKAGE_NAME_CANDIDATES = ["pokemon-sprites", "pokemonsprites"];
const GENERATION_V_BW_RELATIVE_PATH = path.join(
  "pokemon",
  "versions",
  "generation-v",
  "black-white",
);
let cachedGenerationVBlackWhiteDexNumbers = null;

export function getSpriteStaticRootDir() {
  for (const baseDir of BASE_DIR_CANDIDATES) {
    for (const packageName of PACKAGE_NAME_CANDIDATES) {
      const spritesRoot = path.join(baseDir, "node_modules", packageName, "sprites");
      if (existsSync(spritesRoot)) {
        return spritesRoot;
      }
    }
  }

  return path.join(REPO_ROOT, "node_modules", "pokemon-sprites", "sprites");
}

export function getGenerationVBlackWhiteSpriteDir() {
  return path.join(getSpriteStaticRootDir(), GENERATION_V_BW_RELATIVE_PATH);
}

export function getGenerationVBlackWhiteSpriteRelativePath(dex) {
  return `/sprites/pokemon/versions/generation-v/black-white/${dex}.png`;
}

export function hasGenerationVBlackWhiteSprite(dex) {
  if (!Number.isFinite(dex)) {
    return false;
  }

  const absolutePath = path.join(getGenerationVBlackWhiteSpriteDir(), `${dex}.png`);
  return existsSync(absolutePath);
}

export function getGenerationVBlackWhiteSpriteAbsolutePath(dex) {
  return path.join(getGenerationVBlackWhiteSpriteDir(), `${dex}.png`);
}

export function getGenerationVBlackWhiteSpriteDexNumbers() {
  if (Array.isArray(cachedGenerationVBlackWhiteDexNumbers)) {
    return cachedGenerationVBlackWhiteDexNumbers;
  }

  let fileNames = [];
  try {
    fileNames = readdirSync(getGenerationVBlackWhiteSpriteDir());
  } catch {
    cachedGenerationVBlackWhiteDexNumbers = [];
    return cachedGenerationVBlackWhiteDexNumbers;
  }

  const dexNumbers = [...new Set(fileNames
    .map((fileName) => {
      const match = /^(\d+)\.png$/i.exec(fileName);
      if (!match) {
        return null;
      }
      const dex = Number.parseInt(match[1], 10);
      return Number.isInteger(dex) && dex > 0 ? dex : null;
    })
    .filter((dex) => dex !== null))]
    .sort((left, right) => left - right);

  cachedGenerationVBlackWhiteDexNumbers = dexNumbers;
  return cachedGenerationVBlackWhiteDexNumbers;
}
