export const POST: APIRoute = async ({ request }) => {
  // 1) Pull in your env‐vars
  let endpoint   = import.meta.env.AZURE_OPENAI_ENDPOINT!;
  const apiKey   = import.meta.env.AZURE_OPENAI_API_KEY!;
  const apiVersion = import.meta.env.AZURE_OPENAI_API_VERSION!;
  const deployment = import.meta.env.AZURE_OPENAI_DEPLOYMENT_NAME!;

  // 2) Sanitize the endpoint (no trailing slash)
  endpoint = endpoint.replace(/\/+$/, "");

  // 3) Log exactly what we’re calling
  console.log("🔍 Calling Azure:", {
    url:    `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
    apiKeyLoaded: !!apiKey,
    deployment
  });

  // 4) List deployments to verify that “opal-35” really exists here
  try {
    const listResp = await fetch(
      `${endpoint}/openai/deployments?api-version=${apiVersion}`,
      { headers: { "api-key": apiKey } }
    );
    const list = await listResp.json();
    console.log("🗂️  Deployments on this endpoint:", JSON.stringify(list, null, 2));
  } catch (e) {
    console.error("⚠️ Could not list deployments:", e);
  }

  // 5) Now call the chat completion
  const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
  const { messages } = await request.json();
  try {
    const result = await client.chat.completions.create({ messages });
    return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("🛑 Chat API Error:", err);
    return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

