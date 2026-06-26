// app/api/upload/route.ts
import { uploadContentToSupabase, uploadFileToSupabase } from "@/lib/supabase";
import { uploadImageToImgbb } from "@/lib/imgbb";
import type { NextRequest } from "next/server";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/avif",
  "image/jxl",
  "image/webm",
  "image/ico",
  "image/cur",
  "image/pcx",
  "image/psd",
  "image/sgi",
  "image/tga",
  "image/vnd.microsoft.icon",
  "image/vnd.rn-realpix",
];
const ALLOWED_FILE_TYPES = [
  // PDF & Archive
  "application/pdf",
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  // Code & Text (MIME)
  "text/plain",
  "text/markdown",
  "text/html",
  "text/css",
  "text/javascript",
  "text/csv",
  "text/xml",
  "text/yaml",
  "text/x-python",
  "text/x-java-source",
  "text/x-go",
  "text/x-ruby",
  "text/x-php",
  "text/x-rustsrc",
  "text/x-swift",
  "text/x-kotlin",
  "text/x-csharp",
  "text/x-c++src",
  "text/x-csrc",
  "text/x-sh",
  "text/x-powershell",
  "text/x-scss",
  "text/x-less",
  "text/x-r",
  "text/x-rmd",
  "text/x-rmarkdown",
  "text/x-dart",
  "text/x-perl",
  "text/x-lua",
  "text/x-haskell",
  "text/x-elixir",
  "application/octet-stream",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  // Data
  "application/json",
  "application/xml",
  "application/sql",
  "application/toml",
];

// const ALLOWED_EXTENSIONS = [
//   "txt",
//   "md",
//   "html",
//   "htm",
//   "css",
//   "scss",
//   "less",
//   "js",
//   "ts",
//   "jsx",
//   "tsx",
//   "json",
//   "jsonc",
//   "csv",
//   "xml",
//   "sql",
//   "yaml",
//   "yml",
//   "toml",
//   "pdf",
//   "zip",
//   "rar",
//   "7z",
//   "mp4",
//   "webm",
//   "mov",
//   "mp3",
//   "wav",
//   "ogg",
//   "py",
//   "java",
//   "go",
//   "rb",
//   "php",
//   "rs",
//   "swift",
//   "kt",
//   "cs",
//   "cpp",
//   "c",
//   "sh",
//   "ps1",
//   "r",
//   "rmd",
//   "dart",
//   "pl",
//   "lua",
//   "hs",
//   "ex",
//   "exs",
// ];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// export async function POST(request: NextRequest) {
//   // try {
//   //   authenticate(request);
//   // } catch {
//   //   return Response.json(
//   //     { success: false, message: "Unauthorized" },
//   //     { status: 401 },
//   //   );
//   // }

//   try {
//     const formData = await request.formData();
//     console.log(formData);
//     // ─── Option 1: Text/Code content → Supabase ───
//     const contentType = formData.get("contentType") as string;
//     console.log("contentType:", contentType);
//     const content = formData.get("content") as string;
//     const customFilename = formData.get("filename") as string;

//     if (contentType && content) {
//       const result = await uploadContentToSupabase(
//         content,
//         contentType,
//         customFilename ?? undefined,
//       );

//       return Response.json(
//         {
//           success: true,
//           message: "Content uploaded successfully",
//           file: result,
//         },
//         { status: 201 },
//       );
//     }

//     // ─── Option 2: Actual files ───
//     const files = formData.getAll("files") as File[];

//     if (!files || files.length === 0) {
//       return Response.json(
//         { success: false, message: "No files or content provided" },
//         { status: 400 },
//       );
//     }

//     if (files.length > 10) {
//       return Response.json(
//         { success: false, message: "Maximum 10 files allowed" },
//         { status: 400 },
//       );
//     }

//     const results = [];
//     const errors: string[] = [];

//     for (const file of files) {
//       const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
//       // const isAllowed =
//       //   isImage ||
//       //   ALLOWED_FILE_TYPES.includes(file.type) ||
//       //   file.type.startsWith("text/");
//       const isAllowed =
//         isImage ||
//         ALLOWED_FILE_TYPES.includes(file.type) ||
//         file.type.startsWith("text/"); // যেকোনো text/* type allow করবে
//       const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

//       if (!isAllowed) {
//         errors.push(`${file.name}: File type not allowed`);
//         continue;
//       }

//       if (file.size > maxSize) {
//         errors.push(
//           `${file.name}: Too large (max ${isImage ? "5MB" : "10MB"})`,
//         );
//         continue;
//       }

//       try {
//         let result;

//         if (isImage) {
//           // ✅ Image → ImgBB
//           result = await uploadImageToImgbb(file);
//         } else {
//           // ✅ File → Supabase
//           result = await uploadFileToSupabase(file);
//         }

//         // results.push(result);
//         results.push({
//           filename: result.filename,
//           originalName: result.originalName,
//           url: result.url,
//           type: result.type,
//         });
//       } catch (err) {
//         errors.push(`${file.name}: Upload failed`);
//         console.error(`Upload error for ${file.name}:`, err);
//       }
//     }

//     if (results.length === 0) {
//       return Response.json(
//         { success: false, message: "All uploads failed", errors },
//         { status: 500 },
//       );
//     }

//     return Response.json(
//       {
//         success: true,
//         message: `${results.length} file(s) uploaded successfully`,
//         files: results,
//         errors: errors.length > 0 ? errors : undefined,
//       },
//       { status: 201 },
//     );
//   } catch (error: unknown) {
//     console.error("POST /upload error:", error);
//     return Response.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }

interface FileResponse {
  filename: string;
  originalName?: string;
  url: string;
  type: string;
}

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

    // ─── Option 1: Text/Code content → Supabase ───
    const contentType = formData.get("contentType") as string;
    const content = formData.get("content") as string;
    const customFilename = formData.get("filename") as string;

    if (contentType && content) {
      const result = await uploadContentToSupabase(
        content,
        contentType,
        customFilename ?? undefined,
      );

      const file: FileResponse = {
        filename: result.filename,
        originalName: result.originalName,
        url: result.url,
        type: result.type,
      };

      return Response.json(
        { success: true, message: "Content uploaded successfully", file },
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

    const results: FileResponse[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isAllowed =
        isImage ||
        ALLOWED_FILE_TYPES.includes(file.type) ||
        file.type.startsWith("text/");
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
        let result;

        if (isImage) {
          result = await uploadImageToImgbb(file);
        } else {
          result = await uploadFileToSupabase(file);
        }

        results.push({
          filename: result.filename,
          originalName: result.originalName,
          url: result.url,
          type: result.type,
        });
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
