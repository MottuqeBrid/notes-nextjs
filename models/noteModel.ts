import mongoose, { Schema, Document, Model, Types } from "mongoose";

type ContentType =
  | "text"
  | "markdown"
  | "html"
  | "code"
  | "python"
  | "javascript"
  | "json"
  | "csv"
  | "xml"
  | "sql"
  | "yaml"
  | "toml"
  | "css"
  | "java"
  | "go"
  | "ruby"
  | "php"
  | "rust"
  | "swift"
  | "kotlin"
  | "csharp"
  | "cpp"
  | "c"
  | "bash"
  | "powershell"
  | "jsonc"
  | "yamlc"
  | "tomlc"
  | "htmlc"
  | "scss"
  | "less";

type FileType = "file" | "image" | "video" | "audio" | "other";

interface IFile {
  filename: string;
  originalName: string;
  url: string;
  type: FileType;
}

interface IContent {
  type: ContentType;
  files: IFile[];
  images: IFile[];
  text: string;
}

export interface INote extends Document {
  title: string;
  content: IContent;
  user: Types.ObjectId; // Schema.Types.ObjectId → Types.ObjectId
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

const fileSchema = new Schema<IFile>(
  {
    filename: { type: String, required: true },
    originalName: { type: String },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ["file", "image", "video", "audio", "other"],
      default: "file",
    },
  },
  { _id: false }, // আলাদা _id দরকার নেই
);

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: {
        type: String,
        enum: [
          "text",
          "markdown",
          "html",
          "code",
          "python",
          "javascript",
          "json",
          "csv",
          "xml",
          "sql",
          "yaml",
          "toml",
          "css",
          "java",
          "go",
          "ruby",
          "php",
          "rust",
          "swift",
          "kotlin",
          "csharp",
          "cpp",
          "c",
          "bash",
          "powershell",
          "jsonc",
          "yamlc",
          "tomlc",
          "htmlc",
          "scss",
          "less",
        ],
        default: "text",
      },
      files: { type: [fileSchema], default: [] },
      images: { type: [fileSchema], default: [] },
      text: { type: String, default: "" },
    },
    deleted: { type: Boolean, default: false },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>("Note", noteSchema);

export default Note;
