import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDevicedata";
import User from "@/models/userModel";
import { INote } from "@/models/noteModel";
import { Types } from "mongoose";
import type { NextRequest } from "next/server";
import { authenticate } from "@/middleware/userMiddleware";

interface RouteParams {
  params: Promise<{ search: string }>;
}
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await authenticate(request);
    const { search } = await params;
    await connectDB();

    const user = await User.findById(payload.id).populate("notes");
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    await saveDeviceData(request, user._id as Types.ObjectId, ["search-notes"]);

    const notes = (user.notes as unknown as INote[]).filter((note) =>
      note.title.toLowerCase().includes(search.toLowerCase()),
    );

    return Response.json({
      success: true,
      message: "Notes fetched successfully",
      notes,
    });
  } catch (error) {
    console.error("GET /notes/search error:", error);
    return Response.json(
      { success: false, message: "Failed to fetch notes" },
      { status: 500 },
    );
  }
}
