// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://note-v2.pages.dev",
  "https://note.brid.bd",
];

const corsOptions: Record<string, string> = {
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function getCorsHeaders(origin: string): Record<string, string> {
  const headers: Record<string, string> = { ...corsOptions };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const isPreflight = request.method === "OPTIONS";
  const headers = getCorsHeaders(origin);

  if (isPreflight) {
    return NextResponse.json({}, { headers });
  }

  const response = NextResponse.next();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
