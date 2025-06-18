import { type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const json = await req.json();

  console.log("Webhook received:", json);

  // Do something with the incoming webhook data, if comingg from file uploader or semothing that works behind the hood and sends back data
  // prolly clerk webhook as well to save user in your own db as well
  return new Response("Webhook received", {
    status: 200,
  });
}
