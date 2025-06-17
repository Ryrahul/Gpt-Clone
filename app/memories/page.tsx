import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MemoryManager } from "@/components/memory-manager";
import { mem0Service } from "@/lib/mem0";

async function getMemories(userId: string) {
  try {
    const memories = await mem0Service.getAllUserMemories(userId);
    return (memories || []).map((memory: any) => ({
      id: memory.id,
      _id: memory._id,
      memory: memory.memory,
      created_at: memory.created_at,
      metadata: memory.metadata,
    }));
  } catch (error) {
    console.error("Error fetching memories:", error);
    return [];
  }
}

export default async function MemoriesPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const memories = await getMemories(user.id);

  return (
    <div className="min-h-screen bg-[#212121] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Your AI Memory</h1>
        <MemoryManager userId={user.id} initialMemories={memories} />
      </div>
    </div>
  );
}
