import nodemailer from "nodemailer";

export const emailTransporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export const sendEmail = async (to: string, subject: string, text: string) => {
  if (!emailTransporter) {
    console.warn("Email not configured – skipping send");
    return;
  }
  await emailTransporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@jobportal.com",
    to,
    subject,
    text,
  });
};
