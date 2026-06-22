import mongoose, { Schema, Document, Model } from "mongoose";

export interface IToken extends Document {
  token: string;
  user: Schema.Types.ObjectId;
}

const tokenSchema = new mongoose.Schema(
  {
    token: {
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
    delete: { index: true, expires: "7d" },
  },
);

const Token: Model<IToken> =
  mongoose.models.Token || mongoose.model<IToken>("Token", tokenSchema);

export default Token;
