// app/api/note/route.ts
import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import User from "@/models/userModel";
import Note, { INote } from "@/models/noteModel";
import { Types } from "mongoose";
import type { NextRequest } from "next/server";
import { authenticate } from "@/middleware/userMiddleware";

export async function POST(request: NextRequest) {
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

    const user = await User.findById(payload.id).populate("notes");
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return Response.json(
        { success: false, message: "Title and content are required" },
        { status: 400 },
      );
    }

    const note = new Note({
      title,
      content,
      user: user._id as Types.ObjectId,
    });
    await note.save();

    await user.notes.push(note._id as Types.ObjectId);
    await user.save();

    await saveDeviceData(request, user._id as Types.ObjectId, [
      "create-note",
      "note-id:" + note._id,
      "note-title:" + note.title,
    ]);

    return Response.json(
      { success: true, message: "Note created successfully", note },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST /note error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "10"));
    const skip = (page - 1) * limit;

    const user = await User.findById(payload.id as Types.ObjectId).populate(
      "notes",
    );
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (user.notes.length === 0) {
      return Response.json(
        { success: false, message: "No notes found" },
        { status: 404 },
      );
    }

    if (skip >= user.notes.length) {
      return Response.json(
        { success: false, message: "Page not found" },
        { status: 404 },
      );
    }

    await saveDeviceData(request, user._id as Types.ObjectId, [
      "get-notes",
      "page:" + page,
      "limit:" + limit,
      "skip:" + skip,
      "total:" + user.notes.length,
      "user-id:" + user._id,
    ]);

    let notes = user.notes as unknown as INote[]; // Type assertion
    notes = notes.filter((note) => !note.deleted); // Deleted notes filter করো
    notes = notes.slice(skip, skip + limit);

    return Response.json(
      {
        success: true,
        message: "Notes fetched successfully",
        notes: notes.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        ), // Sort by createdAt descending
        total: notes.length,
        page,
        limit,
        totalPages: Math.ceil(notes.length / limit),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /notes error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
