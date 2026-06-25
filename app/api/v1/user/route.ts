import { connectDB } from "@/lib/mongoose";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const mongo_url = process.env.MONGODB_URI;
    if (!mongo_url) {
      return Response.json(
        { error: "MONGO_URL is not defined" },
        { status: 500 },
      );
    }
    await connectDB();
    return Response.json({ message: "Hello World", mongo_url });
  } catch (error) {
    return Response.json(
      { error: "Failed to connect to database" },
      { status: 500 },
    );
  }
}
