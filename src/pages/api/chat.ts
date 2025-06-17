// src/pages/api/chat.ts
import type { APIRoute } from 'astro';
import { AzureOpenAI } from 'openai';

export const POST: APIRoute = async ({ request }) => {
  // Load configuration from environment variables
  const endpoint   = import.meta.env.AZURE_OPENAI_ENDPOINT ?? process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey     = import.meta.env.AZURE_OPENAI_API_KEY ?? process.env.AZURE_OPENAI_API_KEY;
  const apiVersion = import.meta.env.AZURE_OPENAI_API_VERSION ?? process.env.AZURE_OPENAI_API_VERSION;
  const deployment = import.meta.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? process.env.AZURE_OPENAI_DEPLOYMENT;

  // Debug: Log environment variables to verify they are loaded
  console.log('ENV VARS:', {
    ENDPOINT: endpoint,
    KEY:      apiKey ? '✔️' : '❌',
    VERSION:  apiVersion,
    DEPLOY:   deployment
  });

  // Validate that all required variables are present
  if (!endpoint || !apiKey || !apiVersion || !deployment) {
    console.error('🛑 Missing one or more AZURE_OPENAI_* environment variables.');
    return new Response(
      JSON.stringify({ error: { message: 'Server misconfiguration: missing environment variables.' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Sanitize endpoint (remove trailing slash)
  const sanitizedEndpoint = endpoint.replace(/\/+$/, '');

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


