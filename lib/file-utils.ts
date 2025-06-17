export const SUPPORTED_FILE_TYPES = {
  images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/rtf",
  ],
  all: [] as string[],
};

SUPPORTED_FILE_TYPES.all = [
  ...SUPPORTED_FILE_TYPES.images,
  ...SUPPORTED_FILE_TYPES.documents,
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: "File size must be less than 10MB" };
  }

  if (!SUPPORTED_FILE_TYPES.all.includes(file.type)) {
    return { isValid: false, error: "File type not supported" };
  }

  return { isValid: true };
}

export function getFileIcon(mimeType: string): string {
  if (SUPPORTED_FILE_TYPES.images.includes(mimeType)) {
    return "🖼️";
  }
  if (mimeType === "application/pdf") {
    return "📄";
  }
  if (mimeType.includes("word") || mimeType === "application/msword") {
    return "📝";
  }
  if (mimeType === "text/plain") {
    return "📄";
  }
  return "📎";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}
export function getFileTypeLabel(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.includes("word")) return "Word Document";
  if (mimeType === "text/plain") return "Text File";
  if (mimeType === "text/rtf") return "RTF Document";
  return "Document";
}
