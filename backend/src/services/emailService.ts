import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetCode = async (to: string, code: string) => {
  await transporter.sendMail({
    from: `"JobPortal" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Code",
    html: `
      <div style="font-family: Arial; max-width: 500px;">
        <h2>Reset Your Password</h2>
        <p>Your verification code is:</p>
        <h1 style="background: #f0f0f0; padding: 10px; letter-spacing: 5px;">${code}</h1>
        <p>This code expires in 15 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};
