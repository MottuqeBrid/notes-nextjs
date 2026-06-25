// models/deviceModel.ts
import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IDevice extends Document {
  browser: {
    name: string;
    version: string;
    major: string;
  };
  cpu: {
    architecture: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type: string;
    vendor: string;
    model: string;
  };
  network: {
    ip: string;
    ipv4: string;
    ipv6: string;
    forwardedFor: string[];
  };
  request: {
    url: string;
    pathname: string;
    search: string;
    method: string;
    referrer: string;
    language: string;
    encoding: string;
  };
  headers: Record<string, string>;
  userAgent: string;
  keyWords: string[];
  user: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    browser: {
      name: { type: String, default: "unknown" },
      version: { type: String, default: "unknown" },
      major: { type: String, default: "unknown" },
    },
    cpu: {
      architecture: { type: String, default: "unknown" },
    },
    os: {
      name: { type: String, default: "unknown" },
      version: { type: String, default: "unknown" },
    },
    device: {
      type: {
        type: String,
        enum: ["desktop", "mobile", "tablet", "unknown"],
        default: "unknown",
      },
      vendor: { type: String, default: "unknown" },
      model: { type: String, default: "unknown" },
    },
    network: {
      ip: { type: String, default: "unknown" },
      ipv4: { type: String, default: "" },
      ipv6: { type: String, default: "" },
      forwardedFor: [{ type: String }],
    },
    request: {
      url: { type: String },
      pathname: { type: String },
      search: { type: String },
      method: { type: String },
      referrer: { type: String },
      language: { type: String },
      encoding: { type: String },
    },
    headers: { type: Schema.Types.Mixed },
    userAgent: { type: String },
    keyWords: [{ type: String }],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

// IP দিয়ে সহজে search করার জন্য index
deviceSchema.index({ "network.ip": 1 });
deviceSchema.index({ user: 1 });
deviceSchema.index({ createdAt: -1 });

const Device: Model<IDevice> =
  mongoose.models.Device || mongoose.model<IDevice>("Device", deviceSchema);

export default Device;
