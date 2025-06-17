import { auth } from "@clerk/nextjs/server";
import { mem0Service } from "@/lib/mem0";

export async function DELETE(
  req: Request,
  { params }: { params: { memoryId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { memoryId } = await params;

    if (!memoryId) {
      return new Response("Memory ID is required", { status: 400 });
    }

    await mem0Service.deleteMemory(memoryId);

    return new Response("Memory deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
