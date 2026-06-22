import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDevicedata";
import { Types } from "mongoose";
import { NextRequest } from "next/server";

export async function GET() {
  return Response.json({ message: "Hello World" });
}

export async function POST(request: NextRequest) {
  await connectDB();
  await saveDeviceData(request, new Types.ObjectId(), ["test"]);
  return Response.json({ message: "Hello World" });
}
