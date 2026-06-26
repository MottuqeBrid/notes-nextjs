import type { NextRequest } from "next/server";

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET;
const CLOUDFLARE_R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

if (
  !CLOUDFLARE_ACCOUNT_ID ||
  !CLOUDFLARE_API_TOKEN ||
  !CLOUDFLARE_R2_BUCKET ||
  !CLOUDFLARE_R2_PUBLIC_URL
) {
  throw new Error("Cloudflare credentials are not defined in .env.local");
}

// ✅ Note content type → MIME type mapping
const CONTENT_TYPE_MAP: Record<string, string> = {
  text: "text/plain",
  markdown: "text/markdown",
  html: "text/html",
  htmlc: "text/html",
  code: "text/plain",
  python: "text/x-python",
  javascript: "text/javascript",
  json: "application/json",
  jsonc: "application/json",
  csv: "text/csv",
  xml: "application/xml",
  sql: "application/sql",
  yaml: "text/yaml",
  yamlc: "text/yaml",
  toml: "application/toml",
  tomlc: "application/toml",
  css: "text/css",
  scss: "text/x-scss",
  less: "text/x-less",
  java: "text/x-java-source",
  go: "text/x-go",
  ruby: "text/x-ruby",
  php: "text/x-php",
  rust: "text/x-rustsrc",
  swift: "text/x-swift",
  kotlin: "text/x-kotlin",
  csharp: "text/x-csharp",
  cpp: "text/x-c++src",
  c: "text/x-csrc",
  bash: "text/x-sh",
  powershell: "text/x-powershell",
};

// ✅ Extension mapping
const EXTENSION_MAP: Record<string, string> = {
  text: "txt",
  markdown: "md",
  html: "html",
  htmlc: "html",
  code: "txt",
  python: "py",
  javascript: "js",
  json: "json",
  jsonc: "jsonc",
  csv: "csv",
  xml: "xml",
  sql: "sql",
  yaml: "yaml",
  yamlc: "yaml",
  toml: "toml",
  tomlc: "toml",
  css: "css",
  scss: "scss",
  less: "less",
  java: "java",
  go: "go",
  ruby: "rb",
  php: "php",
  rust: "rs",
  swift: "swift",
  kotlin: "kt",
  csharp: "cs",
  cpp: "cpp",
  c: "c",
  bash: "sh",
  powershell: "ps1",
};

// ✅ Allowed image types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "image/bmp",
  "image/tiff",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function generateFilename(type: string, originalName?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);

  if (originalName) {
    const ext = originalName.split(".").pop() ?? "txt";
    return `${timestamp}-${random}.${ext}`;
  }

  const ext = EXTENSION_MAP[type] ?? "txt";
  return `${timestamp}-${random}.${ext}`;
}

async function uploadToR2(
  body: ArrayBuffer | string,
  filename: string,
  mimeType: string,
): Promise<string> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${CLOUDFLARE_R2_BUCKET}/objects/${filename}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        "Content-Type": mimeType,
      },
      body,
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`R2 upload failed: ${JSON.stringify(error)}`);
  }

  return `${CLOUDFLARE_R2_PUBLIC_URL}/${filename}`;
}

export async function POST(request: NextRequest) {
  // Auth check
  // let payload;
  // try {
  //   payload = authenticate(request);
  // } catch {
  //   return Response.json(
  //     { success: false, message: "Unauthorized" },
  //     { status: 401 },
  //   );
  // }

  try {
    const formData = await request.formData();

    // ─── Option 1: Text/Code content upload ───
    const contentType = formData.get("contentType") as string; // "python", "markdown" etc
    const content = formData.get("content") as string;
    const filename_custom = formData.get("filename") as string;

    if (contentType && content) {
      const mimeType = CONTENT_TYPE_MAP[contentType] ?? "text/plain";
      const filename = filename_custom
        ? `${Date.now()}-${filename_custom}`
        : generateFilename(contentType);

      const url = await uploadToR2(content, filename, mimeType);

      return Response.json(
        {
          success: true,
          message: "Content uploaded successfully",
          file: {
            filename,
            url,
            type: contentType,
            mimeType,
            isImage: false,
          },
        },
        { status: 201 },
      );
    }

    // ─── Option 2: Actual file upload ───
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
      const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

      if (file.size > maxSize) {
        errors.push(
          `${file.name}: Too large (max ${isImage ? "5MB" : "10MB"})`,
        );
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();
        const filename = generateFilename("", file.name);
        const url = await uploadToR2(buffer, filename, file.type);

        results.push({
          filename,
          originalName: file.name,
          url,
          type: file.type,
          size: file.size,
          isImage,
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

// ✅ DELETE
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

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${CLOUDFLARE_R2_BUCKET}/objects/${filename}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
      },
    );

    if (!response.ok) throw new Error("Failed to delete file");

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
