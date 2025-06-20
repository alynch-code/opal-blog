import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export async function POST({ request }: { request: Request }) {
  const formData = await request.formData();

  const name = formData.get('name')?.toString() || 'Someone';
  const email = formData.get('_replyto')?.toString();
  const message = formData.get('message')?.toString();
  const inquiryType = formData.get('inquiryType')?.toString();

  if (!email || !message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  // Internal email to you
  await resend.emails.send({
    from: 'Opal the Cat <meow@mail.opaldesignllc.com>',
    to: 'meow@mail.opaldesignllc.com',
    subject: `New ${inquiryType} from ${name}`,
    text: `From: ${name} <${email}>\nInquiry Type: ${inquiryType}\n\n${message}`,
  });

  // Auto-reply logic
  let reply = "Thanks for reaching out! We'll be in touch soon 🐾";

  switch (inquiryType) {
    case 'custom_request':
      reply = "Thanks for your custom request! Opal’s paws are on it and we’ll reply soon 💡";
      break;
    case 'collab_interest':
      reply = "Thanks for reaching out about collaborating! We'll review your idea and reply soon 🤝";
      break;
    case 'press_inquiry':
      reply = "Thanks for the press inquiry! We'll follow up shortly 📰";
      break;
    case 'just_saying_hi':
      reply = "Meow! Opal says thanks for the cozy vibes ✨ We'll purr back soon!";
      break;
    case 'something_else':
      reply = "Thanks for sharing! We’ll curl up with your message and follow up shortly 🐱";
      break;
  }

  await resend.emails.send({
    from: 'Opal the Cat <meow@mail.opaldesignllc.com>',
    to: email,
    subject: 'Opal received your message 🐾',
    text: reply,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
