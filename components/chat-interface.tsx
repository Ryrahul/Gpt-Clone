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
import { ChatMessagesArea } from "@/components/chat/chat-message-area";
import { useChatState } from "@/hooks/use-chat-state";
import { useMessageTransformer } from "@/hooks/use-message-transformer";
import { useMessageDisplay } from "@/hooks/use-message-display";

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

  /**
   * SAVE MESSAGES useEffect - Complex message persistence logic
   *
   * WHY WE USE THIS APPROACH:
   * This useEffect handles saving chat messages to the database after AI responses complete.
   * We're forced to use this pattern due to limitations in the AI SDK's useChat hook.
   *
   * BETTER APPROACH WOULD BE:
   * Ideally, we'd save messages directly in the useChat's onFinish callback, which would be
   * cleaner and more straightforward. However, this doesn't work because:
   * 1. onFinish doesn't contain the latest complete message state (missing last 2 messages)
   * 2. onFinish only provides the assistant's response message, not the full conversation
   * 3. Attempting to modify other state within onFinish causes weird behavior and state conflicts
   * 4. The timing of onFinish vs state updates creates race conditions
   *
   * CURRENT APPROACH EXPLANATION:
   * - We watch the messages array and trigger saves when it changes
   * - Multiple guards prevent unnecessary saves and race conditions
   * - We only save after AI responses complete (not after user messages)
   * - Complex attachment handling merges current session files with database files
   * - Refs are used to prevent stale closure issues in the async function
   *
   * TRADE-OFFS:
   * ✅ Reliable message persistence
   * ✅ Handles attachments correctly
   * ✅ Prevents duplicate saves
   * ❌ Complex logic that's hard to follow
   * ❌ Multiple useEffect dependencies
   * ❌ Potential for race conditions if not carefully managed
   */
  useEffect(() => {
    if (!isSignedIn || !hasMounted) return;

    const saveMessages = async () => {
      // Guard: Prevent concurrent saves
      if (isSavingRef.current || chatIdRef.current !== chatId) return;

      // Guard: Only save if we have new messages
      if (messages.length <= lastSavedLengthRef.current) return;

      // Guard: Don't save immediately after user messages (wait for AI response)
      if (messages.length > 0 && messages[messages.length - 1]?.role === "user")
        return;

      // Guard: Don't save while AI is still responding
      if (isLoading) return;

      try {
        isSavingRef.current = true;

        // Process uploaded files into attachment format
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

        // Handle existing chat updates
        if (chatId && onUpdateChat) {
          const messagesWithAttachments = messages.map((msg) => {
            // Check if message has attachments from current session
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

            // Check if message should have attachments from database
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
        }
        // Handle new chat creation
        else if (!chatId && onCreateNewChat) {
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

        // Update tracking variables
        lastSavedLengthRef.current = messages.length;

        // Clean up uploaded files after successful save
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

  /**
   * CHAT INITIALIZATION useEffect - Handles chat switching and state reset
   *
   * WHY WE NEED THIS:
   * This useEffect runs when the user switches between different chats or creates a new chat.
   * It's essential for maintaining proper state isolation between different conversations.
   *
   * WHAT IT DOES:
   * 1. Resets all refs to match the new chat context
   * 2. Generates a new unique chat instance ID for the AI SDK
   * 3. Reinitializes the useChat hook with clean messages (no attachments)
   * 4. Clears file upload state to prevent cross-chat contamination
   * 5. Resets UI state like file upload visibility
   *
   * WHY NOT A SIMPLER APPROACH:
   * We can't just update individual pieces of state because:
   * - The useChat hook needs to be completely reinitialized with new messages
   * - File state must be cleared to prevent files from one chat appearing in another
   * - Refs need to be updated to prevent stale references in async operations
   * - The chat instance ID must be unique to prevent AI SDK conflicts
   *
   * CRITICAL FOR:
   * - Preventing message leakage between chats
   * - Ensuring file uploads don't persist across chat switches
   * - Maintaining proper save state tracking
   * - Avoiding race conditions in async save operations
   */
  useEffect(() => {
    console.log("Chat changed:", chatId);
    console.log("Initial messages:", initialMessages.length);

    // Update refs to match new chat context
    chatIdRef.current = chatId;
    lastSavedLengthRef.current = initialMessages.length;
    isSavingRef.current = false;

    // Generate unique instance ID to prevent AI SDK conflicts
    chatInstanceId.current = `chat-${chatId || "new"}-${Date.now()}`;

    // Reinitialize useChat with clean messages (attachments removed for AI SDK)
    setMessages(cleanMessagesForAI);

    // Clear all file-related state to prevent cross-chat contamination
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
