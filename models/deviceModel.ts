import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IDevice extends Document {
  headers: Record<string, string>;
  method: string;
  url: string;
  originalUrl: string;
  _parsedUrl: {
    pathname: string;
    search: string;
    hash: string;
    href: string;
  };
  keyWords: string[];
  user: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    headers: {
      type: Schema.Types.Mixed,
    },
    method: {
      type: String,
    },
    url: {
      type: String,
    },
    originalUrl: {
      type: String,
    },
    _parsedUrl: {
      pathname: { type: String },
      search: { type: String },
      hash: { type: String },
      href: { type: String },
    },
    keyWords: [{ type: String }],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Device: Model<IDevice> =
  mongoose.models.Device || mongoose.model<IDevice>("Device", deviceSchema);

export default Device;
