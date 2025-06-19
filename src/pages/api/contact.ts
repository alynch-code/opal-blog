import type { APIContext } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export async function POST({ request }: APIContext): Promise<Response> {
  const data = await request.formData();

  const name = data.get('name')?.toString();
  const email = data.get('_replyto')?.toString();
  const inquiryType = data.get('inquiryType')?.toString();
  const message = data.get('message')?.toString();

  if (!email || !message) {
    return new Response('Missing fields', { status: 400 });
  }

  const subjectMap: Record<string, string> = {
    just_saying_hi: 'New cozy message 💌',
    custom_request: 'Custom request received 💡',
    collab_interest: 'Partnership or collab inquiry 🤝',
    press_inquiry: 'Press or media inquiry 📰',
    something_else: 'Miscellaneous message 🐾',
  };

  const subject = subjectMap[inquiryType || ''] || 'New message to Opal';

  try {
    await resend.emails.send({
      from: 'Opal the Cat <meow@mail.opaldesignllc.com>',
      to: ['meow@mail.opaldesignllc.com'],
      subject,
      html: `
        <h2>You've got a new message from Opal's inbox 🐱</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Type:</strong> ${inquiryType}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `
    });

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Error sending email via Resend:', err);
    return new Response('Email failed', { status: 500 });
  }
}
