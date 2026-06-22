import mongoose, { Model, Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: "user" | "admin" | "moderator";
  notes: Types.ObjectId[]; // ← fix
  folders: Types.ObjectId[]; // ← fix
  isVerified: boolean;
  isDeleted: boolean;
  profilePicture: string;
  tokens: Types.ObjectId[]; // ← fix
  otps: Types.ObjectId[]; // ← fix
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    notes: [{ type: Schema.Types.ObjectId, ref: "Note" }],
    folders: [{ type: Schema.Types.ObjectId, ref: "Folder" }],
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    profilePicture: { type: String },
    tokens: [{ type: Schema.Types.ObjectId, ref: "Token" }],
    otps: [{ type: Schema.Types.ObjectId, ref: "OTP" }],
  },
  { timestamps: true },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
