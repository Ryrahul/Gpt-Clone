"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongo";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import type { Message as AIMessage } from "ai";
import type { ChatItem } from "@/types/type";
import type { MessageAttachment } from "@/types/type";

export async function getChats(): Promise<ChatItem[]> {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    const chats = await Chat.find({ userId: user.id })
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
          attachments: msg.attachments || [],
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
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    const chat = await Chat.findOne({ _id: chatId, userId: user.id })
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
        attachments: msg.attachments || [],
        createdAt: msg.createdAt || new Date(),
      })),
    };
  } catch (error) {
    console.error("Error loading chat:", error);
    return null;
  }
}

export async function createChat(
  messages: AIMessage[],
  attachments?: MessageAttachment[]
): Promise<ChatItem> {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    const chat = await Chat.create({
      userId: user.id,
      title: messages[0]?.content?.slice(0, 30) || "New conversation",
      messages: [],
    });

    if (!chat) {
      throw new Error("Failed to create chat");
    }

    const messageIds = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      const messageAttachments =
        attachments &&
        attachments.length > 0 &&
        msg.role === "user" &&
        i === messages.length - 2
          ? attachments
          : [];

      const message = await Message.create({
        chat: chat._id,
        role: msg.role,
        content: msg.content,
        attachments: messageAttachments,
      });
      messageIds.push(message._id);
    }

    chat.messages = messageIds;
    await chat.save();

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
        attachments: msg.attachments || [],
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
  messages: AIMessage[],
  attachments?: MessageAttachment[]
): Promise<ChatItem> {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    const chat = await Chat.findOne({ _id: chatId, userId: user.id });

    if (!chat) {
      throw new Error("Chat not found");
    }

  
    await Message.deleteMany({ chat: chatId });

    const messageIds = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      let messageAttachments: MessageAttachment[] = [];

      if (
        msg.experimental_attachments &&
        msg.experimental_attachments.length > 0
      ) {
        messageAttachments = msg.experimental_attachments.map((att) => ({
          id: att.url || `att-${Date.now()}`,
          url: att.url,
          name: att.name || "Unknown",
          type: "image", 
          mimeType: att.contentType || "application/octet-stream",
          size: (att as any).size || 0,
          width: (att as any).width,
          height: (att as any).height,
          pages: (att as any).pages,
          provider: "upload",
        }));
      
      }
      else if (
        (msg as any).attachments &&
        (msg as any).attachments.length > 0
      ) {
        messageAttachments = (msg as any).attachments;
       
      }
      else if (attachments && attachments.length > 0 && msg.role === "user") {
        const userMessages = messages.filter((m) => m.role === "user");
        const currentUserMessageIndex = userMessages.findIndex(
          (m) => m === msg
        );
        const isLastUserMessage =
          currentUserMessageIndex === userMessages.length - 1;

        if (isLastUserMessage) {
          messageAttachments = attachments;
        
        }
      }

     
      const message = await Message.create({
        chat: chatId,
        role: msg.role,
        content: msg.content,
        attachments: messageAttachments,
      });
      messageIds.push(message._id);
    }

    // Update chat with new message IDs
    chat.messages = messageIds;
    await chat.save();

    // Fetch and return updated chat
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
        attachments: msg.attachments || [],
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
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    const chat = await Chat.findOne({ _id: chatId, userId: user.id });

    if (!chat) {
      throw new Error("Chat not found");
    }

    await Message.deleteMany({ chat: chatId });

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
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId: user.id },
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

export async function chatHasAttachments(chatId: string): Promise<boolean> {
  try {
    const user = await currentUser();

    if (!user) {
      return false;
    }

    await dbConnect();

    const messageWithAttachments = await Message.findOne({
      chat: chatId,
      "attachments.0": { $exists: true },
    }).populate({
      path: "chat",
      match: { userId: user.id },
    });

    return (
      messageWithAttachments !== null && messageWithAttachments.chat !== null
    );
  } catch (error) {
    console.error("Error checking chat attachments:", error);
    return false;
  }
}

export async function searchChatsByAttachment(
  filename: string
): Promise<ChatItem[]> {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!filename || filename.trim() === "") {
      return [];
    }

    await dbConnect();

    const messages = await Message.find({
      "attachments.name": { $regex: filename.trim(), $options: "i" },
    }).populate("chat");

    const chatIds = [
      ...new Set(
        messages
          .filter((msg: any) => msg.chat && msg.chat.userId === user.id)
          .map((msg: any) => msg.chat._id.toString())
      ),
    ];

    if (chatIds.length === 0) {
      return [];
    }

    const chats = await Chat.find({
      _id: { $in: chatIds },
      userId: user.id,
    })
      .populate({
        path: "messages",
        model: "Message",
        options: { sort: { createdAt: 1 } },
      })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

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
          attachments: msg.attachments || [],
          createdAt: msg.createdAt || new Date(),
        })),
      };
    });
  } catch (error) {
    console.error("Error searching chats by attachment:", error);
    return [];
  }
}

export async function getAttachmentStats(): Promise<{
  totalAttachments: number;
  imageCount: number;
  documentCount: number;
  totalSize: number;
}> {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    const messages = await Message.find({
      "attachments.0": { $exists: true },
    }).populate({
      path: "chat",
      match: { userId: user.id },
    });

    const userMessages = messages.filter((msg: any) => msg.chat !== null);

    let totalAttachments = 0;
    let imageCount = 0;
    let documentCount = 0;
    let totalSize = 0;

    userMessages.forEach((msg: any) => {
      if (msg.attachments && Array.isArray(msg.attachments)) {
        msg.attachments.forEach((attachment: any) => {
          totalAttachments++;
          totalSize += attachment.size || 0;

          if (attachment.mimeType?.startsWith("image/")) {
            imageCount++;
          } else {
            documentCount++;
          }
        });
      }
    });

    return {
      totalAttachments,
      imageCount,
      documentCount,
      totalSize,
    };
  } catch (error) {
    console.error("Error getting attachment stats:", error);
    return {
      totalAttachments: 0,
      imageCount: 0,
      documentCount: 0,
      totalSize: 0,
    };
  }
}
