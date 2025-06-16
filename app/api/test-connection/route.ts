import dbConnect from "@/lib/mongo";

export async function GET() {
  try {
    await dbConnect();
    return new Response("Connected to MongoDB", { status: 200 });
  } catch (e) {
    return new Response("Connection failed", { status: 500 });
  }
}
