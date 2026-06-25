import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { Types } from "mongoose";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // console.log("Request:", request);
  saveDeviceData(request, new Types.ObjectId(), ["test", "GET"]);
  return Response.json({
    message: "This Note API",
    request: JSON.stringify(request),
  });
}

export async function POST(request: NextRequest) {
  await connectDB();
  await saveDeviceData(request, new Types.ObjectId(), ["test", "POST"]);
  return Response.json({ message: "Hello World" });
}
