import { auth } from "@clerk/nextjs/server";
import { createAzure } from "@ai-sdk/azure";
import { streamText } from "ai";
import { mem0Service } from "@/lib/mem0";
import { ModelName, TokenManager } from "@/lib/token-manager";

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const messages = body.messages;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4.1";
    const model = "gpt-4.1" as ModelName;
    const tokenManager = new TokenManager(model);

    const normalizedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content:
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    }));

    const tokenCheck = tokenManager.checkTokenLimits(normalizedMessages);

    if (!tokenCheck.withinLimits) {
      console.warn(
        "Input exceeds token limits. Trimming messages from:",
        tokenCheck.inputTokens,
        "tokens"
      );
      const trimmed = tokenManager.trimMessagesToFit(normalizedMessages);
      messages.splice(0, messages.length, ...trimmed);
    }

    const latestUserMessage = messages[messages.length - 1]?.content || "";
    const relevantMemories = await mem0Service.getRelevantMemories(
      userId,
      latestUserMessage,
      3
    );

    let memoryContext = "";
    if (relevantMemories.length > 0) {
      memoryContext = `\n\nRelevant context from previous conversations:\n${relevantMemories.join(
        "\n"
      )}\n`;
    }

    const messagesWithMemory = [
      {
        role: "system" as const,
        content: `You are a helpful AI assistant. Use the following context from previous conversations to provide more personalized and relevant responses.${memoryContext}`,
      },
      ...messages,
    ];

    const result = await streamText({
      model: azure(deploymentName),
      messages: messagesWithMemory,
      onFinish: async () => {
        try {
          await mem0Service.addMemory(userId, messages, {
            chatId: req.headers.get("x-chat-id"),
          });
        } catch (error) {
          console.error("Error storing memory:", error);
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error?.message, error?.stack, error?.cause);
    return new Response(
      JSON.stringify({
        error: error?.message || "Internal Server Error",
        cause: error?.cause?.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
