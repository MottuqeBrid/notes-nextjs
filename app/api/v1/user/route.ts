import { connectDB } from "@/lib/mongoose";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
  } catch (error) {
    
  }
}
