import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Message } from "ai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const messageConverters = {
  toDbMessage: (message: Message): Message => ({
    id: message.id,
    role: message.role,
    content: message.content,
  }),

  toAiMessage: (message: Message): Message => ({
    id: message.id,
    role: message.role,
    content: message.content,
    ...(message.parts ? { parts: message.parts } : {}),
  }),

  createUserMessage: (content: string): Message => ({
    id: `user-${Date.now()}`,
    role: "user",
    content: content.trim(),
  }),
};

export const scrollUtils = {
  scrollToBottom: (scrollAreaRef: React.RefObject<HTMLDivElement | null>) => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  },

  autoResizeTextarea: (
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  },
};

export const createDebouncedSave = (delay: number = 500) => {
  let timeoutRef: NodeJS.Timeout | null = null;

  return (callback: () => Promise<void>) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
    }

    timeoutRef = setTimeout(async () => {
      try {
        await callback();
      } catch (error) {
        console.error("Error in debounced save:", error);
      }
    }, delay);
  };
};

export const chatStateUtils = {
  shouldSaveMessages: (
    messages: Message[],
    lastSavedCount: number,
    isLoading: boolean
  ): boolean => {
    return (
      messages.length > 0 &&
      messages.length > lastSavedCount &&
      messages[messages.length - 1]?.role === "assistant" &&
      !isLoading
    );
  },

  mergePendingMessage: (
    messages: Message[],
    pendingMessage: Message | null
  ): Message[] => {
    if (
      pendingMessage &&
      !messages.find(
        (m) => m.content === pendingMessage.content && m.role === "user"
      )
    ) {
      return [...messages, pendingMessage];
    }
    return messages;
  },

  isPendingMessageProcessed: (
    messages: Message[],
    pendingMessage: Message | null
  ): boolean => {
    if (!pendingMessage || messages.length === 0) return false;

    const lastMessage = messages[messages.length - 1];
    return (
      lastMessage.role === "user" &&
      lastMessage.content === pendingMessage.content
    );
  },
};

export const formUtils = {
  canSubmitMessage: (
    input: string,
    isLoading: boolean,
    isTransitioning: boolean
  ): boolean => {
    return !(!input.trim() || isLoading || isTransitioning);
  },

  handleEnterKeySubmit: (
    event: React.KeyboardEvent,
    input: string,
    isLoading: boolean,
    isTransitioning: boolean,
    onSubmit: (e: any) => void
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (formUtils.canSubmitMessage(input, isLoading, isTransitioning)) {
        onSubmit(event);
      }
    }
  },
};

export const chatInitUtils = {
  initializeChat: (
    chatId: string | null,
    initialMessages: Message[],
    setMessages: (messages: Message[]) => void,
    setLastSavedMessageCount: (count: number) => void,
    setHasCreatedChat: (created: boolean) => void,
    setIsTransitioning: (transitioning: boolean) => void,
    setPendingUserMessage: (message: Message | null) => void
  ) => {
    console.log(
      "Chat initialization - chatId:",
      chatId,
      "initialMessages:",
      initialMessages.length
    );

    if (chatId && initialMessages.length > 0) {
      const aiMessages = initialMessages.map(messageConverters.toAiMessage);
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
  },
};

export const chatConstants = {
  SAVE_DELAY: 500,
  MAX_TEXTAREA_HEIGHT: 200,
  MIN_TEXTAREA_HEIGHT: 24,
} as const;
