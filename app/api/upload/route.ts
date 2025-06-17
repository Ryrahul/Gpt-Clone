import { auth } from "@clerk/nextjs/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { validateFile } from "@/lib/file-utils";

// Configure the API route to handle larger payloads
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse form data with streaming to handle large files
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file provided", { status: 400 });
    }

    console.log(
      `Received file: ${file.name} (${file.type}, ${file.size} bytes)`
    );

    // Validate file size before processing
    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      return new Response("File too large. Maximum size is 50MB.", {
        status: 413,
      });
    }

    // Validate file type
    const validation = validateFile(file);
    if (!validation.isValid) {
      return new Response(validation.error, { status: 400 });
    }

    console.log(`Uploading file: ${file.name} to Cloudinary...`);

    // Upload to Cloudinary with optimized settings
    const result = await uploadToCloudinary(file, `user-${userId}`);

    const uploadedFile = {
      id: result.public_id,
      url: result.secure_url,
      name: result.original_filename || file.name,
      size: result.bytes,
      type: result.format,
      mimeType: file.type,
      provider: "cloudinary",
      width: result.width,
      height: result.height,
      pages: result.pages,
    };

    console.log("File upload successful:", uploadedFile.id);

    return Response.json({
      success: true,
      file: uploadedFile,
    });
  } catch (error) {
    console.error("Error uploading file:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (
        error.message.includes("File too large") ||
        error.message.includes("413")
      ) {
        return new Response("File too large. Please try a smaller file.", {
          status: 413,
        });
      }
      if (error.message.includes("timeout")) {
        return new Response("Upload timeout. Please try again.", {
          status: 408,
        });
      }
    }

    return new Response("Upload failed. Please try again.", { status: 500 });
  }
}
