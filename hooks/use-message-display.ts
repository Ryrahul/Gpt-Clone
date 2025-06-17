"use client";

import type { Message } from "ai";

export function useMessageDisplay(
  messages: Message[],
  transformedMessages: Message[]
) {
  // Merge AI SDK messages with original attachments for display
  const displayMessages = messages.map((msg) => {
    // First check if this message exists in transformedMessages (from database)
    const originalMessage = transformedMessages.find(
      (original) => original.id === msg.id
    );

    if (originalMessage) {
      // Use attachments from database
      return {
        ...msg,
        experimental_attachments:
          originalMessage.experimental_attachments || [],
      };
    }

    // For new messages in current session, keep their attachments
    return {
      ...msg,
      experimental_attachments: msg.experimental_attachments || [],
    };
  });

  return displayMessages;
}
