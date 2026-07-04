import { connectDB } from "@/lib/mongoose";
import { hashPassword } from "@/lib/password";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { authenticate } from "@/middleware/userMiddleware";
import User from "@/models/userModel";
import "@/models/noteModel";
import "@/models/fileModel";
import "@/models/tokenModel";
import "@/models/otpModel";
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

    const users = await User.find();
    await saveDeviceData(request, admin._id as Types.ObjectId, [
      "admin",
      "GET",
      "admin:" + payload.id,
      "total users:" + users.length,
    ]);
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

export async function PATCH(request: NextRequest) {
  console.log("PATCH request received");
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
    const body = await request.json();
    const adminUser = await User.findById(payload.id);
    if (
      !adminUser ||
      adminUser.role !== "admin" ||
      adminUser.isDeleted ||
      !adminUser.isVerified
    ) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    const { id, email, password } = body;
    // Update user password and email by admin
    if (id && email && password) {
      const user = await User.findById(id);
      if (!user) {
        return Response.json(
          { success: false, message: "User not found" },
          { status: 404 },
        );
      }
      if (password.length < 6) {
        return Response.json(
          {
            success: false,
            message: "Password must be at least 6 characters long",
          },
          { status: 400 },
        );
      }
      if (password.length !== 0) {
        const hashedPassword = await hashPassword(password);
        user.password = hashedPassword;
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return Response.json(
          { success: false, message: "Email already in use" },
          { status: 409 },
        );
      }
      user.email = email;
      await user.save();
      return Response.json({
        message: "User details updated successfully",
        success: true,
        user,
      });
    }
    return Response.json(
      { success: false, message: "Missing required fields" },
      { status: 400 },
    );
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to connect to database", error },
      { status: 500 },
    );
  }
}
