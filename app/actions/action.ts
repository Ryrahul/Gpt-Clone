"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongo";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import type { Message as AIMessage } from "ai";
import type { ChatItem } from "@/types/type";

export async function getChats(): Promise<ChatItem[]> {
  try {
    await dbConnect();

    const chats = await Chat.find({})
      .populate({
        path: "messages",
        model: "Message",
        options: { sort: { createdAt: 1 } },
      })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    if (!chats || !Array.isArray(chats)) {
      return [];
    }

    return chats.map((chat) => {
      const chatData = chat as any;
      return {
        _id: chatData._id.toString(),
        id: chatData._id.toString(),
        title: chatData.title || "Untitled Chat",
        timestamp: new Date(chatData.updatedAt),
        createdAt:
          chatData.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt:
          chatData.updatedAt?.toISOString() || new Date().toISOString(),
        messages: (chatData.messages || []).map((msg: any) => ({
          id: msg._id.toString(),
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt || new Date(),
        })),
      };
    });
  } catch (error) {
    console.error("Error loading chats:", error);
    return [];
  }
}

export async function getChat(chatId: string): Promise<ChatItem | null> {
  try {
    await dbConnect();

    const chat = await Chat.findById(chatId)
      .populate({
        path: "messages",
        model: "Message",
        options: { sort: { createdAt: 1 } },
      })
      .lean()
      .exec();

    if (!chat) return null;

    const chatData = chat as any;
    return {
      _id: chatData._id.toString(),
      id: chatData._id.toString(),
      title: chatData.title || "Untitled Chat",
      timestamp: new Date(chatData.updatedAt),
      createdAt: chatData.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: chatData.updatedAt?.toISOString() || new Date().toISOString(),
      messages: (chatData.messages || []).map((msg: any) => ({
        id: msg._id.toString(),
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt || new Date(),
      })),
    };
  } catch (error) {
    console.error("Error loading chat:", error);
    return null;
  }
}

export async function createChat(messages: AIMessage[]): Promise<ChatItem> {
  try {
    await dbConnect();

    // Create the chat first with a temporary userId
    const chat = await Chat.create({
      userId: "temp-user", // Temporary until auth is implemented
      title: messages[0]?.content?.slice(0, 30) || "New conversation",
      messages: [],
    });

    if (!chat) {
      throw new Error("Failed to create chat");
    }

    // Create messages and link them to the chat
    const messageIds = [];
    for (const msg of messages) {
      const message = await Message.create({
        chat: chat._id,
        role: msg.role,
        content: msg.content,
      });
      messageIds.push(message._id);
    }

    // Update chat with message references
    chat.messages = messageIds;
    await chat.save();

    // Populate the chat with messages for return
    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: "messages",
        model: "Message",
        options: { sort: { createdAt: 1 } },
      })
      .lean()
      .exec();

    if (!populatedChat) {
      throw new Error("Failed to retrieve created chat");
    }

    const chatData = populatedChat as any;
    const newChat: ChatItem = {
      _id: chatData._id.toString(),
      id: chatData._id.toString(),
      title: chatData.title,
      timestamp: new Date(chatData.updatedAt),
      createdAt: chatData.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: chatData.updatedAt?.toISOString() || new Date().toISOString(),
      messages: (chatData.messages || []).map((msg: any) => ({
        id: msg._id.toString(),
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt || new Date(),
      })),
    };

    revalidatePath("/chat");
    return newChat;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

export async function updateChat(
  chatId: string,
  messages: AIMessage[]
): Promise<ChatItem> {
  try {
    await dbConnect();

    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Remove existing messages
    await Message.deleteMany({ chat: chatId });

    // Create new messages
    const messageIds = [];
    for (const msg of messages) {
      const message = await Message.create({
        chat: chatId,
        role: msg.role,
        content: msg.content,
      });
      messageIds.push(message._id);
    }

    // Update chat with new message references
    chat.messages = messageIds;
    await chat.save();

    // Populate the chat with messages for return
    const populatedChat = await Chat.findById(chatId)
      .populate({
        path: "messages",
        model: "Message",
        options: { sort: { createdAt: 1 } },
      })
      .lean()
      .exec();

    if (!populatedChat) {
      throw new Error("Failed to retrieve updated chat");
    }

    const chatData = populatedChat as any;
    const updatedChat: ChatItem = {
      _id: chatData._id.toString(),
      id: chatData._id.toString(),
      title: chatData.title,
      timestamp: new Date(chatData.updatedAt),
      createdAt: chatData.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: chatData.updatedAt?.toISOString() || new Date().toISOString(),
      messages: (chatData.messages || []).map((msg: any) => ({
        id: msg._id.toString(),
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt || new Date(),
      })),
    };

    revalidatePath(`/chat/${chatId}`);
    revalidatePath("/chat");
    return updatedChat;
  } catch (error) {
    console.error("Error updating chat:", error);
    throw error;
  }
}

export async function deleteChat(chatId: string): Promise<void> {
  try {
    await dbConnect();

    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Delete all messages associated with the chat
    await Message.deleteMany({ chat: chatId });

    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    revalidatePath("/chat");
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
}

export async function updateChatTitle(
  chatId: string,
  title: string
): Promise<void> {
  try {
    await dbConnect();

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { title },
      { new: true }
    );

    if (!updatedChat) {
      throw new Error("Chat not found");
    }

    revalidatePath(`/chat/${chatId}`);
    revalidatePath("/chat");
  } catch (error) {
    console.error("Error updating chat title:", error);
    throw error;
  }
}
