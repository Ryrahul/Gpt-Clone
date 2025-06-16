"use client";

import type React from "react";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Mic } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import type { Message } from "ai";

interface ChatInterfaceProps {
  chatId: string | null;
  initialMessages: Message[];
  onUpdateChat?: (chatId: string, messages: Message[]) => void;
  onCreateNewChat?: (messages: Message[]) => void;
}

function convertToDbMessage(message: Message): Message {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
  };
}

function convertToAiMessage(message: Message): Message {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    ...(message.parts ? { parts: message.parts } : {}),
  };
}

export function ChatInterface({
  chatId,
  initialMessages,
  onUpdateChat,
  onCreateNewChat,
}: ChatInterfaceProps) {
  const [hasCreatedChat, setHasCreatedChat] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastSavedMessageCount, setLastSavedMessageCount] = useState(0);
  const [pendingUserMessage, setPendingUserMessage] = useState<Message | null>(
    null
  );

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
    onFinish: () => {
      console.log("onFinish called");
      setPendingUserMessage(null);
    },
  });

  useEffect(() => {
    if (pendingUserMessage && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage.role === "user" &&
        lastMessage.content === pendingUserMessage.content
      ) {
        setPendingUserMessage(null);
      }
    }
  }, [messages, pendingUserMessage]);

  const displayMessages = useMemo(() => {
    const baseMessages = messages;
    if (
      pendingUserMessage &&
      !baseMessages.find(
        (m) => m.content === pendingUserMessage.content && m.role === "user"
      )
    ) {
      return [...baseMessages, pendingUserMessage];
    }
    return baseMessages;
  }, [messages, pendingUserMessage]);

  const debouncedSave = useCallback(
    async (messagesToSave: Message[]) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const dbMessages = messagesToSave.map(convertToDbMessage);
          console.log("Saving messages:", dbMessages.length);

          if (chatId && onUpdateChat) {
            await onUpdateChat(chatId, dbMessages);
          } else if (!chatId && onCreateNewChat && !hasCreatedChat) {
            setHasCreatedChat(true);
            setIsTransitioning(true);
            await onCreateNewChat(dbMessages);
          }

          setLastSavedMessageCount(messagesToSave.length);
        } catch (error) {
          console.error("Error saving messages:", error);
        }
      }, 500);
    },
    [chatId, onUpdateChat, onCreateNewChat, hasCreatedChat]
  );

  useEffect(() => {
    console.log(
      "Chat initialization - chatId:",
      chatId,
      "initialMessages:",
      initialMessages.length
    );

    if (chatId && initialMessages.length > 0) {
      const aiMessages = initialMessages.map(convertToAiMessage);
      setMessages(aiMessages);
      setLastSavedMessageCount(aiMessages.length);
      setHasCreatedChat(false);
      setIsTransitioning(false);
      setPendingUserMessage(null);
    } else if (!chatId) {
      setMessages([]);
      setLastSavedMessageCount(0);
      setHasCreatedChat(false);
      setIsTransitioning(false);
      setPendingUserMessage(null);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [chatId, initialMessages, setMessages]);

  useEffect(() => {
    const shouldSave =
      messages.length > 0 &&
      messages.length > lastSavedMessageCount &&
      messages[messages.length - 1]?.role === "assistant" &&
      !isLoading;

    if (shouldSave) {
      debouncedSave(messages);
    }
  }, [messages, isLoading, lastSavedMessageCount, debouncedSave]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [displayMessages, input]);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading || isTransitioning) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: input.trim(),
      };

      setPendingUserMessage(userMessage);
      handleSubmit(e);
    },
    [input, isLoading, isTransitioning, handleSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!input.trim() || isLoading || isTransitioning) return;

        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: "user",
          content: input.trim(),
        };

        setPendingUserMessage(userMessage);
        handleSubmit(e as any);
      }
    },
    [input, isLoading, isTransitioning, handleSubmit]
  );

  const AssistantIcon = useMemo(
    () => (
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
    ),
    []
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
            {displayMessages.length === 0 ? (
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
                {displayMessages.map((message, index) => (
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

                {(isLoading || isTransitioning) && (
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

        {isTransitioning && (
          <div className="absolute inset-0 bg-[#212121] bg-opacity-50 flex items-center justify-center z-10">
            <div className="text-white text-sm">Creating chat...</div>
          </div>
        )}
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
                disabled={isLoading || isTransitioning}
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
                  disabled={!input.trim() || isLoading || isTransitioning}
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
