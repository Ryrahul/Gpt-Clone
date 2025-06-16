import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const chat = await Chat.findById(params.id).populate("messages");

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    console.log("Fetched chat with messages:", chat);

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { messages } = await request.json();
    console.log("Updating chat with messages:", messages);

    const chat = await Chat.findById(params.id).populate("messages");
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const existingMessages = chat.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    console.log("Existing messages:", existingMessages);

    const newMessages = messages.filter((msg: any) => {
      const exists = existingMessages.some(
        (existing: any) =>
          existing.role === msg.role && existing.content === msg.content
      );
      console.log(`Message "${msg.content}" (${msg.role}) exists:`, exists);
      return !exists;
    });

    console.log("New messages to add:", newMessages);

    // Create new messages
    const newMessageIds = [];
    for (const msg of newMessages) {
      console.log("Creating message:", msg);
      const message = new Message({
        chat: chat._id,
        role: msg.role,
        content: msg.content,
      });
      await message.save();
      newMessageIds.push(message._id);
      console.log("Created message with ID:", message._id);
    }

    if (newMessageIds.length > 0) {
      chat.messages = [
        ...chat.messages.map((msg: any) => msg._id),
        ...newMessageIds,
      ];
      chat.updatedAt = new Date();
      await chat.save();
      console.log("Updated chat with new messages");
    }

    await chat.populate("messages");

    console.log("Final chat with all messages:", chat);

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const chat = await Chat.findById(params.id);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await Message.deleteMany({ chat: params.id });

    await Chat.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
