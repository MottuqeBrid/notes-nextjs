import { NextRequest, NextResponse } from "next/server";
import Email from "@/models/emailModel";
import "@/models/noteModel";
import "@/models/userModel";
import "@/models/fileModel";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/userModel";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Or 'https://example.com'
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

    // return Response.json({
    //   success: true,
    //   message: "Email saved successfully",
    //   id: email._id,
    // });
    return NextResponse.json(
      {
        success: true,
        message: "Email saved successfully",
        id: email._id,
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        headers: corsHeaders,
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
  return NextResponse.json(
    {
      success: true,
      message: "GET request received successfully",
      emails,
    },
    {
      headers: corsHeaders,
    },
  );
}
