// lib/jwt.ts
import jsonwebtoken, { JwtPayload, SignOptions } from "jsonwebtoken";
import { Schema, Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env.local");
}

export interface TokenPayload extends JwtPayload {
  id: Schema.Types.ObjectId | string | Types.ObjectId;
  role?: string;
}

// Generic type যোগ করা হয়েছে
export function generateToken<T extends object>(user: T): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d",
  };
  return jsonwebtoken.sign(user, JWT_SECRET!, options);
}

export function verifyToken(token: string): TokenPayload {
  return jsonwebtoken.verify(token, JWT_SECRET!) as TokenPayload;
}

export function decodeToken(token: string): TokenPayload | null {
  return jsonwebtoken.decode(token) as TokenPayload | null;
}

export function isTokenValid(token: string): boolean {
  try {
    jsonwebtoken.verify(token, JWT_SECRET!);
    return true;
  } catch {
    return false;
  }
}
