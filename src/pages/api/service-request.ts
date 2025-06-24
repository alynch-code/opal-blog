import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const email = formData.get('email')?.toString();
    const help = formData.get('help')?.toString();
    const deadline = formData.get('deadline')?.toString();
    const contactMethod = formData.get('contactMethod')?.toString();

    if (!name || !email || !help) {
      return new Response('Missing required fields', { status: 400 });
    }

    const deadlineInfo = deadline ? `<p>Deadline: ${deadline}</p>` : '';
    const contactInfo = contactMethod ? `<p>Preferred contact: ${contactMethod}</p>` : '';

    // Send confirmation email to the requester
    const { error: userError } = await resend.emails.send({
      from: 'Opal the Cat <meow@mail.opaldesignllc.com>',
      to: email,
      subject: '🐾 Service Request Received',
      html: `
        <div style="font-family: sans-serif; font-size: 16px;">
          <p>Hi ${name},</p>
          <p>We received your service request and will review it shortly.</p>
          ${deadlineInfo}
          ${contactInfo}
          <p>Warmest paws,<br/>Opal 🐾</p>
        </div>
      `,
    });

    if (userError) {
      console.error(userError);
      return new Response('Email failed to send', { status: 500 });
    }

    // Send details to site owner
    const { error: adminError } = await resend.emails.send({
      from: 'Service Request <meow@mail.opaldesignllc.com>',
      to: 'meow@mail.opaldesignllc.com',
      subject: `New Service Request from ${name}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Request:</strong></p>
          <p>${help}</p>
          ${deadlineInfo}
          ${contactInfo}
        </div>
      `,
    });

    if (adminError) {
      console.error(adminError);
      return new Response('Email failed to send', { status: 500 });
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Something went wrong', { status: 500 });
  }
}