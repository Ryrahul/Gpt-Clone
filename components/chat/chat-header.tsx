"use client";
import { useRouter } from "next/navigation";

import { Brain, Paperclip, PanelLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import type { UploadedFile } from "@/components/files/file-upload";

interface ChatHeaderProps {
  showMemoryIndicator: boolean;
  uploadedFiles: UploadedFile[];
  isCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
}

export function ChatHeader({
  showMemoryIndicator,
  uploadedFiles,
  isCollapsed = false,
  onToggleSidebar,
  onToggleMobileSidebar,
}: ChatHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-[#212121] transition-all duration-300 ${
        isCollapsed ? "ml-0" : ""
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu button */}
        {onToggleMobileSidebar && (
          <Button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 h-7 w-7 bg-transparent hover:bg-white/10 text-white/70 hover:text-white rounded-md"
          >
            <Menu className="h-3 w-3" />
          </Button>
        )}

        {/* Desktop collapsed sidebar toggle */}
        {isCollapsed && onToggleSidebar && (
          <Button
            onClick={onToggleSidebar}
            className="hidden md:block p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8 bg-transparent hover:bg-white/10 text-white/70 hover:text-white rounded-md"
          >
            <PanelLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              const router = useRouter();
              router.push("/");
            }}
            className="hover:opacity-80 transition-opacity"
          >
            <h1 className="text-[#FEFEFE] text-[15px] sm:text-[17px] leading-[20px] sm:leading-[24px] font-light cursor-pointer">
              ChatGPT
            </h1>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {showMemoryIndicator && (
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-400 animate-pulse">
            <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Memory updated</span>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-blue-400">
            <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""}
            </span>
            <span className="sm:hidden">{uploadedFiles.length}</span>
          </div>
        )}

        {/* User Profile */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-6 h-6 sm:w-8 sm:h-8",
            },
          }}
        />
      </div>
    </div>
  );
}
