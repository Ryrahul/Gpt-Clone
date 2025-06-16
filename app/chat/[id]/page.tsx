"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChatInterface } from "@/components/chat-interface";
import { ChatHistory } from "@/components/chat-history";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/contexts/chat-context";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { chats, updateChat, deleteChat, getChat } = useChat();
  const currentChat = getChat(chatId);

  // Load chat data when component mounts or chatId changes
  useEffect(() => {
    const loadChat = async () => {
      setLoading(true);
      try {
        // Chat should exist in global state
        if (!getChat(chatId)) {
          console.log("Chat not found:", chatId);
          router.push("/chat");
          return;
        }
      } catch (error) {
        console.error("Error loading chat:", error);
        router.push("/chat");
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      loadChat();
    }
  }, [chatId, router, getChat]);

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleSelectChat = (selectedChatId: string) => {
    router.push(`/chat/${selectedChatId}`);
    setSidebarOpen(false);
  };

  const handleEditChat = (editChatId: string) => {
    console.log("Edit chat:", editChatId);
  };

  const handleDeleteChat = async (deleteChatId: string) => {
    deleteChat(deleteChatId);

    if (deleteChatId === chatId) {
      router.push("/chat");
    }
  };

  const handleUpdateChat = async (updateChatId: string, messages: any[]) => {
    updateChat(updateChatId, messages);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#212121] items-center justify-center">
        <div className="text-white">Loading chat...</div>
      </div>
    );
  }

  if (!currentChat) {
    return (
      <div className="flex h-screen bg-[#212121] items-center justify-center">
        <div className="text-white">Chat not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#212121]">
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
            selectedChatId={chatId}
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

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
          <h1 className="font-semibold text-lg text-white">
            {currentChat.title}
          </h1>
          <div className="w-9" />
        </div>

        <ChatInterface
          chatId={chatId}
          initialMessages={currentChat.messages}
          onUpdateChat={handleUpdateChat}
        />
      </div>
    </div>
  );
}
