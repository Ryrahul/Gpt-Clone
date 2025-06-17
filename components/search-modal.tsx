"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, X, Search } from "lucide-react";
import type { ChatItem } from "@/types/type";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableChats: Record<string, ChatItem>;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export function SearchModal({
  isOpen,
  onClose,
  availableChats,
  onSelectChat,
  onNewChat,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = Object.values(availableChats)
    .filter(
      (chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.messages.some((msg) =>
          msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const groupChatsByTime = (chats: ChatItem[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as ChatItem[],
      yesterday: [] as ChatItem[],
      older: [] as ChatItem[],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.timestamp);
      if (chatDate >= today) {
        groups.today.push(chat);
      } else if (chatDate >= yesterday) {
        groups.yesterday.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  const groupedChats = groupChatsByTime(filteredChats);

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-400/30 text-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleChatSelect = (chatId: string) => {
    onSelectChat(chatId);
    onClose();
    setSearchQuery("");
  };

  const handleNewChat = () => {
    onNewChat();
    onClose();
    setSearchQuery("");
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const renderChatGroup = (title: string, chats: ChatItem[]) => {
    if (chats.length === 0) return null;

    return (
      <div key={title} className="mb-4">
        <div className="px-4 py-2 text-xs font-medium text-white/50">
          {title}
        </div>
        <div className="space-y-1">
          {chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => handleChatSelect(chat._id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <MessageSquare className="h-4 w-4 text-white/70 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white/90 text-sm font-normal truncate">
                  {highlightSearchTerm(chat.title, searchQuery)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full mx-4 bg-[#2f2f2f] border-white/10 text-white p-0 gap-0 max-h-[80vh] overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 text-white text-lg placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto"
                autoFocus
              />
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-px bg-white/10 mt-4" />
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full max-h-[60vh]">
            <div className="p-4 pt-2">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left mb-4 rounded-lg"
              >
                <Plus className="h-4 w-4 text-white/70" />
                <span className="text-white/90 text-sm font-normal">
                  New chat
                </span>
              </button>

              {searchQuery ? (
                filteredChats.length > 0 ? (
                  <>
                    {renderChatGroup("Today", groupedChats.today)}
                    {renderChatGroup("Yesterday", groupedChats.yesterday)}
                    {renderChatGroup("Older", groupedChats.older)}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 mx-auto mb-3 text-white/30" />
                    <p className="text-white/50 text-sm">No chats found</p>
                    <p className="text-white/30 text-xs mt-1">
                      Try a different search term
                    </p>
                  </div>
                )
              ) : (
                <>
                  {renderChatGroup("Today", groupedChats.today)}
                  {renderChatGroup("Yesterday", groupedChats.yesterday)}
                  {renderChatGroup("Older", groupedChats.older)}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
