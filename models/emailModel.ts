import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IEmail extends Document {
  email: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments: unknown[];
  messageId?: string;
  replyTo?: string;
  receivedAt: Date;
  headers?: Record<string, string>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: Types.ObjectId;
}

const emailSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },

    from: {
      type: String,
    },
    to: {
      type: String,
    },
    subject: {
      type: String,
    },
    text: {
      type: String,
    },
    html: {
      type: String,
    },
    attachments: {
      type: [Object],
    },
    messageId: {
      type: String,
    },
    replyTo: {
      type: String,
    },
    receivedAt: {
      type: Date,
    },
    headers: {
      type: Object,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Email: Model<IEmail> =
  mongoose.models.Email || mongoose.model<IEmail>("Email", emailSchema);

export default Email;
