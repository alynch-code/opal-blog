// pages/api/chat.ts

// src/pages/api/chat.ts
import type { APIRoute } from 'astro';
import { AzureOpenAI } from 'openai';
import { AzureKeyCredential } from '@azure/core-auth';

const client = new AzureOpenAI({
  endpoint:   import.meta.env.AZURE_OPENAI_ENDPOINT,
  apiKey:     import.meta.env.AZURE_OPENAI_API_KEY,
  apiVersion: "2025-01-01-preview"
});

export const POST: APIRoute = async ({ request }) => {
  const { messages } = await request.json();
  try {
    const response = await client.chat.completions.create({
      deploymentId: import.meta.env.AZURE_OPENAI_DEPLOYMENT,
      messages
    });
    return new Response(JSON.stringify(response), {
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
