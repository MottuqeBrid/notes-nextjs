// lib/backblaze.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const BACKBLAZE_ENDPOINT = process.env.BACKBLAZE_ENDPOINT;
const BACKBLAZE_REGION = process.env.BACKBLAZE_REGION;
const BACKBLAZE_KEY_ID = process.env.BACKBLAZE_KEY_ID;
const BACKBLAZE_APP_KEY = process.env.BACKBLAZE_APP_KEY;
const BACKBLAZE_BUCKET = process.env.BACKBLAZE_BUCKET;
const BACKBLAZE_PUBLIC_URL = process.env.BACKBLAZE_PUBLIC_URL;

if (
  !BACKBLAZE_ENDPOINT ||
  !BACKBLAZE_REGION ||
  !BACKBLAZE_KEY_ID ||
  !BACKBLAZE_APP_KEY ||
  !BACKBLAZE_BUCKET ||
  !BACKBLAZE_PUBLIC_URL
) {
  throw new Error("Backblaze credentials are not defined in .env.local");
}

const client = new S3Client({
  endpoint: BACKBLAZE_ENDPOINT,
  region: BACKBLAZE_REGION,
  credentials: {
    accessKeyId: BACKBLAZE_KEY_ID,
    secretAccessKey: BACKBLAZE_APP_KEY,
  },
});

// ✅ Content type map
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
export async function uploadContentToB2(
  content: string,
  contentType: string,
  customFilename?: string,
): Promise<UploadResult> {
  const mimeType = CONTENT_TYPE_MAP[contentType] ?? "text/plain";
  const ext = EXTENSION_MAP[contentType] ?? "txt";
  const filename = customFilename
    ? generateFilename(customFilename.split(".").pop() ?? ext)
    : generateFilename(ext);

  const buffer = Buffer.from(content, "utf-8");

  await client.send(
    new PutObjectCommand({
      Bucket: BACKBLAZE_BUCKET,
      Key: filename,
      Body: buffer,
      ContentType: mimeType,
      ContentLength: buffer.length,
    }),
  );

  return {
    filename,
    url: `${BACKBLAZE_PUBLIC_URL}/${filename}`,
    type: contentType,
    mimeType,
    size: buffer.length,
    isImage: false,
  };
}

// ✅ Actual file upload
export async function uploadFileToB2(file: File): Promise<UploadResult> {
  const isImage = file.type.startsWith("image/");
  const ext = file.name.split(".").pop() ?? "bin";
  const filename = generateFilename(ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: BACKBLAZE_BUCKET,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      ContentLength: buffer.length,
    }),
  );

  return {
    filename,
    originalName: file.name,
    url: `${BACKBLAZE_PUBLIC_URL}/${filename}`,
    type: file.type,
    mimeType: file.type,
    size: file.size,
    isImage,
  };
}

// ✅ File delete
export async function deleteFromB2(filename: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({
      Bucket: BACKBLAZE_BUCKET,
      Key: filename,
    }),
  );
}

// ✅ File exists check
export async function fileExistsInB2(filename: string): Promise<boolean> {
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: BACKBLAZE_BUCKET,
        Key: filename,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
