import mongoose, { Schema, Model, Document } from "mongoose";

export interface IFile extends Document {
  folder: {
    name: string;
    subfolder?: {
      name: string;
      files: {
        filename: string;
        url: string;
        type: "file" | "image" | "video" | "audio" | "other";
      }[];
    };
    files: {
      filename: string;
      url: string;
      type: "file" | "image" | "video" | "audio" | "other";
    }[];
  };
  owner: Schema.Types.ObjectId;
  sharedWith: Schema.Types.ObjectId[];
  privacy: "public" | "private";
  isDeleted: boolean;
}

const fileSchema = new mongoose.Schema(
  {
    folder: {
      name: {
        type: String,
        required: true,
      },
      subfolder: {
        name: String,
        files: [
          {
            filename: String,
            url: String,
            type: {
              type: String,
              enum: ["file", "image", "video", "audio", "other"],
              default: "file",
            },
          },
        ],
      },
      files: [
        {
          filename: String,
          url: String,
          type: {
            type: String,
            enum: ["file", "image", "video", "audio", "other"],
            default: "file",
          },
        },
      ],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    privacy: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const File: Model<IFile> =
  mongoose.models.File || mongoose.model<IFile>("File", fileSchema);

export default File;
