import { NextRequest } from "next/server";
import Email from "@/models/emailModel";
import "@/models/noteModel";
import "@/models/userModel";
import "@/models/fileModel";
import { connectDB } from "@/lib/mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // const mail = {
    //   from: body.from,
    //   to: body.to,
    //   subject: body.subject || "",
    //   text: body.text || "",
    //   html: body.html || "",
    //   attachments: body.attachments || [],
    //   messageId: body.messageId || null,
    //   replyTo: body.replyTo || null,
    //   receivedAt: body.receivedAt || new Date(),
    //   headers: {
    //     subject: body.headers?.subject,
    //     date: body.headers?.date,
    //     from: body.headers?.from,
    //     to: body.headers?.to,
    //     "message-id": body.headers?.["message-id"],
    //   },
    // };

    const email = await Email.create({
      email: body.to,
      ...body,
    });

    return Response.json({
      success: true,
      message: "Email saved successfully",
      id: email._id,
    });
  } catch (error) {
    console.error("EMAIL API ERROR:", error);

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

export async function GET() {
  const emails = await Email.find().sort({ createdAt: -1 });
  return Response.json({
    success: true,
    message: "GET request received successfully",
    emails,
  });
}
