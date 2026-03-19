import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";

export function verifyAuthToken(req, res, next) {
  const authHeader = req.get("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      error: "Unauthorized",
      message: "Missing auth token",
    });
  }

  const jwtSecret = getEnvVar("JWT_SECRET", false);
  if (!jwtSecret) {
    return res.status(500).send({
      error: "Server error",
      message: "JWT secret is not configured",
    });
  }

  return jwt.verify(token, jwtSecret, (error, decodedToken) => {
    if (decodedToken) {
      req.userInfo = decodedToken;
      return next();
    }

    return res.status(401).send({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  });
}
