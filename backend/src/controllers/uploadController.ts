import multer from "multer";
import { Request, Response } from "express";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/job-attachments";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export const uploadJobAttachments = upload.array("files", 5);
export const handleUpload = async (req: Request, res: Response) => {
  if (!req.files) return res.status(400).json({ error: "No files uploaded" });
  const urls = (req.files as Express.Multer.File[]).map(
    (f) => `/uploads/job-attachments/${f.filename}`,
  );
  res.json({ urls });
};
