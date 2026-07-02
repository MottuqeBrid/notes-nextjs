// app/api/note/[id]/route.ts
import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import User from "@/models/userModel";
import Note from "@/models/noteModel";
import { Types } from "mongoose";
import type { NextRequest } from "next/server";
import { authenticate } from "@/middleware/userMiddleware";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

  try {
    await connectDB();

    const { id } = await params;

    const user = await User.findById(payload.id);
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    await saveDeviceData(request, user._id as Types.ObjectId, [
      "get-note",
      `note-id:${id}`,
    ]);

    const note = await Note.findOne({
      _id: id,
      user: user._id,
    }).populate("user");

    if (!note) {
      return Response.json(
        { success: false, message: "Note not found" },
        { status: 404 },
      );
    }

    if (note.deleted) {
      return Response.json(
        { success: false, message: "Note not found" },
        { status: 404 },
      );
    }

    return Response.json(
      { success: true, message: "Note fetched successfully", note },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /note/[id] error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { id } = await params;
    const payload = await authenticate(request);
    await connectDB();
    const user = await User.findById(payload.id);
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    const noteInUser = user.notes.find((noteId) => noteId.toString() === id);
    if (!noteInUser) {
      return Response.json(
        { success: false, message: "Note not found in user notes" },
        { status: 404 },
      );
    }
    const note = await Note.findOne({ _id: id, user: user._id });
    if (!note) {
      return Response.json(
        { success: false, message: "Note not found" },
        { status: 404 },
      );
    }
    if (note.deleted) {
      return Response.json(
        { success: false, message: "Note not found" },
        { status: 404 },
      );
    }
    note.title = body.title;
    note.content = body.content;
    await note.save();
    await saveDeviceData(request, user._id, ["update-note", "note-id:" + id]);
    return Response.json(
      { success: true, message: "Note updated successfully", note },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /note/:id error:", error);
    return Response.json(
      { success: false, message: "Failed to update note" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = await authenticate(request);
    const user = await User.findById(payload.id);
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    const noteInUser = user.notes.find((noteId) => noteId.toString() === id);
    if (!noteInUser) {
      return Response.json(
        { success: false, message: "Note not found in user notes" },
        { status: 404 },
      );
    }
    const note = await Note.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: { deleted: true } },
      { new: true },
    );
    if (!note) {
      return Response.json(
        { success: false, message: "Note not found" },
        { status: 404 },
      );
    }
    await saveDeviceData(request, user._id, ["delete-note", "note-id:" + id]);
    return Response.json(
      { success: true, message: "Note deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /note/:id error:", error);
    return Response.json(
      { success: false, message: "Failed to delete note" },
      { status: 500 },
    );
  }
}
