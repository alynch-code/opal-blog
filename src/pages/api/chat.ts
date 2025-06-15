// src/pages/api/chat.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json();

    // --- Simulated chatbot response ---
    const reply = getCatResponse(message);

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// 🐾 Simple cat-like response logic
function getCatResponse(message: string): string {
  const trimmed = message.toLowerCase().trim();
  if (!trimmed) return "Meow? Say something, hooman 🐱";
  if (trimmed.includes("crystal")) return "Try amethyst for calm or citrine for good vibes 💎";
  if (trimmed.includes("sleep")) return "Curl into a warm blanket. Cats know best 😴";
  if (trimmed.includes("love")) return "Purrhaps you need some self-love first 💖";
  if (trimmed.includes("food")) return "Tuna? Chicken? Just no cucumbers, please 🐟🍗";

  const quirkyResponses = [
    "I knocked your questions off the shelf. Sorry not sorry 😼",
    "That sounds boring. Ask me something cozier 😽",
    "Pawse and reflect. What do *you* think?",
    "Mmm... I’ll get back to you after a nap 😴",
    "I'll allow that question. Proceed 🐾"
  ];

  return quirkyResponses[Math.floor(Math.random() * quirkyResponses.length)];
}
