"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "ai";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import { TypingIndicator } from "@/components/typing-indicator";

interface ChatMessagesAreaProps {
  displayMessages: Message[];
  isLoading: boolean;
  messages: Message[];
  error: Error | undefined;
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

export function ChatMessagesArea({
  displayMessages,
  isLoading,
  messages,
  error,
}: ChatMessagesAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [displayMessages, isLoading]);

  // Check if AI has started responding (has assistant message after user message)
  const hasAIStartedResponding =
    messages.length > 0 && messages[messages.length - 1]?.role === "assistant";

  return (
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

              {isLoading && (
                <div className="w-full py-6 px-4">
                  <div className="max-w-3xl mx-auto">
                    {!hasAIStartedResponding ? (
                      // Initial loading - show AI icon with typing indicator
                      <div className="flex gap-4 mb-4">
                        <div className="flex-shrink-0">{AssistantIcon}</div>
                        <div className="flex-1">
                          <TypingIndicator />
                        </div>
                      </div>
                    ) : (
                      // AI has started responding but still loading - show subtle continuation indicator
                      <div className="flex justify-center py-2">
                        <div className="flex items-center gap-2 text-white/40 text-sm">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                            <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                          </div>
                          <span>Generating response...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
