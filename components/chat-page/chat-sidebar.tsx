"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Play,
  Grid3X3,
  Brain,
  X,
  Menu,
  PanelLeftClose,
  Edit3,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
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
}

export function ChatSidebar({
  selectedChatId,
  availableChats,
  onNewChat,
  onSelectChat,
  onEditChat,
  onDeleteChat,
  onToggleCollapse,
}: ChatSidebarProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
          
            <div className="w-8 h-8">
              <img
                src="/chatgpt-4.svg"
                alt="ChatGPT"
                className="w-full h-full brightness-0 invert"
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
         
            <Button
              onClick={handleToggleCollapse}
              className="hidden md:flex p-1.5 h-8 w-8 bg-transparent hover:bg-white/10 text-white/70 hover:text-white rounded-md"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
         
            <Button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 h-8 w-8 bg-transparent hover:bg-white/10 text-white/70"
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
            className="w-full h-12 bg-transparent hover:bg-white/10 text-white flex items-center justify-between gap-3 px-4 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Edit3 className="h-5 w-5" />
              <span className="text-[#FEFEFE] text-[17px] leading-[24px] font-light">
                New chat
              </span>
            </div>
            <span className="text-sm text-white/50 hidden xl:block font-light">
              Ctrl+Shift+O
            </span>
          </Button>

      
          <Button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full h-12 bg-transparent hover:bg-white/10 text-white flex items-center justify-start gap-3 px-4 rounded-lg"
          >
            <Search className="h-5 w-5" />
            <span className="text-[#FEFEFE] text-[17px] leading-[24px] font-light">
              Search chats
            </span>
          </Button>

      
          <Button
            onClick={() => {
              router.push("/memories");
              setIsMobileMenuOpen(false);
            }}
            className="w-full h-12 bg-transparent hover:bg-white/10 text-white flex items-center justify-start gap-3 px-4 rounded-lg"
          >
            <Brain className="h-5 w-5" />
            <span className="text-[#FEFEFE] text-[17px] leading-[24px] font-light">
              Memories
            </span>
          </Button>

  
          <Button
            onClick={() => handleExternalLink("https://sora.com")}
            className="w-full h-12 bg-transparent hover:bg-white/10 text-white flex items-center justify-start gap-3 px-4 rounded-lg"
          >
            <Play className="h-5 w-5" />
            <span className="text-[#FEFEFE] text-[17px] leading-[24px] font-light">
              Sora
            </span>
          </Button>

       
          <Button
            onClick={() => handleExternalLink("https://chat.openai.com/gpts")}
            className="w-full h-12 bg-transparent hover:bg-white/10 text-white flex items-center justify-start gap-3 px-4 rounded-lg"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-[#FEFEFE] text-[17px] leading-[24px] font-light">
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
          <div className="px-2">
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
          </div>
        </ScrollArea>
      </div>

  
      <div className="flex-shrink-0 p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[#FEFEFE] text-[17px] leading-[24px] font-light truncate">
              User Profile
            </div>
          </div>
        </div>
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

      <Button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 h-10 w-10 bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white border border-white/20 rounded-lg"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {isCollapsed && (
        <div className="hidden md:block fixed top-4 left-[140px] z-30">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleCollapse}
              className="p-2 h-8 w-8 bg-transparent hover:bg-white/10 text-white/70 hover:text-white rounded-md border border-white/20"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button
              onClick={onNewChat}
              className="p-2 h-8 w-8 bg-transparent hover:bg-white/10 text-white/70 hover:text-white rounded-md border border-white/20"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div
        className={`hidden md:flex bg-[#171717] border-r border-white/10 flex-col h-screen transition-all duration-300 ease-in-out relative ${
          isCollapsed ? "w-0 overflow-hidden" : "w-72"
        }`}
      >
        {sidebarContent}
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#171717] border-r border-white/10 flex flex-col z-50 transform transition-transform duration-300 ease-in-out">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
