import multer from "multer";

const storage = multer.memoryStorage();
const fileFilter = (req: any, file: any, cb: any) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
};

export const upload = multer({ storage, fileFilter });
