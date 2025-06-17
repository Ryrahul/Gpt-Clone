"use client";

import type React from "react";
import { useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { Message } from "ai";
import type { MessageAttachment } from "@/types/type";
import { scrollToBottom, autoResizeTextarea } from "@/lib/utils";
import type { UploadedFile } from "@/components/file-upload";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { useChatState } from "@/hooks/use-chat-state";
import { useMessageDisplay } from "@/hooks/use-message-display";
import { useMessageTransformer } from "@/hooks/use-message-transformer";
import { ChatMessagesArea } from "./chat/chat-message-area";

interface ChatInterfaceProps {
  chatId: string | null;
  initialMessages: any[];
  onUpdateChat?: (
    chatId: string,
    messages: Message[],
    attachments?: MessageAttachment[]
  ) => Promise<void>;
  onCreateNewChat?: (
    messages: Message[],
    attachments?: MessageAttachment[]
  ) => Promise<any>;
  isLoading?: boolean;
}

export function ChatInterface({
  chatId,
  initialMessages,
  onUpdateChat,
  onCreateNewChat,
  isLoading: externalLoading = false,
}: ChatInterfaceProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
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
  } = useChatState(chatId, initialMessages);

  const { transformedMessages, cleanMessagesForAI } =
    useMessageTransformer(initialMessages);

  useEffect(() => {
    if (isLoaded) {
      setHasMounted(true);
    }
  }, [isLoaded, setHasMounted]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    setInput,
    error,
  } = useChat({
    api: "/api/chat",
    initialMessages: cleanMessagesForAI,
    id: chatInstanceId.current,
    onFinish: (message) => {
      console.log("AI response finished");
      setShowFileUpload(false);
      setPendingFiles([]);

      setTimeout(() => {
        setShowMemoryIndicator(true);
        setTimeout(() => setShowMemoryIndicator(false), 2000);
      }, 100);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setPendingFiles([]);

      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        router.push("/sign-in");
      }
    },
  });

  const displayMessages = useMessageDisplay(messages, transformedMessages);

  useEffect(() => {
    if (isSignedIn && !hasRestoredMessage && !chatId && hasMounted) {
      const pendingMessage = sessionStorage.getItem("pendingMessage");
      if (pendingMessage) {
        setInput(pendingMessage);
        sessionStorage.removeItem("pendingMessage");
        setHasRestoredMessage(true);
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    }
  }, [
    isSignedIn,
    hasRestoredMessage,
    chatId,
    setInput,
    hasMounted,
    setHasRestoredMessage,
  ]);

  useEffect(() => {
    if (!isSignedIn || !hasMounted) return;

    const saveMessages = async () => {
      if (isSavingRef.current || chatIdRef.current !== chatId) return;
      if (messages.length <= lastSavedLengthRef.current) return;
      if (messages.length > 0 && messages[messages.length - 1]?.role === "user")
        return;
      if (isLoading) return;

      try {
        isSavingRef.current = true;

        const allAttachments: MessageAttachment[] = [];

        if (uploadedFiles.length > 0) {
          const userMessageAttachments: MessageAttachment[] = uploadedFiles.map(
            (file, index) => ({
              id: file.id,
              url: file.url,
              name: file.name,
              type: file.type,
              mimeType: file.mimeType,
              size: file.size,
              width: file.width,
              height: file.height,
              pages: file.pages,
              provider: file.provider,
            })
          );
          allAttachments.push(...userMessageAttachments);
        }

        console.log(
          "Saving messages:",
          messages.length,
          "total attachments:",
          allAttachments.length
        );

        if (chatId && onUpdateChat) {
          const messagesWithAttachments = messages.map((msg) => {
            if (
              msg.experimental_attachments &&
              msg.experimental_attachments.length > 0
            ) {
              return {
                ...msg,
                attachments: msg.experimental_attachments.map((att) => ({
                  name: att.name || "Unknown",
                  mimeType: att.contentType || "application/octet-stream",
                  size: (att as any).size || 0,
                  url: att.url,
                })),
              };
            }

            const originalMsg = transformedMessages.find(
              (orig) => orig.id === msg.id
            );
            if (
              originalMsg &&
              originalMsg.experimental_attachments &&
              originalMsg.experimental_attachments.length > 0
            ) {
              return {
                ...msg,
                attachments: originalMsg.experimental_attachments.map(
                  (att) => ({
                    name: att.name || "Unknown",
                    mimeType: att.contentType || "application/octet-stream",
                    size: (att as any).size || 0,
                    url: att.url,
                  })
                ),
              };
            }

            return msg;
          });

          await onUpdateChat(
            chatId,
            messagesWithAttachments,
            allAttachments.length > 0 ? allAttachments : undefined
          );
        } else if (!chatId && onCreateNewChat) {
          const messagesWithAttachments = messages.map((msg) => {
            if (
              msg.experimental_attachments &&
              msg.experimental_attachments.length > 0
            ) {
              return {
                ...msg,
                attachments: msg.experimental_attachments.map((att) => ({
                  name: att.name || "Unknown",
                  mimeType: att.contentType || "application/octet-stream",
                  size: (att as any).size || 0,
                  url: att.url,
                })),
              };
            }

            const originalMsg = transformedMessages.find(
              (orig) => orig.id === msg.id
            );
            if (
              originalMsg &&
              originalMsg.experimental_attachments &&
              originalMsg.experimental_attachments.length > 0
            ) {
              return {
                ...msg,
                attachments: originalMsg.experimental_attachments.map(
                  (att) => ({
                    name: att.name || "Unknown",
                    mimeType: att.contentType || "application/octet-stream",
                    size: (att as any).size || 0,
                    url: att.url,
                  })
                ),
              };
            }

            return msg;
          });

          const newChat = await onCreateNewChat(
            messagesWithAttachments,
            allAttachments.length > 0 ? allAttachments : undefined
          );
          if (newChat && newChat._id) {
            chatIdRef.current = newChat._id;
          }
        }

        lastSavedLengthRef.current = messages.length;

        if (allAttachments.length > 0) {
          setUploadedFiles([]);
        }
      } catch (error) {
        console.error("Error saving messages:", error);
        if (error instanceof Error && error.message.includes("Unauthorized")) {
          router.push("/sign-in");
        }
      } finally {
        isSavingRef.current = false;
      }
    };

    saveMessages();
  }, [
    messages,
    isLoading,
    chatId,
    onUpdateChat,
    onCreateNewChat,
    router,
    isSignedIn,
    hasMounted,
    uploadedFiles,
  ]);

  useEffect(() => {
    console.log("Chat changed:", chatId);
    console.log("Initial messages:", initialMessages.length);

    chatIdRef.current = chatId;
    lastSavedLengthRef.current = initialMessages.length;
    isSavingRef.current = false;

    chatInstanceId.current = `chat-${chatId || "new"}-${Date.now()}`;

    setMessages(cleanMessagesForAI);
    setUploadedFiles([]);
    setPendingFiles([]);
    setShowFileUpload(false);
  }, [
    chatId,
    initialMessages,
    setMessages,
    setUploadedFiles,
    setPendingFiles,
    setShowFileUpload,
  ]);

  useEffect(() => {
    scrollToBottom(scrollAreaRef);
    autoResizeTextarea(textareaRef);
  }, [displayMessages, input]);

  useEffect(() => {
    if (hasMounted && isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [hasMounted, isLoaded, isSignedIn, router]);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading || externalLoading) return;

      console.log("Submitting with pending files:", pendingFiles.length);

      if (pendingFiles.length > 0) {
        const dataTransfer = new DataTransfer();
        pendingFiles.forEach((file) => {
          if (file && file.size > 0) {
            dataTransfer.items.add(file);
          }
        });
        const fileList = dataTransfer.files;

        handleSubmit(e, {
          experimental_attachments: fileList,
        });
      } else {
        handleSubmit(e);
      }
    },
    [input, isLoading, externalLoading, handleSubmit, pendingFiles]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (input.trim() && !isLoading && !externalLoading) {
          const syntheticEvent = {
            preventDefault: () => {},
            currentTarget: (e.currentTarget as HTMLElement).closest("form"),
          } as React.FormEvent<HTMLFormElement>;

          if (pendingFiles.length > 0) {
            const dataTransfer = new DataTransfer();
            pendingFiles.forEach((file) => {
              if (file && file.size > 0) {
                dataTransfer.items.add(file);
              }
            });
            const fileList = dataTransfer.files;

            handleSubmit(syntheticEvent, {
              experimental_attachments: fileList,
            });
          } else {
            handleSubmit(syntheticEvent);
          }
        }
      }
    },
    [input, isLoading, externalLoading, handleSubmit, pendingFiles]
  );

  const handleFileUploaded = (uploadedFile: UploadedFile, nativeFile: File) => {
    setUploadedFiles((prev) => [...prev, uploadedFile]);
    setPendingFiles((prev) => [...prev, nativeFile]);
    console.log("File uploaded:", uploadedFile.name, "to", uploadedFile.url);
  };

  const handleFileRemoved = (fileId: string) => {
    const fileToRemove = uploadedFiles.find((f) => f.id === fileId);
    if (fileToRemove) {
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      setPendingFiles((prev) => prev.filter((f) => f !== fileToRemove.file));
    }
  };

  useEffect(() => {
    console.log("Display messages updated:", displayMessages.length);
    displayMessages.forEach((msg, idx) => {
      if (
        msg.experimental_attachments &&
        msg.experimental_attachments.length > 0
      ) {
        console.log(
          `Message ${idx} has ${msg.experimental_attachments.length} attachments:`,
          msg.experimental_attachments
        );
      }
    });
  }, [displayMessages]);

  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center h-full bg-[#212121]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-full bg-[#212121]">
        <div className="text-white">Redirecting to sign in...</div>
      </div>
    );
  }

  return (
    <>
      <ChatHeader
        showMemoryIndicator={showMemoryIndicator}
        uploadedFiles={uploadedFiles}
      />

      <ChatMessagesArea
        displayMessages={displayMessages}
        isLoading={isLoading}
        messages={messages}
        error={error}
      />

      <ChatInput
        input={input}
        isLoading={isLoading}
        externalLoading={externalLoading}
        showFileUpload={showFileUpload}
        uploadedFiles={uploadedFiles}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSubmit={handleFormSubmit}
        onToggleFileUpload={() => setShowFileUpload(!showFileUpload)}
        onFileUploaded={handleFileUploaded}
        onFileRemoved={handleFileRemoved}
      />
    </>
  );
}
