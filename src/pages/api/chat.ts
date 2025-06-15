export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const { message } = await request.json();

  if (!message) {
    return new Response(JSON.stringify({ error: 'No message provided' }), { status: 400 });
  }

  const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are Opal the Cat, a cozy, magical feline with quirky personality and soft advice.' },
      { role: 'user', content: message }
    ],
    temperature: 0.7
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const error = await res.text();
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "Opal got distracted. Try again?";
  
  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
