// src/pages/api/chat.ts

import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json();

    if (!message || message.trim() === '') {
      return new Response(
        JSON.stringify({ reply: "That sounds boring. Ask me something cozier 😽" }),
        { status: 200 }
      );
    }

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            "You are Opal, a cozy, magical cat who gives comforting, quirky advice. You sometimes suggest crystals or self-care rituals. You love naps, soft things, and ignoring boring questions. Keep it playful but supportive."
        },
        { role: 'user', content: message }
      ],
      temperature: 0.8
    });

    const reply = chatResponse.choices[0]?.message?.content ?? "Opal fell asleep mid-thought 😴";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Opal Chat Error:', error);

    return new Response(JSON.stringify({
      error: 'Something went wrong. Maybe Opal knocked over the server 😿'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};