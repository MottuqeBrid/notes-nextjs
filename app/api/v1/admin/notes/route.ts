import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { authenticate } from "@/middleware/userMiddleware";
import Note from "@/models/noteModel";
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

    const notes = await Note.find().populate("user", "name email");
    await saveDeviceData(request, admin._id as Types.ObjectId, [
      "admin",
      "GET",
      "admin:" + payload.id,
      "total notes:" + notes.length,
    ]);
    return Response.json({
      message: "All notes retrieved successfully",
      success: true,
      notes,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to connect to database", error },
      { status: 500 },
    );
  }
}
