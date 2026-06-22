import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
  code: string;
  user: Schema.Types.ObjectId;
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
  },
  {
    timestamps: true,
    delete: { index: true, expires: "10m" },
  },
);

const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>("OTP", otpSchema);

export default OTP;
