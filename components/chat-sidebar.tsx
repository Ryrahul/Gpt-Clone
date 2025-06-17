"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Brain, X, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChatHistory } from "@/components/chat-history";
import type { ChatItem } from "@/types/type";
import { useState } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-white font-semibold text-sm sm:text-base">
            Chat History
          </h2>
          <div className="flex items-center gap-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-7 h-7 sm:w-8 sm:h-8",
                },
              }}
            />
            <Button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1 h-7 w-7 bg-transparent hover:bg-white/10 text-white/70"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Button
            onClick={() => {
              onNewChat();
              setIsMobileMenuOpen(false);
            }}
            className="w-full h-10 sm:h-12 bg-transparent border border-white/20 text-white hover:bg-white/10 flex items-center gap-3 text-sm sm:text-base font-medium"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            New chat
          </Button>
          <Button
            onClick={() => {
              router.push("/memories");
              setIsMobileMenuOpen(false);
            }}
            className="w-full h-8 sm:h-10 bg-transparent border border-green-400/20 text-green-400 hover:bg-green-400/10 flex items-center gap-3 text-xs sm:text-sm font-medium"
          >
            <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
            View Memories
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <ChatHistory
            selectedChatId={selectedChatId}
            availableChats={availableChats}
            onNewChat={() => {
              onNewChat();
              setIsMobileMenuOpen(false);
            }}
            onSelectChat={(chatId) => {
              onSelectChat(chatId);
              setIsMobileMenuOpen(false);
            }}
            onEditChat={onEditChat}
            onDeleteChat={onDeleteChat}
          />
        </ScrollArea>
      </div>
    </>
  );

  return (
    <>
      <Button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 h-10 w-10 bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white border border-white/20 rounded-lg"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden md:flex w-80 lg:w-96 bg-[#171717] border-r border-white/10 flex-col h-screen">
        {sidebarContent}
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="md:hidden fixed left-0 top-0 bottom-0 w-80 bg-[#171717] border-r border-white/10 flex flex-col z-50 transform transition-transform duration-300">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
