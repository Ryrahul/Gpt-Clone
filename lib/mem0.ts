import { MemoryClient } from "mem0ai";

class Mem0Service {
  private client: MemoryClient | null = null;
  private initialized = false;

  constructor() {}

  private async initialize() {
    if (this.initialized) return;

    if (!process.env.MEM0_API_KEY) {
      console.warn("MEM0_API_KEY not found. Memory features will be disabled.");
      return;
    }

    this.client = new MemoryClient({
      apiKey: process.env.MEM0_API_KEY,
    });
    this.initialized = true;
  }

  async addMemory(userId: string, messages: any[], metadata?: any) {
    await this.initialize();
    if (!this.client) return;

    try {
      const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const result = await this.client.add(formattedMessages, {
        user_id: userId,
        metadata: {
          timestamp: new Date().toISOString(),
          messageCount: messages.length,
          ...metadata,
        },
      });

      return result;
    } catch (error) {
      console.error("Error adding memory:", error);
    }
  }

  async getRelevantMemories(
    userId: string,
    query: string,
    limit = 5
  ): Promise<string[]> {
    await this.initialize();
    if (!this.client) return [];

    try {
      const memories = await this.client.search(query, {
        user_id: userId,
        limit,
      });

      return Array.isArray(memories)
        ? memories.map((memory: any) => memory.memory || memory.text || memory)
        : [];
    } catch (error) {
      console.error("Error retrieving memories:", error);
      return [];
    }
  }

  async getAllUserMemories(userId: string) {
    await this.initialize();
    if (!this.client) return [];

    try {
      const memories = await this.client.getAll({
        user_id: userId,
      });

      return Array.isArray(memories) ? memories : [];
    } catch (error) {
      console.error("Error getting all memories:", error);
      return [];
    }
  }

  async deleteMemory(memoryId: string) {
    await this.initialize();
    if (!this.client) return;

    try {
      await this.client.delete(memoryId);
    } catch (error) {
      console.error("Error deleting memory:", error);
    }
  }
}

export const mem0Service = new Mem0Service();
