// import { saveDeviceData } from "@/lib/saveDeviceData";
import Email from "@/models/emailModel";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Email Body:", body);
    const { from } = body;
    const email = new Email({ email: from || "unknown@email.com", data: body });
    await email.save();
    return Response.json({
      success: true,
      message: "Email received successfully",
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Internal server error", error },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return Response.json({
    success: true,
    message: "GET request received successfully",
  });
}
