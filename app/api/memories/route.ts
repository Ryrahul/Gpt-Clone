import { auth } from "@clerk/nextjs/server";
import { mem0Service } from "@/lib/mem0";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const memories = await mem0Service.getAllUserMemories(userId);

    return Response.json({ memories });
  } catch (error) {
    console.error("Error fetching memories:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
