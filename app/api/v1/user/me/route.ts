// app/api/user/me/route.ts
import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceDataTemp";
import { authenticate } from "@/middleware/userMiddleware";
import User from "@/models/userModel";
import { Types } from "mongoose";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Token verify করো
    let payload;
    try {
      payload = await authenticate(request);
    } catch {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    await saveDeviceData(request, user._id as Types.ObjectId, ["user-me"]);

    return Response.json(
      { success: true, message: "User retrieved successfully", user },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /user/me error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
