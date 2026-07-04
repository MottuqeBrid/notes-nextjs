import mongoose, { Schema, Types } from "mongoose";
import type { Model, Document } from "mongoose";
export interface Email extends Document {
  email: string;
  user: Types.ObjectId;
  isDeleted: boolean;
}

const emailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Email: Model<Email> =
  mongoose.models.Email || mongoose.model<Email>("Email", emailSchema);

export default Email;
