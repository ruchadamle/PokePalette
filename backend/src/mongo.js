import { MongoClient } from "mongodb";
import { getEnvVar } from "./getEnvVar.js";

const mongoUser = (getEnvVar("MONGO_USER", false) ?? "").trim();
const mongoPassword = (getEnvVar("MONGO_PWD", false) ?? "").trim();
const mongoCluster = (getEnvVar("MONGO_CLUSTER", false) ?? "").trim();
const dbName = (getEnvVar("DB_NAME", false) ?? "").trim() || "pokepalette";
const usersCollectionName = (getEnvVar("USERS_COLLECTION_NAME", false) ?? "").trim() || "users";
const credsCollectionName = (getEnvVar("CREDS_COLLECTION_NAME", false) ?? "").trim() || "userCreds";
const pokeApiCollectionName = (getEnvVar("POKEAPI_COLLECTION_NAME", false) ?? "").trim() || "pokeapi";
const mongoUri = buildMongoUri();

let mongoClient = null;
let mongoDb = null;

export async function connectToMongo() {
  if (!mongoUri) {
    throw new Error(
      "Missing Mongo settings. Set MONGO_USER, MONGO_PWD, and MONGO_CLUSTER in backend/.env before starting the server.",
    );
  }

  mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  mongoDb = mongoClient.db(dbName);

  await mongoDb.collection("themes").createIndex({ userId: 1, pokemonKey: 1 }, { unique: true });
  await mongoDb.collection(credsCollectionName).createIndex({ username: 1 }, { unique: true });
  await mongoDb.collection(pokeApiCollectionName).createIndex({ key: 1 }, { unique: true });
}

export function getThemesCollection() {
  if (!mongoDb) {
    throw new Error("MongoDB is not connected yet.");
  }
  return mongoDb.collection("themes");
}

export function getUsersCollection() {
  if (!mongoDb) {
    throw new Error("MongoDB is not connected yet.");
  }
  return mongoDb.collection(usersCollectionName);
}

export function getUserCredsCollection() {
  if (!mongoDb) {
    throw new Error("MongoDB is not connected yet.");
  }
  return mongoDb.collection(credsCollectionName);
}

export function getPokeApiCollection() {
  if (!mongoDb) {
    throw new Error("MongoDB is not connected yet.");
  }
  return mongoDb.collection(pokeApiCollectionName);
}

export async function closeMongo() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
  }
}

function buildMongoUri() {
  if (!mongoUser || !mongoPassword || !mongoCluster) {
    return "";
  }

  const normalizedCluster = mongoCluster
    .replace(/^mongodb\+srv:\/\//, "")
    .replace(/^mongodb:\/\//, "")
    .replace(/\/+$/, "");

  return `mongodb+srv://${encodeURIComponent(mongoUser)}:${encodeURIComponent(mongoPassword)}@${normalizedCluster}/?retryWrites=true&w=majority`;
}
