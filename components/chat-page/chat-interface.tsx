"use client";

import type React from "react";
import { useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { Message } from "ai";
import type { MessageAttachment } from "@/types/type";
import { autoResizeTextarea } from "@/lib/utils";
import type { UploadedFile } from "@/components/files/file-upload";
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
  isCollapsed?: boolean;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
  onSetMobileSidebarOpen?: (open: boolean) => void;
}

export function ChatInterface({
  chatId,
  initialMessages,
  onUpdateChat,
  onCreateNewChat,
  isLoading: externalLoading = false,
  isCollapsed = false,
  onToggleMobileSidebar,
  isMobileSidebarOpen = false,
  onSetMobileSidebarOpen,
}: ChatInterfaceProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
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

  //  CRITICAL FIX: Convert database attachments to experimental_attachments format as image was not persissted
  const messagesWithExperimentalAttachments = useCallback((): Message[] => {
    if (!initialMessages || initialMessages.length === 0) return [];

    return initialMessages.map((msg: any): Message => {
      const baseMessage: Message = {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      };

      // If message has attachments from database, convert to experimental_attachments(ai accepts the vercel one in this format)
      if (msg.attachments && msg.attachments.length > 0) {
        const experimentalAttachments = msg.attachments.map(
          (att: MessageAttachment) => ({
            name: att.name,
            contentType: att.mimeType,
            url: att.url,
            size: att.size,
            width: att.width,
            height: att.height,
          })
        );

        return {
          ...baseMessage,
          experimental_attachments: experimentalAttachments,
        } as Message;
      }

      return baseMessage;
    });
  }, [initialMessages]);

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
    append,
  } = useChat({
    api: "/api/chat",
    initialMessages: messagesWithExperimentalAttachments(),
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
   * SAVE MESSAGES useEffect - Simplified to work with fixed backend for image issues 
   */
  useEffect(() => {
    if (!isSignedIn || !hasMounted) return;

    const saveMessages = async () => {
      // Guard: Prevent concurrent saves
      if (isSavingRef.current || chatIdRef.current !== chatId) return;

      // Guard: Only save if we have new messages
      if (messages.length <= lastSavedLengthRef.current) return;

      // Guard: Don't save immediately after user messages (wait for AI response so that there is no inconsistencyy)
      if (messages.length > 0 && messages[messages.length - 1]?.role === "user")
        return;

      // Guard: Don't save while AI is still responding
      if (isLoading) return;

      try {
        isSavingRef.current = true;

        // Only collect global attachments from current session uploads
        let globalAttachments: MessageAttachment[] | undefined = undefined;

        if (uploadedFiles.length > 0) {
          globalAttachments = uploadedFiles.map((file) => ({
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
          }));
        }

        messages.forEach((msg, idx) => {
          if (
            msg.experimental_attachments &&
            msg.experimental_attachments.length > 0
          ) {
          }
        });

        // Handle existing chat updates
        if (chatId && onUpdateChat) {
          await onUpdateChat(chatId, messages, globalAttachments);
        }
        // Handle new chat creation
        else if (!chatId && onCreateNewChat) {
          const newChat = await onCreateNewChat(messages, globalAttachments);
          if (newChat && newChat._id) {
            chatIdRef.current = newChat._id;
          }
        }

        // Update tracking variables
        lastSavedLengthRef.current = messages.length;

        // Clean up uploaded files after successful save
        if (globalAttachments && globalAttachments.length > 0) {
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
    setUploadedFiles,
  ]);

  /**
   * CHAT INITIALIZATION useEffect - Handles chat switching and state reset
   */
  useEffect(() => {
    // Update refs to match new chat context
    chatIdRef.current = chatId;
    lastSavedLengthRef.current = initialMessages.length;
    isSavingRef.current = false;

    // Generate unique instance ID to prevent AI SDK conflicts
    chatInstanceId.current = `chat-${chatId || "new"}-${Date.now()}`;

    // CRITICAL FIX: Reinitialize with experimental_attachments restored (get preovious attachment paila ko )
    const messagesWithAttachments = messagesWithExperimentalAttachments();

    // Debug: Log which messages have attachments
    messagesWithAttachments.forEach((msg, idx) => {
      if (
        msg.experimental_attachments &&
        msg.experimental_attachments.length > 0
      ) {
      }
    });

    setMessages(messagesWithAttachments);

    // Clear all file-related state to prevent cross-chat contamination
    setUploadedFiles([]);
    setPendingFiles([]);
    setShowFileUpload(false);
  }, [
    chatId,
    initialMessages,
    messagesWithExperimentalAttachments,
    setMessages,
    setUploadedFiles,
    setPendingFiles,
    setShowFileUpload,
  ]);

  useEffect(() => {
    autoResizeTextarea(textareaRef);
  }, [input]);

  useEffect(() => {
    if (hasMounted && isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [hasMounted, isLoaded, isSignedIn, router]);

  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      const messageIndex = messages.findIndex((msg) => msg.id === messageId);
      if (messageIndex === -1) return;

      const truncatedMessages = messages.slice(0, messageIndex);
      setMessages(truncatedMessages);

      setTimeout(() => {
        append({
          role: "user",
          content: newContent,
        });
      }, 100);
    },
    [messages, setMessages, append]
  );

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading || externalLoading) return;

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
  };

  const handleFileRemoved = (fileId: string) => {
    const fileToRemove = uploadedFiles.find((f) => f.id === fileId);
    if (fileToRemove) {
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      setPendingFiles((prev) => prev.filter((f) => f !== fileToRemove.file));
    }
  };

  useEffect(() => {
    displayMessages.forEach((msg, idx) => {
      if (
        msg.experimental_attachments &&
        msg.experimental_attachments.length > 0
      ) {
      }
    });
  }, [displayMessages]);

  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center h-full bg-[#212121]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[#10a37f] rounded-full flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white animate-pulse"
            >
              <path
                d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="text-white/70 text-sm font-light">
            Initializing ChatGPT...
          </div>
        </div>
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
        isCollapsed={isCollapsed}
        onToggleMobileSidebar={onToggleMobileSidebar}
      />

      <ChatMessagesArea
        displayMessages={displayMessages}
        isLoading={isLoading}
        messages={messages}
        error={error}
        onEditMessage={handleEditMessage}
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
