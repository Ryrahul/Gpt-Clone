"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Edit3, Trash2, MoreHorizontal } from "lucide-react";
import type { Message } from "ai";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <div className="py-2">
      {chatHistory.length === 0 ? (
        <div className="text-white/50 text-center py-8 px-4">
          <MessageSquare className="h-8 w-8 mx-auto mb-3 text-white/30" />
          <p className="text-[#FEFEFE] text-[15px] leading-[22px] font-light">
            No conversations yet
          </p>
          <p className="text-sm text-white/40 mt-1.5 font-light">
            Start a new chat to begin
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {chatHistory.map((chat) => (
            <div
              key={chat._id}
              className={`group relative flex items-center px-4 py-3 mx-1 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedChatId === chat._id ? "bg-white/10" : "hover:bg-white/5"
              }`}
              onClick={() => handleChatClick(chat._id)}
              onMouseEnter={() => setHoveredChat(chat._id)}
              onMouseLeave={() => setHoveredChat(null)}
            >
              <div className="flex-1 min-w-0 pr-8">
                <div className="truncate text-[#FEFEFE] text-[17px] leading-[22px] font-light">
                  {chat.title}
                </div>
              </div>

              <div
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
                  hoveredChat === chat._id || selectedChatId === chat._id
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4.5 w-4.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 bg-[#2f2f2f] border-white/10 text-white"
                    style={{ fontFamily: "Inter", fontWeight: 200 }}
                  >
                    <DropdownMenuItem
                      onClick={(e) => handleEditClick(e, chat._id)}
                      className="flex items-center gap-2.5 hover:bg-white/10 focus:bg-white/10 text-sm py-2.5"
                    >
                      <Edit3 className="h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleDeleteClick(e, chat._id)}
                      className="flex items-center gap-2.5 hover:bg-red-500/20 focus:bg-red-500/20 text-red-400 text-sm py-2.5"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
