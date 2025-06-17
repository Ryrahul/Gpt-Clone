"use client";

import { Brain, Paperclip } from "lucide-react";
import type { UploadedFile } from "@/components/file-upload";

interface ChatHeaderProps {
  showMemoryIndicator: boolean;
  uploadedFiles: UploadedFile[];
}

export function ChatHeader({
  showMemoryIndicator,
  uploadedFiles,
}: ChatHeaderProps) {
  return (
    <div className="hidden md:flex items-center justify-between p-4 border-b border-white/10 bg-[#212121]">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-medium text-white">ChatGPT</h1>
        <svg
          className="w-4 h-4 text-white/70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {showMemoryIndicator && (
        <div className="flex items-center gap-2 text-sm text-green-400 animate-pulse">
          <Brain className="w-4 h-4" />
          <span>Memory updated</span>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-blue-400">
          <Paperclip className="w-4 h-4" />
          <span>
            {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
