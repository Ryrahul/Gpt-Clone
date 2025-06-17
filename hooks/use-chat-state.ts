"use client";

import { useRef, useState } from "react";
import type { UploadedFile } from "@/components/files/file-upload";

export function useChatState(chatId: string | null, initialMessages: any[]) {
  const lastSavedLengthRef = useRef<number>(initialMessages.length);
  const isSavingRef = useRef<boolean>(false);
  const chatIdRef = useRef<string | null>(chatId);
  const chatInstanceId = useRef<string>(
    `chat-${chatId || "new"}-${Date.now()}`
  );

  const [hasMounted, setHasMounted] = useState(false);
  const [hasRestoredMessage, setHasRestoredMessage] = useState(false);
  const [showMemoryIndicator, setShowMemoryIndicator] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  return {
    lastSavedLengthRef,
    isSavingRef,
    chatIdRef,
    chatInstanceId,
    hasMounted,
    setHasMounted,
    hasRestoredMessage,
    setHasRestoredMessage,
    showMemoryIndicator,
    setShowMemoryIndicator,
    showFileUpload,
    setShowFileUpload,
    uploadedFiles,
    setUploadedFiles,
    pendingFiles,
    setPendingFiles,
  };
}
