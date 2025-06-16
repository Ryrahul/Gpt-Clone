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
    <div className="w-64 bg-[#171717] border-r border-white/10 flex flex-col">
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full bg-transparent border border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
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
  );
}
