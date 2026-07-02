import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { authenticate } from "@/middleware/userMiddleware";
import Note from "@/models/noteModel";
import User from "@/models/userModel";
import { Types } from "mongoose";
import type { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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
    const note = await Note.findByIdAndUpdate(id, { isDeleted: true });
    if (!note) {
      return Response.json(
        { success: false, message: "Note not found" },
        { status: 404 },
      );
    }
    await saveDeviceData(request, admin._id as Types.ObjectId, [
      "DELETE",
      "admin" + admin._id,
      "note:" + id,
    ]);
    return Response.json({
      message: "Note deleted successfully",
      success: true,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Internal server error", error },
      { status: 500 },
    );
  }
}
