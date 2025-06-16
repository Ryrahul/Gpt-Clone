"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat-interface";
import { ChatHistory } from "@/components/chat-history";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/contexts/chat-context";
import type { Message } from "ai";

export default function NewChatPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { chats, addChat, deleteChat } = useChat();

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleSelectChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
    setSidebarOpen(false);
  };

  const handleEditChat = (chatId: string) => {
    console.log("Edit chat:", chatId);
  };

  const handleDeleteChat = async (chatId: string) => {
    deleteChat(chatId);
  };

  const handleCreateNewChat = async (messages: Message[]) => {
    // Create new chat with the complete conversation
    const newChatId = `chat-${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: messages[0]?.content?.slice(0, 30) || "New conversation",
      messages,
      timestamp: new Date(),
    };

    // Add to global state first
    addChat(newChat);

    // Small delay to ensure state is updated before navigation
    setTimeout(() => {
      router.push(`/chat/${newChatId}`);
    }, 100);
  };

  return (
    <div className="flex h-screen bg-[#212121]">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] bg-[#171717] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-2">
            <Button
              className="w-full h-11 justify-start gap-3 bg-transparent border border-white/20 text-white hover:bg-white/10 rounded-lg font-medium text-sm"
              onClick={handleNewChat}
            >
              <Plus className="h-4 w-4" />
              New chat
            </Button>
          </div>

          <ChatHistory
            selectedChatId={null}
            availableChats={chats}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onEditChat={handleEditChat}
            onDeleteChat={handleDeleteChat}
          />

          <div className="p-2 border-t border-white/20">
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 cursor-pointer">
              <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                U
              </div>
              <span className="text-white/90 text-sm">User</span>
              <MoreHorizontal className="h-4 w-4 text-white/70 ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#212121]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-white hover:bg-white/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg text-white">ChatGPT</h1>
          <div className="w-9" />
        </div>

        {/* New Chat Interface */}
        <ChatInterface
          chatId={null}
          initialMessages={[]}
          onCreateNewChat={handleCreateNewChat}
        />
      </div>
    </div>
  );
}
