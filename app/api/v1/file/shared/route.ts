import { connectDB } from "@/lib/mongoose";
import { authenticate } from "@/middleware/userMiddleware";
import { NextRequest } from "next/server";
import { saveDeviceData } from "@/lib/saveDeviceData";
import User from "@/models/userModel";
import File from "@/models/fileModel";

export async function GET(request: NextRequest) {
  try {
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
    const files = await File.find({
      isDeleted: false,
      $or: [
        { privacy: "public" },
        // { owner: user._id }, // for owner
        // { sharedWith: user._id },
        { sharedWith: { $in: [user._id] } },
      ],
    });
    if (!files || files.length === 0) {
      return Response.json(
        { message: "Shared files not found", success: false },
        { status: 404 },
      );
    }
    await saveDeviceData(request, user._id, [
      "shared files",
      "GET",
      "user:" + user._id,
    ]);
    return Response.json({
      message: "Shared files fetched successfully",
      success: true,
      files,
    });
  } catch (error) {
    return Response.json(
      { error, message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
