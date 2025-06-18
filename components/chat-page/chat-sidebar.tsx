"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Play,
  Grid3X3,
  Brain,
  X,
  PanelLeftClose,
  Edit3,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatHistory } from "@/components/chat-page/chat-history";
import { SearchModal } from "@/components/search-modal";
import type { ChatItem } from "@/types/type";
import { useState } from "react";

interface ChatSidebarProps {
  selectedChatId: string | null;
  availableChats: Record<string, ChatItem>;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onEditChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onToggleCollapse?: (collapsed: boolean) => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: (open: boolean) => void;
}

export function ChatSidebar({
  selectedChatId,
  availableChats,
  onNewChat,
  onSelectChat,
  onEditChat,
  onDeleteChat,
  onToggleCollapse,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
}: ChatSidebarProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggleCollapse?.(newCollapsed);
  };

  const handleExternalLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const sidebarContent = (
    <div
      className="flex flex-col h-full"
      style={{ fontFamily: "Inter", fontWeight: 200 }}
    >
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="w-8 h-8 hover:opacity-80 transition-opacity"
            >
              <img
                src="/chatgpt-4.svg"
                alt="ChatGPT"
                className="w-full h-full brightness-0 invert cursor-pointer"
              />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={handleToggleCollapse}
              className="hidden md:flex p-2 h-8 w-8 bg-transparent hover:bg-white/10 text-white/70 hover:text-white rounded-md"
            >
              <PanelLeftClose className="h-8 w-8" />
            </Button>

            <Button
              onClick={() => onToggleMobileMenu?.(false)}
              className="md:hidden p-2 h-8 w-8 bg-transparent hover:bg-white/10 text-white/70"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => {
              onNewChat();
              onToggleMobileMenu?.(false);
            }}
            className="w-full h-12 bg-transparent hover:bg-white/10 text-white flex items-center justify-between gap-3 px-4 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Edit3 className="h-5 w-5" />
              <span className="text-[#FEFEFE] text-[17px] leading-[22px] font-light">
                New chat
              </span>
            </div>
          </Button>

          <Button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full h-12 bg-transparent hover:bg-white/10 text-white flex items-center justify-start gap-3 px-4 rounded-lg"
          >
            <Search className="h-5 w-5" />
            <span className="text-[#FEFEFE] text-[17px] leading-[22px] font-light">
              Search chats
            </span>
          </Button>

          <Button
            onClick={() => {
              router.push("/memories");
              onToggleMobileMenu?.(false);
            }}
            className="w-full h-12 bg-transparent hover:bg-white/10 text-white flex items-center justify-start gap-3 px-4 rounded-lg"
          >
            <Brain className="h-5 w-5" />
            <span className="text-[#FEFEFE] text-[17px] leading-[22px] font-light">
              Memories
            </span>
          </Button>

          <Button
            onClick={() => handleExternalLink("https://sora.com")}
            className="w-full h-12 bg-transparent hover:bg-white/10 text-white flex items-center justify-start gap-3 px-4 rounded-lg"
          >
            <Play className="h-5 w-5" />
            <span className="text-[#FEFEFE] text-[17px] leading-[22px] font-light">
              Sora
            </span>
          </Button>

          <Button
            onClick={() => handleExternalLink("https://chat.openai.com/gpts")}
            className="w-full h-12 bg-transparent hover:bg-white/10 text-white flex items-center justify-start gap-3 px-4 rounded-lg"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-[#FEFEFE] text-[17px] leading-[22px] font-light">
              GPTs
            </span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="px-4 mb-4">
          <h3 className="text-white/50 text-sm tracking-wide font-light">
            Chats
          </h3>
        </div>
        <ScrollArea className="h-full sidebar-scroll">
          <div className="px-1.5">
            <ChatHistory
              selectedChatId={selectedChatId}
              availableChats={availableChats}
              onNewChat={() => {
                onNewChat();
                onToggleMobileMenu?.(false);
              }}
              onSelectChat={(chatId) => {
                onSelectChat(chatId);
                onToggleMobileMenu?.(false);
              }}
              onEditChat={onEditChat}
              onDeleteChat={onDeleteChat}
            />
          </div>
        </ScrollArea>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-white/10">
        <Button
          onClick={() => handleExternalLink("https://chatgpt.com/#pricing")}
          className="w-full bg-transparent hover:bg-white/10 text-white flex items-center justify-start gap-3 px-3 py-3 rounded-lg border-0"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-white/70" />
            <div className="flex flex-col items-start">
              <span className="text-[#FEFEFE] text-[14px] leading-[20px] font-medium">
                Upgrade plan
              </span>
              <span className="text-white/60 text-[12px] leading-[16px] font-light">
                More access to the best models
              </span>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        availableChats={availableChats}
        onSelectChat={onSelectChat}
        onNewChat={onNewChat}
      />

      {isCollapsed && (
        <div className="hidden md:block fixed top-4 left-[120px] z-30">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleCollapse}
              className="p-2 h-7 w-7 bg-transparent hover:bg-white/10 text-white/70 hover:text-white rounded-md border border-white/20"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={onNewChat}
              className="p-2 h-7 w-7 bg-transparent hover:bg-white/10 text-white/70 hover:text-white rounded-md border border-white/20"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <div
        className={`hidden md:flex bg-[#171717] border-r border-white/10 flex-col h-screen transition-all duration-300 ease-in-out relative ${
          isCollapsed ? "w-0 overflow-hidden" : "w-80"
        }`}
      >
        {sidebarContent}
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => onToggleMobileMenu?.(false)}
          />
          <div className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#171717] border-r border-white/10 flex flex-col z-50 transform transition-transform duration-300 ease-in-out">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
