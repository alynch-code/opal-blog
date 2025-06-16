// pages/api/chat.ts

import type { APIRoute } from 'astro';
import { AzureOpenAI } from "openai";
import { AzureKeyCredential } from "@azure/core-auth";

const client = new AzureOpenAI({
  endpoint: import.meta.env.AZURE_OPENAI_ENDPOINT,
  credential: new AzureKeyCredential(import.meta.env.AZURE_OPENAI_API_KEY),
  apiVersion: "2025-01-01-preview",
});

export const post: APIRoute = async ({ request }) => {
  try {
    const { messages } = await request.json();
    const response = await client.chat.completions.create({
      deploymentId: import.meta.env.AZURE_OPENAI_DEPLOYMENT_NAME,
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