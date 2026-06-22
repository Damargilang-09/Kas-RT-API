import jwt, { type SignOptions } from "jsonwebtoken";
import type { JwtPayload } from "../modules/Auth/auth.types";

type JwtExpiresIn = NonNullable<SignOptions["expiresIn"]>;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET belum diatur di environment variable");
  }

  return secret;
}

function getJwtExpiresIn(): JwtExpiresIn {
  return (process.env.JWT_EXPIRES_IN ?? "1d") as JwtExpiresIn;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}
