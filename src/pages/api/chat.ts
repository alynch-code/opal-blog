// src/pages/api/chat.ts
import type { APIRoute } from 'astro';
import { AzureOpenAI } from 'openai';

export const POST: APIRoute = async ({ request }) => {
  // Load configuration directly from environment
  const endpoint   = import.meta.env.AZURE_OPENAI_ENDPOINT!;
  const apiKey     = import.meta.env.AZURE_OPENAI_API_KEY!;
  const apiVersion = import.meta.env.AZURE_OPENAI_API_VERSION!;
  const deployment = import.meta.env.AZURE_OPENAI_DEPLOYMENT!;

  // Initialize the Azure OpenAI client
  const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });

  // Parse incoming messages
  const { messages } = await request.json();

  try {
    // Create a chat completion
    const result = await client.chat.completions.create({
      messages,
      max_tokens: 800,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: null
    });

    // Return the completion
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    console.error('🛑 Chat API Error:', e);
    return new Response(
      JSON.stringify({ error: { message: e.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
