import { connectDB } from "@/lib/mongoose";
import { generateOTP, verifyOTP } from "@/lib/otp";
import { saveDeviceData } from "@/lib/saveDeviceData";
import { Types } from "mongoose";
import { NextRequest } from "next/server";
import "@/models/otpModel";
import "@/models/noteModel";
import "@/models/fileModel";
import "@/models/tokenModel";
import "@/models/emailModel";
import "@/models/deviceModel";
import "@/models/userModel";
import { sendOTP } from "@/lib/email";
import User from "@/models/userModel";
import OTP from "@/models/otpModel";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, otp } = body;
    if (!email || !otp) {
      return Response.json({
        message: "email and otp are required",
        success: false,
      });
    }
    const isVerified = await verifyOTP(email, otp);

    if (!isVerified) {
      return Response.json({
        message: "Invalid OTP",
        success: false,
      });
    }

    await saveDeviceData(request, new Types.ObjectId(), ["otp", "POST"]);
    return Response.json({
      message: "Otp verified successfully",
      success: true,
    });
  } catch (error) {
    return Response.json({
      message: error instanceof Error ? error.message : "Internal Server Error",
      success: false,
    });
  }
}

export const GET = async (request: NextRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const otp = await generateOTP();
    if (!email) {
      return Response.json({
        message: "email is required",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({
        message: "User not found",
        success: false,
      });
    }
    const sendOtp = await sendOTP("otp@brid.bd", email, otp);
    const newOtp = new OTP({
      code: otp.toString(),
      user: user._id,
    });
    await newOtp.save();
    await user.otps.push(newOtp._id as unknown as Types.ObjectId);
    await user.messagesId.push(sendOtp.messageId as string);
    await user.save();
    await saveDeviceData(request, new Types.ObjectId(), ["otp", "GET"]);
    return Response.json({
      message: "Otp resend successfully",
      success: true,
    });
  } catch (error) {
    return Response.json({
      message: error instanceof Error ? error.message : "Internal Server Error",
      success: false,
    });
  }
};
