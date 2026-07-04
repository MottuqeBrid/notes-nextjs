import { connectDB } from "@/lib/mongoose";
import { authenticate } from "@/middleware/userMiddleware";
import User from "@/models/userModel";
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

    const users = await User.find();
    return Response.json({
      message: "All users retrieved successfully",
      success: true,
      users,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to connect to database", error },
      { status: 500 },
    );
  }
}
