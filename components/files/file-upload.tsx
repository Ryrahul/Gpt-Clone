"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, Loader2, FileText, ImageIcon } from "lucide-react";
import { validateFile, formatFileSize } from "@/lib/file-utils";
import { toast } from "sonner";

export interface UploadedFile {
  id: string;
  url: string; 
  name: string;
  size: number;
  type: string;
  mimeType: string;
  provider: string;
  width?: number;
  height?: number;
  pages?: number;
  file: File;
}

interface FileUploadProps {
  onFileUploaded: (uploadedFile: UploadedFile, nativeFile: File) => void;
  onFileRemoved: (fileId: string) => void;
  uploadedFiles: UploadedFile[];
  disabled?: boolean;
  maxFiles?: number;
}

export function FileUpload({
  onFileUploaded,
  onFileRemoved,
  uploadedFiles,
  disabled = false,
  maxFiles = 5,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (uploadedFiles.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const file = files[0];
    const validation = validateFile(file);

    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    setUploadProgress("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress("Processing file...");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const result = await response.json();

      if (result.success) {
        const uploadedFile: UploadedFile = {
          ...result.file,
          file: file, 
        };

        onFileUploaded(uploadedFile, file);
        toast.success(`${file.name} uploaded successfully`);
        setUploadProgress("");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${file.name}`);
      setUploadProgress("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleButtonClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          dragActive
            ? "border-blue-400 bg-blue-50/10 scale-[1.02]"
            : "border-white/20 hover:border-white/30"
        } ${
          disabled || isUploading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-white/5"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleInputChange}
          accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.webp"
          disabled={disabled || isUploading}
        />

        <div className="flex flex-col items-center justify-center">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-blue-400 animate-spin mb-3" />
              <p className="text-white/70 text-sm font-medium">
                {uploadProgress}
              </p>
              <p className="text-white/50 text-xs mt-1">Please wait...</p>
            </>
          ) : (
            <>
              <div className="p-3 bg-white/10 rounded-full mb-4">
                <Upload className="h-8 w-8 text-white/70" />
              </div>
              <p className="text-white/70 text-base font-medium mb-2">
                Drop files here or click to upload
              </p>
              <p className="text-white/50 text-sm text-center">
                Supports PDF, DOC, TXT, RTF, and Images
              </p>
              <p className="text-white/40 text-xs mt-1">
                Max 10MB • {uploadedFiles.length}/{maxFiles} files
              </p>
            </>
          )}
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-white/70 text-sm font-medium">Attached Files:</p>
          {uploadedFiles.map((file) => (
            <Card
              key={file.id}
              className="bg-[#2f2f2f] border-white/10 hover:bg-[#353535] transition-colors"
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Show image preview if it's an image */}
                    {file.mimeType.startsWith("image/") ? (
                      <img
                        src={file.url || "/placeholder.svg"}
                        alt={file.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="text-white/70">
                        {getFileTypeIcon(file.mimeType)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-white/50 text-xs">
                        <span>{formatFileSize(file.size)}</span>
                        {file.pages && <span>• {file.pages} pages</span>}
                        {file.width && file.height && (
                          <span>
                            • {file.width}×{file.height}
                          </span>
                        )}
                        <span>• {file.provider}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileRemoved(file.id);
                    }}
                    size="sm"
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 h-8 w-8 p-0 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
