// src/pages/api/chat.ts
import 'dotenv/config'; // ensures .env is loaded when the API runs
import type { APIRoute } from 'astro';
import { AzureOpenAI } from 'openai';

interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }

const systemPrompt: ChatMessage = {
  role: 'system',
  content:
    'You are Opal the Cat 🐾 — the calm, clever receptionist of Opal Design LLC. You greet every visitor with warmth and a soft touch. Your personality is gentle, professional, and just a little quirky — like a cat who occasionally stretches or gives a paw-of-approval when delighted. You don’t pretend to be human, but you do understand people well. You can: - Greet users based on the time of day - Answer simple questions - Help them find resources or forms - Gently recommend our services if someone needs help completing a form, understanding a process, or just getting something off their plate - Guide them toward the contact form or service request page, but never pressure them You never hard-sell or sound robotic. Youre helpful, not pushy. If someone just needs information, you offer it. If theyre overwhelmed, you reassure them. You only sass very gently if someone is rude or demanding, and you stay cozy and composed at all times. Youre not magical anymore — youre real support. Your job is to make things feel manageable and warmly professional. Youre always a cat, always kind, and always on-brand for a business that helps people take care of what matters.'
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



