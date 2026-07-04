import { connectDB } from "@/lib/mongoose";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { authenticate } from "@/middleware/userMiddleware";
import User from "@/models/userModel";
import "@/models/fileModel";
import "@/models/noteModel";
import "@/models/tokenModel";
import "@/models/otpModel";
import { NextRequest } from "next/server";
import Email from "@/models/emailModel";
import { Types } from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { mail: string } },
) {
  try {
    const { mail } = await params;
    const payload = await authenticate(request);
    if (!payload) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }
    await connectDB();
    const user = await User.findById(payload.id);
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }
    if (!user.emails.includes(mail)) {
      return Response.json(
        {
          success: false,
          message: "Email not found",
        },
        {
          status: 404,
        },
      );
    }
    const emails = await Email.find({ email: mail, isDeleted: false }).sort({
      receivedAt: -1,
    });
    await saveDeviceData(request, payload.id as Types.ObjectId, [
      "email",
      "GET",
      mail,
    ]);
    return Response.json({
      success: true,
      message: "Emails fetched successfully",
      emails,
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
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { mail: string } },
) {
  try {
    const { mail } = await params;
    const payload = await authenticate(request);
    if (!payload) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }
    await connectDB();
    const emails = await Email.findByIdAndUpdate(
      mail,
      { isDeleted: true },
      { new: true },
    );
    if (!emails) {
      return Response.json(
        {
          success: false,
          message: "Email not found",
        },
        {
          status: 404,
        },
      );
    }
    await saveDeviceData(request, payload.id as Types.ObjectId, [
      "email",
      "DELETE",
      mail,
    ]);

    return Response.json({
      success: true,
      message: "Email deleted successfully",
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
  }
}
