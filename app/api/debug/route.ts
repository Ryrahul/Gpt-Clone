export const runtime = "nodejs";

export async function GET() {
  const results: Record<string, string> = {};

  try {
    await import("@clerk/nextjs/server");
    results["@clerk/nextjs/server"] = "ok";
  } catch (e: any) {
    results["@clerk/nextjs/server"] = e.message;
  }

  try {
    await import("@ai-sdk/azure");
    results["@ai-sdk/azure"] = "ok";
  } catch (e: any) {
    results["@ai-sdk/azure"] = e.message;
  }

  try {
    await import("ai");
    results["ai"] = "ok";
  } catch (e: any) {
    results["ai"] = e.message;
  }

  try {
    await import("mem0ai");
    results["mem0ai"] = "ok";
  } catch (e: any) {
    results["mem0ai"] = e.message;
  }

  try {
    await import("@/lib/token-manager");
    results["token-manager"] = "ok";
  } catch (e: any) {
    results["token-manager"] = e.message;
  }

  try {
    await import("@/lib/mem0");
    results["lib/mem0"] = "ok";
  } catch (e: any) {
    results["lib/mem0"] = e.message;
  }

  results["env_AZURE_KEY_SET"] = process.env.AZURE_OPENAI_API_KEY ? "yes" : "no";
  results["env_AZURE_RESOURCE_SET"] = process.env.AZURE_OPENAI_RESOURCE_NAME ? "yes" : "no";
  results["env_AZURE_DEPLOYMENT_SET"] = process.env.AZURE_OPENAI_DEPLOYMENT_NAME ? "yes" : "no";

  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
