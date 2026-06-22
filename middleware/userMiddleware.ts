// lib/authMiddleware.ts
import { verifyToken, TokenPayload } from "@/lib/jwt";
import { NextRequest } from "next/server";

export function getTokenFromRequest(request: NextRequest): string | null {
  // Header থেকে token নাও
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // Cookie থেকে token নাও
  const cookieToken = request.cookies.get("token")?.value;
  if (cookieToken) return cookieToken;

  return null;
}

export async function authenticate(
  request: NextRequest,
): Promise<TokenPayload> {
  const token = await getTokenFromRequest(request);

  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    return verifyToken(token);
  } catch {
    throw new Error("Unauthorized");
  }
}
