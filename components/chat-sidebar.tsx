"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { ChatHistory } from "@/components/chat-history";
import type { ChatItem } from "@/types/type";

interface ChatSidebarProps {
  selectedChatId: string | null;
  availableChats: Record<string, ChatItem>;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onEditChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({
  selectedChatId,
  availableChats,
  onNewChat,
  onSelectChat,
  onEditChat,
  onDeleteChat,
}: ChatSidebarProps) {
  return (
    <div className="w-96 bg-[#171717] border-r border-white/10 flex flex-col h-screen">
      {/* Fixed header with New Chat button */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <Button
          onClick={onNewChat}
          className="w-full h-12 bg-transparent border border-white/20 text-white hover:bg-white/10 flex items-center gap-3 text-base font-medium"
        >
          <Plus className="h-5 w-5" />
          New chat
        </Button>
      </div>

      {/* Scrollable chat history */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <ChatHistory
            selectedChatId={selectedChatId}
            availableChats={availableChats}
            onNewChat={onNewChat}
            onSelectChat={onSelectChat}
            onEditChat={onEditChat}
            onDeleteChat={onDeleteChat}
          />
        </ScrollArea>
      </div>
    </div>
  );
}
