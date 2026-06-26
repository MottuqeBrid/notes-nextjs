// app/api/upload/route.ts
import {
  uploadContentToB2,
  uploadFileToB2,
  deleteFromB2,
} from "@/lib/backblaze";
import type { NextRequest } from "next/server";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
  "application/zip",
  "video/mp4",
  "audio/mpeg",
  "audio/wav",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  // try {
  //   authenticate(request);
  // } catch {
  //   return Response.json(
  //     { success: false, message: "Unauthorized" },
  //     { status: 401 },
  //   );
  // }

  try {
    const formData = await request.formData();

    // ─── Option 1: Text/Code content ───
    const contentType = formData.get("contentType") as string;
    const content = formData.get("content") as string;
    const customFilename = formData.get("filename") as string;

    if (contentType && content) {
      const result = await uploadContentToB2(
        content,
        contentType,
        customFilename ?? undefined,
      );

      return Response.json(
        {
          success: true,
          message: "Content uploaded successfully",
          file: result,
        },
        { status: 201 },
      );
    }

    // ─── Option 2: Actual files ───
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return Response.json(
        { success: false, message: "No files or content provided" },
        { status: 400 },
      );
    }

    if (files.length > 10) {
      return Response.json(
        { success: false, message: "Maximum 10 files allowed" },
        { status: 400 },
      );
    }

    const results = [];
    const errors: string[] = [];

    for (const file of files) {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isAllowed =
        ALLOWED_FILE_TYPES.includes(file.type) || file.type.startsWith("text/");
      const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

      if (!isAllowed) {
        errors.push(`${file.name}: File type not allowed`);
        continue;
      }

      if (file.size > maxSize) {
        errors.push(
          `${file.name}: Too large (max ${isImage ? "5MB" : "10MB"})`,
        );
        continue;
      }

      try {
        const result = await uploadFileToB2(file);
        results.push(result);
      } catch (err) {
        errors.push(`${file.name}: Upload failed`);
        console.error(`Upload error for ${file.name}:`, err);
      }
    }

    if (results.length === 0) {
      return Response.json(
        { success: false, message: "All uploads failed", errors },
        { status: 500 },
      );
    }

    return Response.json(
      {
        success: true,
        message: `${results.length} file(s) uploaded successfully`,
        files: results,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST /upload error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  // try {
  //   authenticate(request);
  // } catch {
  //   return Response.json(
  //     { success: false, message: "Unauthorized" },
  //     { status: 401 },
  //   );
  // }

  try {
    const { filename } = await request.json();

    if (!filename) {
      return Response.json(
        { success: false, message: "Filename is required" },
        { status: 400 },
      );
    }

    await deleteFromB2(filename);

    return Response.json(
      { success: true, message: "File deleted successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("DELETE /upload error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
