import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { Types } from "mongoose";
import { NextRequest } from "next/server";
import path from "path";
import { NextResponse } from "next/server";
import fs from "fs";

export async function GET(request: NextRequest) {
  const filePath = path.join(process.cwd(), "files", "index.html");
  // Read the file contents
  const htmlContent = fs.readFileSync(filePath, "utf8");

  await saveDeviceData(request, new Types.ObjectId(), ["test", "GET"]);
  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
}

export async function POST(request: NextRequest) {
  await connectDB();
  await saveDeviceData(request, new Types.ObjectId(), ["test", "POST"]);
  return Response.json({
    message: "Note created successfully",
    success: true,
  });
}
