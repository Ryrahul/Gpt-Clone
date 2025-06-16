import type { Message } from "ai";

export interface ChatItem {
  _id: string;
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
  createdAt: string;
  updatedAt: string;
}

export interface ChatDocument {
  _id: any;
  userId: string;
  title: string;
  messages: MessageDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageDocument {
  _id: any;
  chat: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
