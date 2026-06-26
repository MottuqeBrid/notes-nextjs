// lib/imgbb.ts
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

if (!IMGBB_API_KEY) {
  throw new Error("IMGBB_API_KEY is not defined in .env.local");
}

export interface ImgbbResult {
  filename: string;
  originalName: string;
  url: string;
  displayUrl: string;
  deleteUrl: string;
  type: string;
  mimeType: string;
  size: number;
  isImage: true;
}

export async function uploadImageToImgbb(file: File): Promise<ImgbbResult> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const form = new FormData();
  form.append("key", IMGBB_API_KEY!);
  form.append("image", base64);
  form.append("name", file.name);

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error(`ImgBB upload failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(`ImgBB upload failed: ${data.error?.message}`);
  }

  return {
    filename: data.data.image.filename,
    originalName: file.name,
    url: data.data.url,
    displayUrl: data.data.display_url,
    deleteUrl: data.data.delete_url,
    type: "image",
    mimeType: file.type,
    size: file.size,
    isImage: true,
  };
}
