"use client";

import type React from "react";
import { useRef, useEffect, useCallback, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@ai-sdk/react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { Message } from "ai";
import type { MessageAttachment } from "@/types/type";
import { scrollToBottom, autoResizeTextarea } from "@/lib/utils";
import type { UploadedFile } from "@/components/file-upload";
import { TypingIndicator } from "@/components/typing-indicator";
import { ChatEmptyState } from "./chat/chat-empty-state";
import { ChatHeader } from "./chat/chat-header";
import { ChatInput } from "./chat/chat-input";
import { ChatMessage } from "./chat/chat-message";

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
  const lastSavedLengthRef = useRef<number>(initialMessages.length);
  const isSavingRef = useRef<boolean>(false);
  const chatIdRef = useRef<string | null>(chatId);
  const [hasMounted, setHasMounted] = useState(false);
  const [hasRestoredMessage, setHasRestoredMessage] = useState(false);
  const [showMemoryIndicator, setShowMemoryIndicator] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const chatInstanceId = useRef<string>(
    `chat-${chatId || "new"}-${Date.now()}`
  );

  // Transform messages and keep attachments for display, but create clean versions for AI SDK
  const transformedMessages: Message[] = initialMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt,
    experimental_attachments:
      msg.attachments?.map((attachment: MessageAttachment) => ({
        name: attachment.name,
        contentType: attachment.mimeType,
        size: attachment.size,
        url: attachment.url,
      })) || [],
  }));

  // Create clean messages for AI SDK (without attachments to prevent stream errors)
  const cleanMessagesForAI: Message[] = initialMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt,
    experimental_attachments: [],
  }));

  useEffect(() => {
    if (isLoaded) {
      setHasMounted(true);
    }
  }, [isLoaded]);

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
      setIsWaitingForResponse(false);
      setShowFileUpload(false);
      setPendingFiles([]);

      setTimeout(() => {
        setShowMemoryIndicator(true);
        setTimeout(() => setShowMemoryIndicator(false), 2000);
      }, 100);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setIsWaitingForResponse(false);
      setPendingFiles([]);

      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        router.push("/sign-in");
      }
    },
  });

  // Merge AI SDK messages with original attachments for display
  const displayMessages = messages.map((msg, index) => {
    const originalMessage = transformedMessages.find(
      (original) => original.id === msg.id
    );

    if (originalMessage) {
      return {
        ...msg,
        experimental_attachments:
          originalMessage.experimental_attachments || [],
      };
    }

    return {
      ...msg,
      experimental_attachments: msg.experimental_attachments || [],
    };
  });

  // Track when we start waiting for a response
  useEffect(() => {
    if (
      isLoading &&
      messages.length > 0 &&
      messages[messages.length - 1]?.role === "user"
    ) {
      setIsWaitingForResponse(true);
    } else if (!isLoading) {
      setIsWaitingForResponse(false);
    }
  }, [isLoading, messages]);

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
  }, [isSignedIn, hasRestoredMessage, chatId, setInput, hasMounted]);

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
          const messagesWithAttachments = messages.map((msg, index) => {
            if (
              msg.experimental_attachments &&
              msg.experimental_attachments.length > 0
            ) {
              return {
                ...msg,
                attachments: msg.experimental_attachments.map((att) => ({
                  name: att.name,
                  mimeType: att.contentType,
                  // size: att.size,
                  url: att.url,
                })),
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
          const messagesWithAttachments = messages.map((msg, index) => {
            if (
              msg.experimental_attachments &&
              msg.experimental_attachments.length > 0
            ) {
              return {
                ...msg,
                attachments: msg.experimental_attachments.map((att) => ({
                  name: att.name,
                  mimeType: att.contentType,
                  // size: att.size,
                  url: att.url,
                })),
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
    setIsWaitingForResponse(false);
  }, [chatId, initialMessages, setMessages]);

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
      setIsWaitingForResponse(true);

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
          setIsWaitingForResponse(true);

          const syntheticEvent = {
            preventDefault: () => {},
            currentTarget: e.currentTarget.closest("form"),
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

  const AssistantIcon = (
    <div className="w-8 h-8 bg-[#10a37f] rounded-full flex items-center justify-center">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        className="text-white"
      >
        <path
          d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );

  return (
    <>
      <ChatHeader
        showMemoryIndicator={showMemoryIndicator}
        uploadedFiles={uploadedFiles}
      />

      <div className="flex-1 overflow-hidden bg-[#212121]">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="w-full pb-4">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg m-4">
                <p className="text-red-400">Error: {error.message}</p>
              </div>
            )}

            {displayMessages.length === 0 ? (
              <ChatEmptyState />
            ) : (
              <div className="min-h-full">
                {displayMessages.map((message, index) => (
                  <ChatMessage
                    key={`${message.id}-${index}`}
                    message={message}
                    index={index}
                  />
                ))}

                {isWaitingForResponse && (
                  <div className="w-full py-6 px-4">
                    <div className="max-w-3xl mx-auto">
                      <div className="flex gap-4 mb-4">
                        <div className="flex-shrink-0">{AssistantIcon}</div>
                        <div className="flex-1">
                          <TypingIndicator />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

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
