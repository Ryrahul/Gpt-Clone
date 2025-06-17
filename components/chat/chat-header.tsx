"use client";

import { Brain, Paperclip, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadedFile } from "@/components/file-upload";

interface ChatHeaderProps {
  showMemoryIndicator: boolean;
  uploadedFiles: UploadedFile[];
  isCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function ChatHeader({
  showMemoryIndicator,
  uploadedFiles,
  isCollapsed = false,
  onToggleSidebar,
}: ChatHeaderProps) {
  return (
    <div
      className={`hidden md:flex items-center justify-between p-4 border-b border-white/10 bg-[#212121] transition-all duration-300 ${
        isCollapsed ? "ml-0" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {isCollapsed && onToggleSidebar && (
          <Button
            onClick={onToggleSidebar}
            className="p-2 h-8 w-8 bg-transparent hover:bg-white/10 text-white/70 hover:text-white rounded-md"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-center gap-2">
          <h1 className="text-[#FEFEFE] text-[17px] leading-[24px] font-light">
            ChatGPT
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
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
    </div>
  );
}
