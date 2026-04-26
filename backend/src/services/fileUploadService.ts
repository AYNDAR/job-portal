import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { public_id: fileName, resource_type: "auto" },
      (error: Error | undefined, result: any) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      },
    );
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

export const deleteFile = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
