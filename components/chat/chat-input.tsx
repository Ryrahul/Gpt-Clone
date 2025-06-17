"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Mic, Paperclip, Brain, Settings, ArrowUp } from "lucide-react";
import { FileUpload, type UploadedFile } from "@/components/files/file-upload";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  externalLoading: boolean;
  showFileUpload: boolean;
  uploadedFiles: UploadedFile[];
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onToggleFileUpload: () => void;
  onFileUploaded: (uploadedFile: UploadedFile, nativeFile: File) => void;
  onFileRemoved: (fileId: string) => void;
}

export function ChatInput({
  input,
  isLoading,
  externalLoading,
  showFileUpload,
  uploadedFiles,
  onInputChange,
  onKeyDown,
  onSubmit,
  onToggleFileUpload,
  onFileUploaded,
  onFileRemoved,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle mobile keyboard visibility
  useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => {
      // On mobile, when keyboard appears, viewport height changes
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  return (
    <div className="sticky bottom-0 left-0 right-0 w-full bg-[#212121] z-10">
      <div className="max-w-3xl sm:max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
        {showFileUpload && (
          <div className="mb-3 sm:mb-4">
            <FileUpload
              onFileUploaded={onFileUploaded}
              onFileRemoved={onFileRemoved}
              uploadedFiles={uploadedFiles}
              disabled={isLoading || externalLoading}
            />
          </div>
        )}

        <form onSubmit={onSubmit} className="relative">
          <div className="relative flex items-center bg-[#2f2f2f] rounded-2xl sm:rounded-3xl min-h-[56px] sm:min-h-[64px] md:min-h-[72px] px-3 sm:px-4 md:px-6">
            {/* Left side buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                type="button"
                className="p-1.5 sm:p-2 rounded-full bg-transparent hover:bg-white/10 text-white/70 hover:text-white h-7 w-7 sm:h-8 sm:w-8"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                type="button"
                className="flex items-center gap-1 sm:gap-2 bg-transparent hover:bg-white/10 text-white/70 hover:text-white px-0 py-0 h-auto border-0"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-[14px] font-light hidden sm:inline">
                  Tools
                </span>
              </Button>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder="Ask anything"
              className="flex-1 resize-none bg-transparent text-white placeholder-white/50 py-3 sm:py-4 px-3 sm:px-4 focus:outline-none max-h-[120px] sm:max-h-[150px] min-h-[28px] sm:min-h-[32px] overflow-y-auto text-[16px] sm:text-[16px] font-light"
              style={{
                height: "auto",
                overflowY: "hidden",
              }}
              rows={1}
              disabled={isLoading || externalLoading}
            />

            {/* Right side buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                type="button"
                onClick={onToggleFileUpload}
                className={`p-1.5 sm:p-2 rounded-full bg-transparent hover:bg-white/10 h-7 w-7 sm:h-8 sm:w-8 relative ${
                  showFileUpload || uploadedFiles.length > 0
                    ? "text-blue-400"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
                {uploadedFiles.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-[10px] sm:text-xs">
                    {uploadedFiles.length}
                  </span>
                )}
              </Button>
              <Button
                type="button"
                className="p-1.5 sm:p-2 rounded-full bg-transparent hover:bg-white/10 text-white/70 hover:text-white h-7 w-7 sm:h-8 sm:w-8"
              >
                <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                type="submit"
                disabled={!input.trim() || isLoading || externalLoading}
                className={`p-1.5 sm:p-2 rounded-full h-7 w-7 sm:h-8 sm:w-8 transition-all duration-200 ${
                  input.trim() && !isLoading && !externalLoading
                    ? "bg-white hover:bg-white/90 text-black"
                    : "bg-white/20 text-white/40 cursor-not-allowed hover:bg-white/20"
                }`}
              >
                <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </form>

        <div className="text-center text-xs sm:text-xs text-white/50 mt-2 sm:mt-3 flex items-center justify-center gap-1 sm:gap-2">
          <Brain className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="text-[10px] sm:text-xs">
            ChatGPT with memory - analyzes images & reads documents
          </span>
        </div>
      </div>
    </div>
  );
}
