// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET ?? "uploads";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase credentials are not defined in .env.local");
}

// Service role key দিয়ে client বানাও (server-side only)
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

export interface UploadResult {
  filename: string;
  originalName?: string;
  url: string;
  type: string;
  mimeType: string;
  size: number;
  isImage: boolean;
}

function generateFilename(ext: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${random}.${ext}`;
}

// ✅ Text/Code content upload
export async function uploadContentToSupabase(
  content: string,
  contentType: string,
  customFilename?: string,
): Promise<UploadResult> {
  const mimeType = CONTENT_TYPE_MAP[contentType] ?? "text/plain";
  const ext = EXTENSION_MAP[contentType] ?? "txt";
  const filename = customFilename
    ? `${Date.now()}-${customFilename}`
    : generateFilename(ext);

  const buffer = Buffer.from(content, "utf-8");

  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filename, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(filename);

  return {
    filename,
    url: data.publicUrl,
    type: contentType,
    mimeType,
    size: buffer.length,
    isImage: false,
  };
}

// ✅ Actual file upload
export async function uploadFileToSupabase(file: File): Promise<UploadResult> {
  const isImage = file.type.startsWith("image/");
  const ext = file.name.split(".").pop() ?? "bin";
  const filename = generateFilename(ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(filename);

  return {
    filename,
    originalName: file.name,
    url: data.publicUrl,
    type: file.type,
    mimeType: file.type,
    size: file.size,
    isImage,
  };
}

// ✅ File delete
export async function deleteFromSupabase(filename: string): Promise<void> {
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .remove([filename]);

  if (error) throw new Error(`Supabase delete failed: ${error.message}`);
}
