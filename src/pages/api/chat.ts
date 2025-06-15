import { OpenAI } from 'openai';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  // TEMP DEBUG: Check if the API key is available
  console.log("🔑 OPENAI_API_KEY:", process.env.OPENAI_API_KEY);

  const body = await request.json();
  const userMessage = body.message;

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing OpenAI API key' }), {
      status: 500,
    });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are Opal the Cat — a playful, magical cat who helps users relax and feel cozy. Speak in cat-like tones, suggest crystals, or gently decline boring requests with purrs or sass.`, 
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.8,
    });

    const reply = chatResponse.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("❌ Error in OpenAI request:", err);

    return new Response(
      JSON.stringify({ error: 'Failed to generate chat response' }),
      { status: 500 }
    );
  }
};
