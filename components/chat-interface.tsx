"use client";

import type React from "react";
import { useRef, useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Mic } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { Message } from "ai";
import { scrollToBottom, autoResizeTextarea } from "@/lib/utils";

interface ChatInterfaceProps {
  chatId: string | null;
  initialMessages: Message[];
  onUpdateChat?: (chatId: string, messages: Message[]) => Promise<void>;
  onCreateNewChat?: (messages: Message[]) => Promise<any>;
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
  const chatInstanceId = useRef<string>(
    `chat-${chatId || "new"}-${Date.now()}`
  );

  // Initialize useChat hook - this must be called unconditionally
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
    initialMessages: initialMessages,
    id: chatInstanceId.current,
    onFinish: () => {
      console.log("AI response finished");
    },
    onError: (error) => {
      console.error("Chat error:", error);
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        router.push("/sign-in");
      }
    },
  });

  // All useEffect hooks must be called unconditionally
  useEffect(() => {
    if (isLoaded) {
      setHasMounted(true);
    }
  }, [isLoaded]);

  // Restore pending message from sessionStorage after sign-in
  useEffect(() => {
    if (isSignedIn && !hasRestoredMessage && !chatId && hasMounted) {
      const pendingMessage = sessionStorage.getItem("pendingMessage");
      if (pendingMessage) {
        setInput(pendingMessage);
        sessionStorage.removeItem("pendingMessage");
        setHasRestoredMessage(true);
        // Auto-focus the textarea
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    }
  }, [isSignedIn, hasRestoredMessage, chatId, setInput, hasMounted]);

  // Save messages effect
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
        console.log("Saving messages:", messages);

        if (chatId && onUpdateChat) {
          await onUpdateChat(chatId, messages);
        } else if (!chatId && onCreateNewChat) {
          const newChat = await onCreateNewChat(messages);
          if (newChat && newChat._id) {
            chatIdRef.current = newChat._id;
          }
        }

        lastSavedLengthRef.current = messages.length;
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
  ]);

  // Chat change effect
  useEffect(() => {
    console.log("Chat changed:", chatId);
    console.log("Initial messages:", initialMessages);

    chatIdRef.current = chatId;
    lastSavedLengthRef.current = initialMessages.length;
    isSavingRef.current = false;

    chatInstanceId.current = `chat-${chatId || "new"}-${Date.now()}`;

    setMessages(initialMessages);
  }, [chatId, initialMessages, setMessages]);

  // Auto-scroll and resize textarea effect
  useEffect(() => {
    scrollToBottom(scrollAreaRef);
    autoResizeTextarea(textareaRef);
  }, [messages, input]);

  // Redirect effect for unauthenticated users
  useEffect(() => {
    if (hasMounted && isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [hasMounted, isLoaded, isSignedIn, router]);

  // All useCallback hooks must be called unconditionally
  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading || externalLoading) return;
      handleSubmit(e);
    },
    [input, isLoading, externalLoading, handleSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (input.trim() && !isLoading && !externalLoading) {
          handleSubmit(e);
        }
      }
    },
    [input, isLoading, externalLoading, handleSubmit]
  );

  // Early returns after all hooks have been called
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
      <div className="hidden md:flex items-center justify-between p-4 border-b border-white/10 bg-[#212121]">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium text-white">ChatGPT</h1>
          <svg
            className="w-4 h-4 text-white/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-[#212121]">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="w-full pb-4">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg m-4">
                <p className="text-red-400">Error: {error.message}</p>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-4">
                <div className="w-12 h-12 bg-[#10a37f] rounded-full flex items-center justify-center mb-6">
                  <svg
                    width="24"
                    height="24"
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
                <h1 className="text-3xl font-semibold text-white mb-8">
                  How can I help you today?
                </h1>
              </div>
            ) : (
              <div className="min-h-full">
                {messages.map((message, index) => (
                  <div
                    key={`${message.id}-${index}`}
                    className="w-full py-6 px-4"
                  >
                    <div className="max-w-3xl mx-auto">
                      {message.role === "user" ? (
                        <div className="flex justify-end mb-4">
                          <div className="max-w-[70%] bg-[#2f2f2f] rounded-3xl px-5 py-3 text-white">
                            {message.content}
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 mb-4">
                          <div className="flex-shrink-0">{AssistantIcon}</div>
                          <div className="flex-1 text-white whitespace-pre-wrap break-words leading-7">
                            {message.content}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="w-full py-6 px-4">
                    <div className="max-w-3xl mx-auto">
                      <div className="flex gap-4 mb-4">
                        <div className="flex-shrink-0">{AssistantIcon}</div>
                        <div className="flex-1 text-white">
                          <div className="result-streaming">
                            <span className="result-thinking">
                              <span></span>
                              <span></span>
                              <span></span>
                            </span>
                          </div>
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

      <div className="sticky bottom-0 left-0 right-0 w-full bg-[#212121] border-t border-white/10 z-10">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={handleFormSubmit} className="relative">
            <div className="relative flex items-end bg-[#2f2f2f] rounded-3xl border border-white/20">
              <Button
                type="button"
                className="absolute left-3 bottom-3 p-2 rounded-full bg-transparent hover:bg-white/10 text-white/70 hover:text-white h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="flex-1 resize-none bg-transparent text-white placeholder-white/50 py-3 px-12 focus:outline-none max-h-[200px] min-h-[24px] overflow-y-auto"
                style={{
                  height: "auto",
                  overflowY: "hidden",
                }}
                rows={1}
                disabled={isLoading || externalLoading}
              />

              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <Button
                  type="button"
                  className="p-2 rounded-full bg-transparent hover:bg-white/10 text-white/70 hover:text-white h-8 w-8"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading || externalLoading}
                  className="p-2 rounded-full disabled:text-white/30 text-white transition-colors disabled:opacity-40 bg-white hover:bg-white/90 disabled:hover:bg-white/30 h-8 w-8"
                >
                  <Send className="h-4 w-4 text-black" />
                </Button>
              </div>
            </div>
          </form>
          <div className="text-center text-xs text-white/50 mt-3">
            <span>ChatGPT can make mistakes. Check important info.</span>
          </div>
        </div>
      </div>
    </>
  );
}
