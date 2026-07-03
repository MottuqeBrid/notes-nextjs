import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { authenticate } from "@/middleware/userMiddleware";
import File from "@/models/fileModel";
import "@/models/noteModel";
import User from "@/models/userModel";
import { Types } from "mongoose";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (!payload) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    if (payload.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    await connectDB();
    const admin = await User.findById(payload.id);
    if (!admin) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    if (admin.role !== "admin" || admin.isDeleted || !admin.isVerified) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const files = await File.find().populate("owner", "name email");
    await saveDeviceData(request, admin._id as Types.ObjectId, [
      "admin",
      "GET",
      "admin:" + payload.id,
      "total files:" + files.length,
    ]);
    return Response.json({
      message: "All files retrieved successfully",
      success: true,
      files,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to connect to database", error },
      { status: 500 },
    );
  }
}
