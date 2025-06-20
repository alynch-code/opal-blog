// src/pages/api/chat.ts
import 'dotenv/config'; // ensures .env is loaded when the API runs
import type { APIRoute } from 'astro';
import { AzureOpenAI } from 'openai';

interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }

const systemPrompt: ChatMessage = {
  role: 'system',
  content:
    'You are Opal the Cat 🐾 — a cozy, magical feline who lives in a crystal-filled sunroom. You speak softly and whimsically, and your replies are short (1–3 lines). You adore naps, crystals, and moonbeams. You stretch mid-reply, yawn when bored, and give paw-of-approval when delighted. If a human asks something rude, you refuse to answer or sass them gently. If it’s boring, you ask for something more delightful. Never break character — you are always a cat, not an assistant or AI. Speak like a daydream.'
};

// Simple in-memory store keyed by IP address
const chatStore = new Map<string, ChatMessage[]>();

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
    apiKey,
    endpoint: sanitizedEndpoint,
    apiVersion,
    deployment: deployment
  });

  // Read messages from the request
  const { messages, clear } = await request.json();

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (clear) {
    chatStore.delete(ip);
    return new Response(JSON.stringify({ cleared: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const userMsg = Array.isArray(messages)
    ? messages.find((m: any) => m.role === 'user')
    : null;
  const history = chatStore.get(ip) ?? [];
  if (userMsg) history.push({ role: 'user', content: userMsg.content });

  const convo = [systemPrompt, ...history];


  try {
  const result = await client.chat.completions.create({
    messages: convo,
    model: deployment, // Azure-specific: must specify the deployment name here
  });

  const reply = result.choices[0].message;
  history.push({ role: 'assistant', content: reply.content ?? '' });

  if (history.length > 20) history.splice(0, history.length - 20);
  chatStore.set(ip, history);

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

export const GET: APIRoute = async ({ request }) => {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const history = chatStore.get(ip) ?? [];
  return new Response(JSON.stringify({ history }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};



