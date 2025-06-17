import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  bytes: number;
  original_filename: string;
  width?: number;
  height?: number;
  pages?: number;
}

export async function uploadToCloudinary(
  file: File,
  folder = "chatgpt-uploads"
): Promise<CloudinaryUploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto", // Automatically detect file type
          folder: folder,
          use_filename: true,
          unique_filename: true,
          // Optimize images
          quality: "auto:good",
          fetch_format: "auto",
          flags: file.type.startsWith("image/") ? "progressive" : undefined,
        },
        (error: any, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else if (result) {
            const uploadResult: CloudinaryUploadResult = {
              public_id: result.public_id,
              secure_url: result.secure_url,
              resource_type: result.resource_type,
              format: result.format,
              bytes: result.bytes,
              original_filename: result.original_filename || file.name,
              width: result.width,
              height: result.height,
              pages: result.pages,
            };
            resolve(uploadResult);
          } else {
            reject(new Error("Upload failed - no result returned"));
          }
        }
      )
      .end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

export async function getCloudinaryFileInfo(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error("Error getting Cloudinary file info:", error);
    throw error;
  }
}
