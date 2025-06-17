// src/pages/api/chat.ts
import type { APIRoute } from 'astro';
import { AzureOpenAI } from 'openai';

export const POST: APIRoute = async ({ request }) => {
  // Load configuration from Node environment variables
  const endpoint   = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey     = process.env.AZURE_OPENAI_API_KEY;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

  // Validate that all required environment variables are present
  if (!endpoint || !apiKey || !apiVersion || !deployment) {
    console.error('🛑 Missing one or more AZURE_OPENAI_* environment variables.');
    return new Response(
      JSON.stringify({ error: { message: 'Server misconfiguration: missing environment variables.' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Sanitize endpoint (remove trailing slash if any)
  const sanitizedEndpoint = endpoint.replace(/\/+$/, '');

  // Log the exact URL and deployment for diagnostics
  console.log('🔍 Azure Config:', { sanitizedEndpoint, apiVersion, deployment });

  // Initialize the Azure OpenAI client
  const client = new AzureOpenAI({
    endpoint: sanitizedEndpoint,
    apiKey,
    apiVersion,
    deployment
  });

  // Read messages from the request
  const { messages } = await request.json();

  try {
    // Call the chat completions API
    const result = await client.chat.completions.create({ messages });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('🛑 Chat API Error:', err);
    return new Response(
      JSON.stringify({ error: { message: err.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

