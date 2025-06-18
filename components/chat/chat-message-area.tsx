"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "ai";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatEmptyState } from "@/components/chat/chat-empty-state";

interface ChatMessagesAreaProps {
  displayMessages: Message[];
  isLoading: boolean;
  messages: Message[];
  error: Error | undefined;
  onEditMessage?: (messageId: string, newContent: string) => void;
}

const AssistantIcon = (
  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#10a37f] rounded-full flex items-center justify-center">
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className="text-white sm:w-4 sm:h-4"
    >
      <path
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
        fill="currentColor"
      />
    </svg>
  </div>
);

export function ChatMessagesArea({
  displayMessages,
  isLoading,
  messages,
  error,
  onEditMessage,
}: ChatMessagesAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(displayMessages.length);
  const lastMessageContentRef = useRef("");
  const lastUserScrollRef = useRef<number>(0);
  const scrollDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = useCallback(
    (force = false) => {
      const viewport = scrollViewportRef.current;
      if (!viewport) return;

      const now = Date.now();
      const recentUserScroll =
        lastUserScrollRef.current && now - lastUserScrollRef.current < 2000;

      if (!force && (!shouldAutoScroll || recentUserScroll)) {
        return;
      }

      if (isMobile && !force) {
        const { scrollTop, scrollHeight, clientHeight } = viewport;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        if (!isAtBottom) return;
      }

      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "smooth",
      });
    },
    [shouldAutoScroll, isMobile]
  );

  useEffect(() => {
    // Mobile detection
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;
      if (viewport) {
        scrollViewportRef.current = viewport;
      }
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const checkScrollPosition = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const threshold = isMobile ? 200 : 100;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold;

      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
      scrollDebounceRef.current = setTimeout(() => {
        setShouldAutoScroll(isNearBottom);
      }, 150);
    };

    const handleScroll = () => {
      lastUserScrollRef.current = Date.now();
      checkScrollPosition();
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });

    const messageCountChanged =
      displayMessages.length !== lastMessageCountRef.current;
    const lastMessage = displayMessages[displayMessages.length - 1];
    const lastMessageContent = lastMessage?.content || "";
    const messageContentChanged =
      lastMessageContent !== lastMessageContentRef.current;

    lastMessageCountRef.current = displayMessages.length;
    lastMessageContentRef.current = lastMessageContent;

    let scrollTimeout: NodeJS.Timeout | undefined;

    if (messageCountChanged || messageContentChanged || isLoading) {
      scrollTimeout = setTimeout(
        () => {
          requestAnimationFrame(() => {
            scrollToBottom(messageCountChanged);
          });
        },
        messageCountChanged ? 100 : 50
      );
    }

    if (displayMessages.length === 1) {
      const initialScrollTimeout = setTimeout(() => {
        scrollToBottom(true);
      }, 300);

      return () => {
        viewport.removeEventListener("scroll", handleScroll);
        clearTimeout(scrollTimeout);
        clearTimeout(initialScrollTimeout);
      };
    }

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [displayMessages, isLoading, isMobile, scrollToBottom]);

  const hasAIStartedResponding =
    messages.length > 0 && messages[messages.length - 1]?.role === "assistant";

  return (
    <div className="flex-1 overflow-hidden bg-[#212121] relative">
      <ScrollArea ref={scrollAreaRef} className="h-full" type="auto">
        {displayMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <ChatEmptyState />
          </div>
        ) : (
          <div className="w-full pb-2 sm:pb-4">
            {error && (
              <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg m-3 sm:m-4">
                <p className="text-red-400 text-sm sm:text-base">
                  Error: {error.message}
                </p>
              </div>
            )}

            <div className="min-h-full">
              {displayMessages.map((message, index) => (
                <ChatMessage
                  key={`${message.id}-${index}`}
                  message={message}
                  index={index}
                  onEditMessage={onEditMessage}
                  isEditable={message.role === "user"}
                />
              ))}

              {isLoading && (
                <div className="w-full py-4 sm:py-6 px-3 sm:px-4">
                  <div className="max-w-2xl sm:max-w-3xl mx-auto">
                    {!hasAIStartedResponding ? (
                      <div className="flex gap-2 sm:gap-4 mb-4">
                        <div className="flex-shrink-0">{AssistantIcon}</div>
                        <div className="flex-1 flex items-center">
                          <div className="relative">
                            <div
                              className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse"
                              style={{
                                boxShadow:
                                  "0 0 8px rgba(255, 255, 255, 0.4), 0 0 4px rgba(255, 255, 255, 0.2)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center py-2">
                        <div className="flex items-center gap-2 text-white/40 text-xs sm:text-sm">
                          <div className="relative">
                            <div
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full animate-pulse"
                              style={{
                                boxShadow:
                                  "0 0 6px rgba(255, 255, 255, 0.3), 0 0 3px rgba(255, 255, 255, 0.1)",
                              }}
                            />
                          </div>
                          <span>Generating response...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-1" />
            </div>
          </div>
        )}
      </ScrollArea>

      {!shouldAutoScroll && displayMessages.length > 0 && (
        <button
          onClick={() => {
            lastUserScrollRef.current = 0;
            scrollToBottom(true);
          }}
          className="absolute bottom-4 right-4 bg-[#10a37f] hover:bg-[#0d8f6f] text-white p-2 rounded-full shadow-lg transition-all duration-200 z-10"
          aria-label="Scroll to bottom"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
