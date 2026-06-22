import { generateToken, TokenPayload } from "@/lib/jwt";
import { connectDB } from "@/lib/mongoose";
import { generateOTP } from "@/lib/otp";
import { hashPassword } from "@/lib/password";
import OTP from "@/models/otpModel";
import User from "@/models/userModel";
import type { NextRequest } from "next/server";
import {  Types } from "mongoose";
import { saveDeviceData } from "@/lib/saveDevicedata";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { password, name, email } = body;

    if (!password || !name || !email) {
      return Response.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return Response.json(
        { success: false, message: "Email already in use" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    await user.save();
    const otp = new OTP({
      code: generateOTP(),
      user: user._id as unknown as Types.ObjectId,
    });
    await otp.save();

    user.otps.push(otp._id as unknown as Types.ObjectId);
    await user.save();

    saveDeviceData(request, user._id as Types.ObjectId, ["signup"]);

    const token = generateToken<TokenPayload>({
      id: user._id,
      role: user.role,
    });

    const res = Response.json(
      { success: true, message: "User created successfully", token },
      { status: 201 },
    );

    res.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Secure; Path=/; Max-Age=604800; SameSite=Strict`,
    );

    return res;
  } catch (error: unknown) {
    console.error("POST /user error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return Response.json({ success: false, message }, { status: 500 });
  }
}
