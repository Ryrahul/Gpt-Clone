import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userId = "user_123";

    const chats = await Chat.find({ userId })
      .populate("messages")
      .sort({ updatedAt: -1 });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { title, messages } = await request.json();
    const userId = "user_123";

    const chat = new Chat({
      userId,
      title,
      messages: [],
    });

    await chat.save();

    const messageIds = [];
    for (const msg of messages) {
      const message = new Message({
        chat: chat._id,
        role: msg.role,
        content: msg.content,
      });
      await message.save();
      messageIds.push(message._id);
    }

    chat.messages = messageIds;
    await chat.save();

    await chat.populate("messages");

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
