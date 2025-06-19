// src/pages/api/contact.ts

export async function POST({ request }) {
  const data = await request.formData();
  const name = data.get('name');
  const email = data.get('email');
  const inquiryType = data.get('inquiryType');
  const message = data.get('message');

  // Optional: log to console for now
  console.log({ name, email, inquiryType, message });

  // Cozy auto-replies by type
  const cozyReplies: Record<string, string> = {
    'cozy-request': `Hi ${name}! Opal here 🐾 Thanks for your custom request. We'll cuddle up with your message and get back to you soon.`,
    'partnership': `Hey ${name}, Opal's whiskers twitched at the word *partnership*. We'll paw through your proposal and follow up shortly!`,
    'media': `Hi ${name}! We’re flattered you're reaching out about press or media. We’ll curl up with your note and get back to you soon.`,
    'business': `Hi ${name}, thanks for your message! We'll be in touch soon to explore how we might work together.`,
    'other': `Hi ${name}, thanks for saying hi! We'll respond shortly. Opal loves surprises. 🐱`,
  };

  // Simulate sending email (later: integrate real provider)
  console.log(`📬 Sending to ${email}:\n${cozyReplies[inquiryType] || cozyReplies['other']}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
