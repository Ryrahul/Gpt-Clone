import { getChats, getChat } from "@/app/actions/action";
import { ChatLayout } from "@/components/chat-layout";

interface ChatPageProps {
  params: Promise<{
    chat?: string[];
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chat: chatArray } = await params;
  const chatId = chatArray?.[0] || null;

  const [chats, currentChat] = await Promise.all([
    getChats(),
    chatId ? getChat(chatId) : null,
  ]);

  return <ChatLayout chats={chats} currentChat={currentChat} chatId={chatId} />;
}
