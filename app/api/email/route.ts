import { NextRequest } from "next/server";
import Email from "@/models/emailModel";
import "@/models/noteModel";
import "@/models/userModel";
import "@/models/fileModel";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/userModel";

export async function POST(request: NextRequest) {
  let to;
  let email;
  try {
    await connectDB();

    const body = await request.json();
    to = body.to;
    email = await Email.create({
      email: body.to,
      ...body,
    });

    return Response.json({
      success: true,
      message: "Email saved successfully",
      id: email._id,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  } finally {
    await connectDB();
    const user = await User.findOne({
      emails: to,
    });
    if (user && email) {
      await email.updateOne({ user: user._id });
    }
  }
}

export async function GET() {
  const emails = await Email.find().sort({ createdAt: -1 });
  return Response.json({
    success: true,
    message: "GET request received successfully",
    emails,
  });
}
