// lib/googleDrive.ts
import { google } from "googleapis";
import { Readable } from "stream";
// npm install googleapis
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

function getDriveClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

export interface DriveUploadResult {
  fileId: string;
  filename: string;
  url: string;
  type: string;
  mimeType: string;
  size: number;
  isImage: boolean;
}

// ✅ Text/Code content upload
export async function uploadContentToDrive(
  content: string,
  contentType: string,
  customFilename?: string,
): Promise<DriveUploadResult> {
  const drive = getDriveClient();
  const mimeType = CONTENT_TYPE_MAP[contentType] ?? "text/plain";
  const ext = EXTENSION_MAP[contentType] ?? "txt";
  const timestamp = Date.now();
  const filename = customFilename
    ? `${timestamp}-${customFilename}`
    : `${timestamp}-file.${ext}`;

  const stream = Readable.from([content]);

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, name, size, webViewLink, webContentLink",
  });

  const fileId = response.data.id!;

  // Public access দাও
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return {
    fileId,
    filename,
    url: `https://drive.google.com/uc?export=download&id=${fileId}`,
    type: contentType,
    mimeType,
    size: content.length,
    isImage: false,
  };
}

// ✅ Actual file upload
export async function uploadFileToDrive(
  file: File,
): Promise<DriveUploadResult> {
  const drive = getDriveClient();
  const isImage = file.type.startsWith("image/");

  const buffer = await file.arrayBuffer();
  const stream = Readable.from(Buffer.from(buffer));

  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const ext = file.name.split(".").pop() ?? "bin";
  const filename = `${timestamp}-${random}.${ext}`;

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    },
    media: {
      mimeType: file.type,
      body: stream,
    },
    fields: "id, name, size",
  });

  const fileId = response.data.id!;

  // Public access দাও
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return {
    fileId,
    filename,
    url: `https://drive.google.com/uc?export=download&id=${fileId}`,
    type: file.type,
    mimeType: file.type,
    size: file.size,
    isImage,
  };
}

// ✅ File delete
export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId });
}
