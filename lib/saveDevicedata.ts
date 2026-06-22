import Device from "@/models/deviceModel";
import { Types } from "mongoose";
import { NextRequest } from "next/server";

export const saveDeviceData = async (
  req: NextRequest,
  user: Types.ObjectId | null = null,
  keyWords: string[] = [],
) => {
  const headers = Object.fromEntries(req.headers.entries());

  const deviceData = {
    headers,
    method: req.method,
    url: req.url,
    originalUrl: req.nextUrl.pathname,
    _parsedUrl: {
      pathname: req.nextUrl.pathname,
      search: req.nextUrl.search,
      hash: req.nextUrl.hash,
      href: req.nextUrl.href,
    },
    user,
    keyWords,
  };

  const device = new Device(deviceData);
  await device.save();
  return device;
};
