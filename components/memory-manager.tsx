"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Trash2, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface UserMemory {
  id?: string;
  _id?: string;
  memory?: string;
  created_at?: string;
  metadata?: any;
}

interface MemoryManagerProps {
  userId: string;
  initialMemories: UserMemory[];
}

export function MemoryManager({ userId, initialMemories }: MemoryManagerProps) {
  const [memories, setMemories] = useState<UserMemory[]>(initialMemories);
  const [loading, setLoading] = useState(false);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/memories?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMemories(data.memories || []);
        toast.success(`Found ${data.memories?.length || 0} memories`);
      } else {
        toast.error("Failed to fetch memories");
      }
    } catch (error) {
      console.error("Error fetching memories:", error);
      toast.error("Failed to fetch memories");
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (memoryId: string) => {
    if (!memoryId) {
      toast.error("Invalid memory ID");
      return;
    }

    try {
      const response = await fetch(`/api/memories/${memoryId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setMemories((prev) =>
          prev.filter((m) => m.id !== memoryId && m._id !== memoryId)
        );
        toast.success("Memory deleted successfully");
      } else {
        console.error("Failed to delete memory:", response.statusText);
        toast.error("Failed to delete memory");
      }
    } catch (error) {
      console.error("Error deleting memory:", error);
      toast.error("Failed to delete memory");
    }
  };

  const getMemoryId = (memory: UserMemory): string => {
    return memory.id || memory._id || "";
  };

  const getMemoryContent = (memory: UserMemory): string => {
    return memory.memory || "No content available";
  };

  const getMemoryDate = (memory: UserMemory): string => {
    if (!memory.created_at) return "Unknown date";
    try {
      return new Date(memory.created_at).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading memories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => window.history.back()}
          className="bg-transparent border border-white/20 text-white hover:bg-white/10 p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-white">Memory Manager</h1>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-green-400" />
          <span className="text-white text-lg">
            {memories.length} memories stored
          </span>
        </div>
        <Button
          onClick={fetchMemories}
          className="bg-[#10a37f] hover:bg-[#0d8f6f] text-white"
          disabled={loading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {memories.length === 0 ? (
        <Card className="bg-[#2f2f2f] border-white/10">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">
              No memories yet. Start chatting to build your AI memory!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {memories.map((memory) => {
            const memoryId = getMemoryId(memory);
            return (
              <Card
                key={memoryId || Math.random()}
                className="bg-[#2f2f2f] border-white/10"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-sm font-medium">
                      {getMemoryDate(memory)}
                    </CardTitle>
                    {memoryId && (
                      <Button
                        onClick={() => deleteMemory(memoryId)}
                        size="sm"
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-white/80 text-sm leading-relaxed">
                    {getMemoryContent(memory)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
