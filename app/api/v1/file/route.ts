import { connectDB } from "@/lib/mongoose";
import { NextRequest } from "next/server";

export async function GET() {
  return Response.json({ message: "Hello World" });
}

export async function POST(request: NextRequest) {
  await connectDB();
  return Response.json({ message: "Hello World" });
}
