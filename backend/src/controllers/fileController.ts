import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../config/database";
import cloudinary from "../config/cloudinary";

// Extend Express Request to include user and file
interface AuthRequest extends Request {
  user?: { userId: string; userTypeId: number };
  file?: Express.Multer.File;
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/resumes";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Middleware to handle single file upload
export const uploadResumeMiddleware = upload.single("resume");

// Controller function
export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const seeker = await prisma.jobSeekerProfile.update({
      where: { user_id: req.user?.userId },
      data: { resume_url: resumeUrl },
    });
    res.json({ url: resumeUrl, message: "Resume uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "job-portal/avatars",
            transformation: [{ width: 200, height: 200, crop: "limit" }],
          },
          (err: any, result: any) => (err ? reject(err) : resolve(result)),
        );
        stream.end(req.file!.buffer);
      },
    );
    const avatarUrl = result.secure_url;
    res.json({ url: avatarUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Avatar upload failed" });
  }
};
