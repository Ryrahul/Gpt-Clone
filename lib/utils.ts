import type React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple scroll utility
export const scrollToBottom = (
  scrollAreaRef: React.RefObject<HTMLDivElement | null>
) => {
  if (scrollAreaRef.current) {
    const scrollContainer = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }
};

// Simple textarea auto-resize
export const autoResizeTextarea = (
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
) => {
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }
};
