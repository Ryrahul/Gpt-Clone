"use client";

import type React from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Plus, Mic, Paperclip, Brain } from "lucide-react";
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

  return (
    <div className="sticky bottom-0 left-0 right-0 w-full bg-[#212121] border-t border-white/10 z-10">
      <div className="max-w-3xl mx-auto p-3 sm:p-4">
        {showFileUpload && (
          <div className="mb-4">
            <FileUpload
              onFileUploaded={onFileUploaded}
              onFileRemoved={onFileRemoved}
              uploadedFiles={uploadedFiles}
              disabled={isLoading || externalLoading}
            />
          </div>
        )}

        <form onSubmit={onSubmit} className="relative">
          <div className="relative flex items-end bg-[#2f2f2f] rounded-3xl border border-white/20">
            <Button
              type="button"
              className="absolute left-2 sm:left-3 bottom-2 sm:bottom-3 p-1.5 sm:p-2 rounded-full bg-transparent hover:bg-white/10 text-white/70 hover:text-white h-7 w-7 sm:h-8 sm:w-8"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder="Ask anything about your files..."
              className="flex-1 resize-none bg-transparent text-white placeholder-white/50 py-2.5 sm:py-3 px-10 sm:px-12 focus:outline-none max-h-[150px] sm:max-h-[200px] min-h-[20px] sm:min-h-[24px] overflow-y-auto text-sm sm:text-base"
              style={{
                height: "auto",
                overflowY: "hidden",
              }}
              rows={1}
              disabled={isLoading || externalLoading}
            />

            <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 flex items-center gap-1 sm:gap-2">
              <Button
                type="button"
                onClick={onToggleFileUpload}
                className={`p-1.5 sm:p-2 rounded-full bg-transparent hover:bg-white/10 h-7 w-7 sm:h-8 sm:w-8 ${
                  showFileUpload || uploadedFiles.length > 0
                    ? "text-blue-400"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
                {uploadedFiles.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
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
                className="p-1.5 sm:p-2 rounded-full disabled:text-white/30 text-white transition-colors disabled:opacity-40 bg-white hover:bg-white/90 disabled:hover:bg-white/30 h-7 w-7 sm:h-8 sm:w-8"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
              </Button>
            </div>
          </div>
        </form>
        <div className="text-center text-xs text-white/50 mt-2 sm:mt-3 flex items-center justify-center gap-2">
          <Brain className="w-3 h-3" />
          <span>ChatGPT with memory - analyzes images & reads documents</span>
        </div>
      </div>
    </div>
  );
}
