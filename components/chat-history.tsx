"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Edit3, Trash2 } from "lucide-react";
import type { Message } from "ai";

interface ChatItem {
  _id: string;
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
  createdAt: string;
  updatedAt: string;
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

  const chatHistory = Object.values(availableChats).sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="p-2 sm:p-4">
      <div className="space-y-2 sm:space-y-3">
        {chatHistory.map((chat) => (
          <div
            key={chat._id}
            className={`group flex items-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-200 ${
              selectedChatId === chat._id
                ? "bg-white/10 border border-white/20"
                : "border border-transparent"
            }`}
            onClick={() => handleChatClick(chat._id)}
            onMouseEnter={() => setHoveredChat(chat._id)}
            onMouseLeave={() => setHoveredChat(null)}
          >
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white/70 mt-1 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="text-white/90 text-sm sm:text-base font-semibold mb-1 sm:mb-2 leading-tight line-clamp-2">
                {chat.title}
              </div>
              {chat.messages.length > 0 && (
                <div className="text-white/60 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2">
                  {chat.messages[chat.messages.length - 1]?.content?.slice(
                    0,
                    80
                  )}
                  {chat.messages[chat.messages.length - 1]?.content &&
                  chat.messages[chat.messages.length - 1]?.content.length > 80
                    ? "..."
                    : ""}
                </div>
              )}
              <div className="text-white/40 text-xs sm:text-sm font-medium">
                {formatTimestamp(chat.timestamp)}
              </div>
            </div>

            <div
              className={`flex gap-1 sm:gap-2 transition-opacity duration-200 ${
                hoveredChat === chat._id
                  ? "opacity-100"
                  : "opacity-0 sm:opacity-0"
              } sm:group-hover:opacity-100`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 sm:h-9 sm:w-9 p-0 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                onClick={(e) => handleEditClick(e, chat._id)}
              >
                <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 sm:h-9 sm:w-9 p-0 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                onClick={(e) => handleDeleteClick(e, chat._id)}
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        ))}

        {chatHistory.length === 0 && (
          <div className="text-white/50 text-base sm:text-lg text-center py-12 sm:py-16 px-4">
            <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-white/30" />
            <p className="font-medium">No conversations yet</p>
            <p className="text-sm text-white/40 mt-2">
              Start a new chat to begin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
