// src/pages/api/subscribe.ts

import type { APIRoute } from 'astro';

export const prerender = false; // Make sure it runs on the server

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email is required' }), {
      status: 400,
    });
  }

  const payload = {
    email_address: email,
    list_memberships: ['b4682710-bf23-11ef-9368-fa163e4540a0'],
  };

  try {
    const res = await fetch('https://api.cc.email/v3/contacts/sign_up_form', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.CC_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      return new Response(JSON.stringify({ error: err }), { status: 400 });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }
};
