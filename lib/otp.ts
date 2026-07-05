import OTP, { IOTP } from "@/models/otpModel";
import User from "@/models/userModel";
import "@/models/otpModel";
import "@/models/noteModel";
import "@/models/fileModel";
import "@/models/tokenModel";
import "@/models/emailModel";
import "@/models/deviceModel";

export const generateOTP = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP
  return otp;
};

export const verifyOTP = async (email: string, otp: number) => {
  try {
    // Implementation for verifying OTP
    const user = await User.findOne({ email }).populate("otps");
    if (!user) {
      return false;
    }

    const storedOTP = (user.otps as unknown as IOTP[]).find(
      (OTP: { code: string }) => OTP.code === otp.toString(),
    );
    if (storedOTP) {
      if (
        storedOTP &&
        storedOTP.expiresAt > new Date() &&
        storedOTP.code === otp.toString()
      ) {
        user.isVerified = true;
        await OTP.findByIdAndDelete(storedOTP._id);
        user.otps = user.otps.filter(
          (id) => id.toString() !== storedOTP._id.toString(),
        );
        await user.save();
        return true;
      }
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
};
