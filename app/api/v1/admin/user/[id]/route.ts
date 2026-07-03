import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { authenticate } from "@/middleware/userMiddleware";
import User from "@/models/userModel";
import { Types } from "mongoose";
import type { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
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
    const user = await User.findById(id);
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    await saveDeviceData(request, user._id as Types.ObjectId, [
      "admin",
      "GET",
      "admin:" + payload.id,
      "user:" + id,
    ]);
    return Response.json({ success: true, user }, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, message: "Internal server error", error },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
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
    const user = await User.findById(id);
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    await saveDeviceData(request, user._id as Types.ObjectId, [
      "admin",
      "DELETE",
      "admin:" + payload.id,
      "user:" + id,
    ]);
    await User.findByIdAndUpdate(id, { isDeleted: true });
    return Response.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { success: false, message: "Internal server error", error },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
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
    const user = await User.findById(id); // Check if the user exists
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    const body = await request.json();
    const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
    await saveDeviceData(request, user._id as Types.ObjectId, [
      "admin",
      "PATCH",
      "admin:" + payload.id,
      "user:" + id,
    ]);
    return Response.json(
      {
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { success: false, message: "Internal server error", error },
      { status: 500 },
    );
  }
}
