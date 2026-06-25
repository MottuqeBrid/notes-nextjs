import { comparePassword } from "@/lib/password";
import { generateToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import User from "@/models/userModel";
import { TokenPayload } from "@/lib/jwt";
import { Types } from "mongoose";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    await saveDeviceData(request, user._id as Types.ObjectId, ["login"]);

    const token = generateToken<TokenPayload>({
      id: (user._id as Types.ObjectId).toString(),
      role: user.role,
    });

    const res = Response.json(
      { success: true, message: "Login successful", token },
      { status: 200 },
    );

    res.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Secure; Path=/; Max-Age=604800; SameSite=Strict`,
    );

    return res;
  } catch (error: unknown) {
    console.error("POST /login error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
