import { Router } from "express";
import { register, login } from "../controllers/authController";
import { loginLimiter } from "../middlewares/rateLimiter";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { sendResetCode } from "../services/emailService";

const router = Router();

router.post("/register", register);
router.post("/login", loginLimiter, login);
// Temporary store for reset codes (in production use Redis or DB table)
const resetCodes = new Map<string, { code: string; expires: number }>();

// Request password reset
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Do not reveal if email exists – but for UX we can still say "sent"
    return res.json({ message: "If that email exists, a code has been sent." });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 15 * 60 * 1000; // 15 minutes
  resetCodes.set(email, { code, expires });

  try {
    await sendResetCode(email, code);
    res.json({ message: "Verification code sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Reset password with code
router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const record = resetCodes.get(email);
  if (!record || record.code !== code || record.expires < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  resetCodes.delete(email); // remove used code
  res.json({ message: "Password reset successful" });
});

export default router;
