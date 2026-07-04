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

export async function GET(request: NextRequest) {
  try {
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
    return Response.json({
      success: true,
      message: "Emails fetched successfully",
      emails: user.emails,
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

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const isEmailExists = await User.findOne({ emails: body.email });
    if (isEmailExists) {
      return Response.json(
        {
          success: false,
          message:
            "Email already in used by another user please try with another email",
        },
        {
          status: 409,
        },
      );
    }
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
    user.emails.push(body.email);
    await user.save();
    await saveDeviceData(request, user._id, [
      "email",
      "POST",
      "Email Added",
      "User added a new email",
    ]);
    return Response.json({
      success: true,
      message: "Email created successfully",
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

export async function DELETE(request: NextRequest) {
  try {
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
    const body = await request.json();
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
    user.emails = user.emails.filter((email) => email !== body.email);
    await user.save();
    const emails = await Email.find({ email: body.email });
    for (const email of emails) {
      email.isDeleted = true;
      await email.save();
    }
    await saveDeviceData(request, user._id, [
      "email",
      "DELETE",
      "Email Deleted",
      "User deleted an email",
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
