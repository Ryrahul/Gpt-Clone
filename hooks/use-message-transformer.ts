"use client";

import type { Message } from "ai";
import type { MessageAttachment } from "@/types/type";

export function useMessageTransformer(initialMessages: any[]) {
  // Transform messages and keep attachments for display
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

  return { transformedMessages, cleanMessagesForAI };
}
