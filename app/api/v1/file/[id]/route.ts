import { connectDB } from "@/lib/mongoose";
import { authenticate } from "@/middleware/userMiddleware";
import { NextRequest } from "next/server";
import { saveDeviceData } from "@/lib/saveDeviceData";
import User from "@/models/userModel";
import File from "@/models/fileModel";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: fileId } = await params;
    const payload = await authenticate(request);
    await connectDB();
    const user = await User.findById(payload.id)
      .select("-password")
      .populate("files");
    if (!user) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 },
      );
    }
    if (user.isDeleted) {
      return Response.json(
        { message: "User deleted", success: false },
        { status: 404 },
      );
    }
    const file = await File.findById(fileId);
    if (!file || file.isDeleted || !file.owner.equals(user._id)) {
      return Response.json(
        { message: "File not found", success: false },
        { status: 404 },
      );
    }
    await saveDeviceData(request, user._id, [
      "file",
      "GET",
      "user:" + user._id,
    ]);
    return Response.json({
      message: "File found",
      success: true,
      file,
    });
  } catch (error) {
    return Response.json(
      { error, message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: fileId } = await params;
    const payload = await authenticate(request);
    await connectDB();
    const user = await User.findById(payload.id)
      .select("-password")
      .populate("files");
    if (!user) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 },
      );
    }
    if (user.isDeleted) {
      return Response.json(
        { message: "User deleted", success: false },
        { status: 404 },
      );
    }
    const file = await File.findByIdAndUpdate(
      fileId,
      { isDeleted: true },
      { new: true },
    );
    if (!file || file.isDeleted || !file.owner.equals(user._id)) {
      return Response.json(
        { message: "File not found", success: false },
        { status: 404 },
      );
    }

    await saveDeviceData(request, user._id, [
      "file",
      "DELETE",
      "user:" + user._id,
    ]);
    return Response.json({
      message: "File deleted successfully",
      success: true,
    });
  } catch (error) {
    return Response.json(
      { error, message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: fileId } = await params;
    const body = await request.json();
    const payload = await authenticate(request);
    await connectDB();
    const user = await User.findById(payload.id)
      .select("-password")
      .populate("folders");
    if (!user) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 },
      );
    }
    if (user.isDeleted) {
      return Response.json(
        { message: "User deleted", success: false },
        { status: 404 },
      );
    }
    const file = await File.findByIdAndUpdate(
      fileId,
      { ...body, isDeleted: false },
      { new: true },
    );
    if (!file || file.isDeleted || !file.owner.equals(user._id)) {
      return Response.json(
        { message: "File not found", success: false },
        { status: 404 },
      );
    }
    await saveDeviceData(request, user._id, [
      "file",
      "PATCH",
      "user:" + user._id,
    ]);
    return Response.json({ message: "File updated", success: true });
  } catch (error) {
    return Response.json(
      { error, message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
