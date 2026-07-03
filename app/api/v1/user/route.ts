import { connectDB } from "@/lib/mongoose";
import { authenticate } from "@/middleware/userMiddleware";
import User from "@/models/userModel";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email") ?? "";
    const phone = request.nextUrl.searchParams.get("phone") ?? "";
    await connectDB();
    if (email) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        return Response.json({
          message: "Email already in exist",
          success: false,
          user,
        });
      } else {
        return Response.json({
          message: "Email not found",
          success: true,
          user,
        });
      }
    } else if (phone) {
      const user = await User.findOne({ phoneNumber: phone });
      if (!user) {
        return Response.json({
          message: "Phone number not found",
          success: true,
          user,
        });
      }
      return Response.json({
        message: "Phone number already in exist",
        success: false,
        user,
      });
    } else {
      const payload = await authenticate(request);
      if (!payload) {
        return Response.json(
          { message: "Unauthorized", success: false },
          { status: 401 },
        );
      }
      const user = await User.find();
      return Response.json({ message: "User found", success: true, user });
    }
  } catch (error) {
    return Response.json(
      { message: "Failed to connect to database", success: false, error },
      { status: 500 },
    );
  }
}
