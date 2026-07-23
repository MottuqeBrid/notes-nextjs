// app/api/user/me/route.ts
import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { authenticate } from "@/middleware/userMiddleware";
import User from "@/models/userModel";
import "@/models/fileModel";
import "@/models/noteModel";
import "@/models/tokenModel";
import "@/models/otpModel";
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

    const user = await User.findById(payload.id).select("-password").populate<{
      notes: { _id: Types.ObjectId; deleted: boolean }[];
    }>("notes");
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    await saveDeviceData(request, user._id as Types.ObjectId, [
      "user-me",
      "GET",
      "user:" + user._id,
    ]);
    const userData = {
      ...user.toObject(),
      notes: user.notes.map((note) => {
        if (note.deleted === false) return note._id;
      }),
      notesCount: user.notes.filter((note) => note.deleted === false).length,
      level: user?.level ? user?.level : 1,
    };
    return Response.json(
      { success: true, message: "User retrieved successfully", user: userData },
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
