"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Message } from "ai";

interface ChatItem {
  _id: string;
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
  createdAt: string;
  updatedAt: string;
}

interface ChatContextType {
  chats: Record<string, ChatItem>;
  loading: boolean;
  addChat: (chat: ChatItem) => void;
  updateChat: (chatId: string, messages: Message[]) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  getChat: (chatId: string) => ChatItem | null;
  createChat: (messages: Message[]) => Promise<ChatItem>;
  loadChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Record<string, ChatItem>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chats");
      const data = await response.json();

      if (data.chats) {
        const chatsMap: Record<string, ChatItem> = {};
        data.chats.forEach((chat: any) => {
          chatsMap[chat._id] = {
            ...chat,
            id: chat._id,
            timestamp: new Date(chat.updatedAt),
            messages: chat.messages.map((msg: any) => ({
              id: msg._id,
              role: msg.role,
              content: msg.content,
              createdAt: msg.createdAt,
            })),
          };
        });
        setChats(chatsMap);
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (messages: Message[]): Promise<ChatItem> => {
    try {
      console.log("Creating chat with messages:", messages);

      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: messages[0]?.content?.slice(0, 30) || "New conversation",
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();
      console.log("Chat creation response:", data);

      if (data.chat) {
        const newChat: ChatItem = {
          ...data.chat,
          id: data.chat._id,
          timestamp: new Date(data.chat.updatedAt),
          messages: data.chat.messages.map((msg: any) => ({
            id: msg._id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
          })),
        };

        setChats((prev) => ({
          ...prev,
          [newChat._id]: newChat,
        }));

        return newChat;
      }

      throw new Error("Failed to create chat");
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  };

  const addChat = (chat: ChatItem) => {
    setChats((prev) => ({
      ...prev,
      [chat._id]: chat,
    }));
  };

  const updateChat = async (chatId: string, messages: Message[]) => {
    try {
      console.log("Updating chat", chatId, "with messages:", messages);

      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();
      console.log("Chat update response:", data);

      if (data.chat) {
        const updatedChat: ChatItem = {
          ...data.chat,
          id: data.chat._id,
          timestamp: new Date(data.chat.updatedAt),
          messages: data.chat.messages.map((msg: any) => ({
            id: msg._id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
          })),
        };

        setChats((prev) => ({
          ...prev,
          [chatId]: updatedChat,
        }));
      }
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });

      setChats((prev) => {
        const newChats = { ...prev };
        delete newChats[chatId];
        return newChats;
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const getChat = (chatId: string): ChatItem | null => {
    return chats[chatId] || null;
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        loading,
        addChat,
        updateChat,
        deleteChat,
        getChat,
        createChat,
        loadChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
