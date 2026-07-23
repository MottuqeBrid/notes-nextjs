import mongoose, { Model, Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  role: "user" | "admin" | "moderator";
  notes: Types.ObjectId[]; // ← fix
  folders: Types.ObjectId[]; // ← fix
  isVerified: boolean;
  isDeleted: boolean;
  profilePicture: string;
  level: number;
  messagesId: string[];
  images: string[];
  emails: string[];
  tokens: Types.ObjectId[]; // ← fix
  otps: Types.ObjectId[]; // ← fix
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phoneNumber: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    notes: [{ type: Schema.Types.ObjectId, ref: "Note" }],
    folders: [{ type: Schema.Types.ObjectId, ref: "File" }],
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    profilePicture: { type: String },
    images: [{ type: String }],
    level: { type: Number, default: 1 },
    messagesId: [
      {
        type: String,
      },
    ],
    emails: [
      {
        type: String,
      },
    ],
    tokens: [{ type: Schema.Types.ObjectId, ref: "Token" }],
    otps: [{ type: Schema.Types.ObjectId, ref: "OTP" }],
  },
  { timestamps: true },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
