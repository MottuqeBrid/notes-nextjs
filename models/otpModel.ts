import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
  code: string;
  user: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

const otpSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
      expires: 1200, // TTL index to automatically delete after 20 minutes (1200 seconds)
    },
  },
  {
    timestamps: true,
    delete: { index: true, expires: "10m" },
  },
);

const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>("OTP", otpSchema);

export default OTP;
