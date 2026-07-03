import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { authenticate } from "@/middleware/userMiddleware";
import "@/models/fileModel";
import "@/models/noteModel";
import "@/models/otpModel";
import "@/models/tokenModel";
import User from "@/models/userModel";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    await connectDB();
    const user = await User.findById(payload.id)
      .select("-password -otps -tokens")
      .populate<{ notes: { deleted: boolean }[] }>("notes");
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
    await saveDeviceData(request, user._id, [
      "profile",
      "GET",
      "user:" + user._id,
    ]);

    const userData = {
      ...user.toObject(),
      notes: user.notes.filter((note) => note.deleted === false),
    };

    return Response.json(
      { success: true, message: "User found", user: userData },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { error, message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const body = await request.json();
    await connectDB();
    const emailExists = await User.findOne({ email: body.email });
    if (emailExists && emailExists._id.toString() !== payload.id) {
      return Response.json(
        { message: "Use another email", success: false },
        { status: 409 },
      );
    }
    const user = await User.findByIdAndUpdate(payload.id, body, {
      new: true,
    });
    if (!user) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 },
      );
    }
    await saveDeviceData(request, user._id, [
      "profile",
      "PATCH",
      "user:" + user._id,
    ]);

    return Response.json(
      { success: true, message: "User updated successfully", user },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { error, message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    await connectDB();
    const user = await User.findByIdAndUpdate(
      payload.id,
      { isDeleted: true },
      { new: true },
    );
    if (!user) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 },
      );
    }
    await saveDeviceData(request, user._id, [
      "profile",
      "DELETE",
      "user:" + user._id,
    ]);
    return Response.json(
      { success: true, message: "User deleted successfully", user },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { error, message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
