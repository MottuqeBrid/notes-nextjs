// lib/parseDevice.ts
import { UAParser } from "ua-parser-js";

export interface DeviceInfo {
  // Browser
  browser: {
    name: string;
    version: string;
    major: string;
  };
  // OS
  os: {
    name: string;
    version: string;
  };
  // CPU
  cpu: {
    architecture: string;
  };
  // Device
  device: {
    type: "desktop" | "mobile" | "tablet" | "unknown";
    vendor: string;
    model: string;
  };
  // Network
  network: {
    ip: string;
    ipv4: string;
    ipv6: string;
    forwardedFor: string[];
  };
  // Request
  request: {
    url: string;
    pathname: string;
    search: string;
    method: string;
    referrer: string;
    language: string;
    encoding: string;
  };
  // Raw
  userAgent: string;
}

export function parseDevice(request: Request): DeviceInfo {
  const ua = request.headers.get("user-agent") ?? "";
  const parser = new UAParser(ua);
  const result = parser.getResult();

  // IP parse করো
  const forwardedFor =
    request.headers
      .get("x-forwarded-for")
      ?.split(",")
      .map((ip) => ip.trim()) ?? [];

  const ip =
    forwardedFor[0] ??
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ?? // Cloudflare
    "unknown";

  const ipv4 = ip.includes(":") ? "" : ip;
  const ipv6 = ip.includes(":") ? ip : "";

  // Device type
  const rawType = result.device.type;
  let deviceType: DeviceInfo["device"]["type"] = "desktop";
  if (rawType === "mobile") deviceType = "mobile";
  else if (rawType === "tablet") deviceType = "tablet";
  else if (!rawType) deviceType = "desktop";
  else deviceType = "unknown";

  // URL parse
  let url: URL | null = null;
  try {
    url = new URL(request.url);
  } catch {
    url = null;
  }

  return {
    browser: {
      name: result.browser.name ?? "unknown",
      version: result.browser.version ?? "unknown",
      major: result.browser.major ?? "unknown",
    },
    cpu: {
      architecture: result.cpu.architecture ?? "unknown",
    },
    os: {
      name: result.os.name ?? "unknown",
      version: result.os.version ?? "unknown",
    },
    device: {
      type: deviceType,
      vendor: result.device.vendor ?? "unknown",
      model: result.device.model ?? "unknown",
    },
    network: {
      ip,
      ipv4,
      ipv6,
      forwardedFor,
    },
    request: {
      url: request.url,
      pathname: url?.pathname ?? "",
      search: url?.search ?? "",
      method: request.method,
      referrer: request.headers.get("referer") ?? "",
      language: request.headers.get("accept-language") ?? "",
      encoding: request.headers.get("accept-encoding") ?? "",
    },
    userAgent: ua,
  };
}
