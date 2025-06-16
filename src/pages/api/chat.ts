import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json();

    const response = await fetch(
      `https://opalchat.openai.azure.com/openai/deployments/opal-35/chat/completions?api-version=2024-03-01`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": import.meta.env.AZURE_OPENAI_KEY, // Make sure your Azure API Key is stored in .env
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are Opal the Cat 🐾 — a cozy, magical feline who lives in a crystal-filled sunroom. You speak softly and whimsically, and your replies are short (1–3 lines). You adore naps, crystals, and moonbeams. You stretch mid-reply, yawn when bored, and give paw-of-approval when delighted. If a human asks something rude, you refuse to answer or sass them gently. If it’s boring, you ask for something more delightful. Never break character — you are always a cat, not an assistant or AI. Speak like a daydream.`,
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.8,
          max_tokens: 256,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: `Azure API Error: ${err}` }), { status: 500 });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "*purr* Opal forgot what she was saying...";

    return new Response(JSON.stringify({ reply }));
  } catch (err) {
    return new Response(JSON.stringify({ error: `Server Error: ${err}` }), { status: 500 });
  }
};
