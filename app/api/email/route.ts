import { NextRequest, NextResponse } from "next/server";
import Email from "@/models/emailModel";
import "@/models/noteModel";
import "@/models/userModel";
import "@/models/fileModel";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/userModel";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, message: "Recipient email (to) is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const email = await Email.create({ email: to, ...body });

    // ✅ finally এর বদলে এখানে user link করো
    const user = await User.findOne({ emails: to });
    if (user) {
      await Email.findByIdAndUpdate(email._id, { user: user._id });
    }

    return NextResponse.json(
      { success: true, message: "Email saved successfully", id: email._id },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.error("POST /email error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function GET() {
  try {
    await connectDB(); // ✅ যোগ করা হয়েছে

    const emails = await Email.find().sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, message: "Emails fetched successfully", emails },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("GET /email error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500, headers: corsHeaders },
    );
  }
}
