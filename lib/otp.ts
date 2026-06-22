import { IOTP } from "@/models/otpModel";
import User from "@/models/userModel";

export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP
  return otp;
};

export const verifyOTP = async (userId: string, otp: number) => {
  // Implementation for verifying OTP
  const user = await User.findById(userId).populate("otps");
  if (!user) {
    return false;
  }
  const storedOTP = (user.otps as unknown as IOTP[]).find(
    (OTP: { code: string }) => OTP.code === otp.toString(),
  );
  if (storedOTP) {
    user.isVerified = true;
    await user.save();
    return true;
  }
  return false;
};
