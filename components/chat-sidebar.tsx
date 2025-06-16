"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Brain } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  return (
    <div className="w-96 bg-[#171717] border-r border-white/10 flex flex-col h-screen">
      {/* Fixed header with New Chat button and User Button */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Chat History</h2>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
        <div className="space-y-2">
          <Button
            onClick={onNewChat}
            className="w-full h-12 bg-transparent border border-white/20 text-white hover:bg-white/10 flex items-center gap-3 text-base font-medium"
          >
            <Plus className="h-5 w-5" />
            New chat
          </Button>
          <Button
            onClick={() => router.push("/memories")}
            className="w-full h-10 bg-transparent border border-green-400/20 text-green-400 hover:bg-green-400/10 flex items-center gap-3 text-sm font-medium"
          >
            <Brain className="h-4 w-4" />
            View Memories
          </Button>
        </div>
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
