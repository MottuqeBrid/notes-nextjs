import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { authenticate } from "@/middleware/userMiddleware";
import File from "@/models/fileModel";
import "@/models/noteModel";
import User from "@/models/userModel";
import { Types } from "mongoose";
import type { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const { id } = await params;
    const file = await File.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );
    if (!file) {
      return Response.json(
        { success: false, message: "File not found" },
        { status: 404 },
      );
    }
    await saveDeviceData(request, admin._id as Types.ObjectId, [
      "DELETE",
      "admin" + admin._id,
      "file:" + id,
    ]);
    return Response.json({
      message: "File deleted successfully",
      success: true,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Internal server error", error },
      { status: 500 },
    );
  }
}
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const { id } = await params;
    const body = await request.json();
    const file = await File.findByIdAndUpdate(id, { ...body }, { new: true });
    if (!file) {
      return Response.json(
        { success: false, message: "File not found" },
        { status: 404 },
      );
    }
    await saveDeviceData(request, admin._id as Types.ObjectId, [
      "PATCH",
      "admin" + admin._id,
      "file:" + id,
    ]);
    return Response.json({
      message: !body.isDeleted
        ? "File Restored successfully"
        : "File updated successfully",
      success: true,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Internal server error", error },
      { status: 500 },
    );
  }
}
