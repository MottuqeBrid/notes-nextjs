import { connectDB } from "@/lib/mongoose";
import User from "@/models/userModel";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await User.find();
    return Response.json({ message: "Hello World", success: true, user });
  } catch (error) {
    return Response.json(
      { error: "Failed to connect to database" },
      { status: 500 },
    );
  }
}
