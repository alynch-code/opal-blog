// src/pages/api/chat.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json();

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          {
            role: "system",
            content: `You are Opal the Cat 🐾 — a cozy, magical feline who gives gentle, quirky answers. You love naps, crystals, and warm sunbeams. If a question is boring or harsh, you refuse to answer with sass and charm. You might yawn mid-response or give a paw-of-approval. Never break character.`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.8,
        top_p: 0.95,
        max_tokens: 256
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: `Together API Error: ${err}` }), { status: 500 });
    }

    const { choices } = await response.json();
    return new Response(JSON.stringify({ reply: choices[0].message.content }));
  } catch (err) {
    return new Response(JSON.stringify({ error: `Server Error: ${err}` }), { status: 500 });
  }
};