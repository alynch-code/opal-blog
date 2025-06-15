// src/pages/api/chat.ts
import type { APIRoute } from 'astro';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json();

    if (!message || message.trim() === "") {
      return new Response(
        JSON.stringify({ reply: "That sounds boring. Ask me something cozier 😽" }),
        { status: 200 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You're Opal the Cat 😺 — a cozy, quirky cat with a love for crystals, naps, and playful wisdom. Stay in character, be a little snarky but comforting.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.8
    });

    const reply = completion.choices[0]?.message?.content || "Meow? Something went fuzzy.";

    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ reply: "Oops! I knocked something off the table. Try again later 🐾" }), { status: 500 });
  }
};
