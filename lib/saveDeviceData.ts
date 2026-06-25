// lib/saveDeviceData.ts
import Device from "@/models/deviceModel";
import { parseDevice } from "@/lib/parseDevice";
import { connectDB } from "@/lib/mongoose"; // ← যোগ করো
import { Types } from "mongoose";
import { NextRequest } from "next/server";

export const saveDeviceData = async (
  req: NextRequest,
  user: Types.ObjectId | null = null,
  keyWords: string[] = [],
) => {
  await connectDB(); // ← যোগ করো

  const deviceInfo = parseDevice(req);
  const headers = Object.fromEntries(req.headers.entries());

  const device = new Device({
    ...deviceInfo,
    headers,
    keyWords,
    user,
  });

  await device.save();
  return device;
};
