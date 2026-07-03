import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { authenticate } from "@/middleware/userMiddleware";
import "@/models/fileModel";
import "@/models/noteModel";
import "@/models/otpModel";
import "@/models/tokenModel";
import User from "@/models/userModel";
import type { NextRequest } from "next/server";
import { hashPassword } from "@/lib/password";

export async function PATCH(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return Response.json(
        { message: "Missing required fields", success: false },
        { status: 400 },
      );
    }
    await connectDB();
    const newHashPassword = await hashPassword(newPassword);
    const user = await User.findByIdAndUpdate(payload.id, {
      password: newHashPassword,
    });
    if (!user) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 },
      );
    }
    await saveDeviceData(request, user._id, [
      "change-password",
      "PATCH",
      "user:" + user._id,
    ]);

    return Response.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { error, message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
