import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const email = formData.get('_replyto')?.toString();
    const message = formData.get('message')?.toString();
    const inquiryType = formData.get('inquiryType')?.toString();

    if (!name || !email || !message || !inquiryType) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Custom auto-response messages
    const responses: Record<string, string> = {
      just_saying_hi: "Thanks for the cozy vibes! Opal's whiskers twitched with joy ✨",
      custom_request: "Thanks for your custom idea! We’ll curl up with it and reply soon 💡",
      collab_interest: "We’re excited about a potential collab! Opal is purring in anticipation 🤝",
      press_inquiry: "Me-wow! We’ll get back to you soon about your press inquiry 📰",
      something_else: "Thanks for reaching out! Opal will be in touch shortly 🐱",
    };

    const autoReply = responses[inquiryType] || responses.something_else;

    const { data, error } = await resend.emails.send({
      from: 'Opal the Cat <meow@mail.opaldesignllc.com>',
      to: email,
      subject: '🐾 We got your message!',
      html: `
        <div style="font-family: sans-serif; font-size: 16px;">
          <p>Hi ${name},</p>
          <p>${autoReply}</p>
          <p>We received your message and will get back to you if needed. In the meantime, feel free to explore <a href="https://www.opaldesignllc.com">Opal’s cozy world</a>.</p>
          <p>Warmest paws,<br/>Opal 🐾</p>
        </div>
      `,
    });

    if (error) {
      console.error(error);
      return new Response('Email failed to send', { status: 500 });
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Something went wrong', { status: 500 });
  }
}
