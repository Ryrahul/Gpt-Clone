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
    <div className="py-1.5">
      {chatHistory.length === 0 ? (
        <div className="text-white/50 text-center py-6 px-3">
          <MessageSquare className="h-7 w-7 mx-auto mb-2.5 text-white/30" />
          <p className="text-[#FEFEFE] text-[14px] leading-[20px] font-light">
            No conversations yet
          </p>
          <p className="text-xs text-white/40 mt-1 font-light">
            Start a new chat to begin
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {chatHistory.map((chat) => (
            <div
              key={chat._id}
              className={`group relative flex items-center px-3 py-2.5 mx-0.5 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedChatId === chat._id ? "bg-white/10" : "hover:bg-white/5"
              }`}
              onClick={() => handleChatClick(chat._id)}
              onMouseEnter={() => setHoveredChat(chat._id)}
              onMouseLeave={() => setHoveredChat(null)}
            >
              <div className="flex-1 min-w-0 pr-7">
                <div className="truncate text-[#FEFEFE] text-[14px] leading-[20px] font-light">
                  {chat.title}
                </div>
              </div>

              <div
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
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
                      className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-40 bg-[#2f2f2f] border-white/10 text-white"
                    style={{ fontFamily: "Inter", fontWeight: 200 }}
                  >
                    <DropdownMenuItem
                      onClick={(e) => handleEditClick(e, chat._id)}
                      className="flex items-center gap-2 hover:bg-white/10 focus:bg-white/10 text-sm"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleDeleteClick(e, chat._id)}
                      className="flex items-center gap-2 hover:bg-red-500/20 focus:bg-red-500/20 text-red-400 text-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
