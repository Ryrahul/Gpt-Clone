"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Edit3, Trash2 } from "lucide-react";
import type { Message } from "ai";

interface ChatItem {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

interface ChatHistoryProps {
  selectedChatId: string | null;
  availableChats: Record<string, ChatItem>;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onEditChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatHistory({
  selectedChatId,
  availableChats,
  onNewChat,
  onSelectChat,
  onEditChat,
  onDeleteChat,
}: ChatHistoryProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleChatClick = (chatId: string) => {
    onSelectChat(chatId);
  };

  const handleEditClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    onEditChat(chatId);
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    onDeleteChat(chatId);
  };

  // Convert chats object to array and sort by timestamp
  const chatHistory = Object.values(availableChats).sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="flex-1 overflow-y-auto px-2">
      <div className="space-y-1">
        {chatHistory.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-start gap-2 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors ${
              selectedChatId === chat.id ? "bg-white/10" : ""
            }`}
            onClick={() => handleChatClick(chat.id)}
            onMouseEnter={() => setHoveredChat(chat.id)}
            onMouseLeave={() => setHoveredChat(null)}
          >
            <MessageSquare className="h-4 w-4 text-white/70 mt-0.5 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="text-white/90 text-sm font-medium truncate mb-1">
                {chat.title}
              </div>
              {chat.messages.length > 0 && (
                <div className="text-white/60 text-xs truncate">
                  {chat.messages[chat.messages.length - 1]?.content?.slice(
                    0,
                    50
                  )}
                  ...
                </div>
              )}
              <div className="text-white/40 text-xs mt-1">
                {formatTimestamp(chat.timestamp)}
              </div>
            </div>

            <div
              className={`flex gap-1 transition-opacity ${
                hoveredChat === chat.id ? "opacity-100" : "opacity-0"
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
                onClick={(e) => handleEditClick(e, chat.id)}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
                onClick={(e) => handleDeleteClick(e, chat.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        {/* Show empty state if no chats */}
        {chatHistory.length === 0 && (
          <div className="text-white/50 text-sm text-center py-8">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
}
