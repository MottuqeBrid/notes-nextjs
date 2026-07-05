import { BrevoClient } from "@getbrevo/brevo";

export const sendOTP = async (
  from = "otp@brid.bd",
  to: string,
  otp: number,
) => {
  const apiKey = process.env.BREVO_API_KEY as string;
  const brevo = new BrevoClient({ apiKey: apiKey });
  const result = await brevo.transactionalEmails.sendTransacEmail({
    subject: "Your OTP Code",
    htmlContent: `<p>Your code: <b>${otp}</b></p>`,
    sender: { name: "OTP", email: from },
    to: [{ email: to }],
  });
  return result;
};
export const sendEmail = async (
  from = "info@brid.bd",
  to: string,
  body: string,
  subject = "Email from M-Note",
  name = "M-Note",
) => {
  const apiKey = process.env.BREVO_API_KEY as string;
  const brevo = new BrevoClient({ apiKey: apiKey });
  const result = await brevo.transactionalEmails.sendTransacEmail({
    subject: subject,
    htmlContent: body,
    sender: { name: name, email: from },
    to: [{ email: to }],
  });
  return result;
};
