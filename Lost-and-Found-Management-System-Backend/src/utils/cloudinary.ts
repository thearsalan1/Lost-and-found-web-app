// cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const uploadOnCloudinary = async (
  fileBuffer: Buffer,
  mimetype: string
): Promise<UploadApiResponse | null> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          resolve(null);
        } else {
          resolve(result ?? null);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export { uploadOnCloudinary };