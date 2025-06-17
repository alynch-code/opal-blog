// src/pages/api/subscribe.ts
import 'dotenv/config'; // ensures .env is loaded when the API runs

import type { APIRoute } from 'astro';

export const prerender = false; // Make sure it runs on the server

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();

  const accessToken = import.meta.env.CC_ACCESS_TOKEN;

  if (!email) {
    return new Response(
      JSON.stringify({ error: 'Email is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration: missing CC_ACCESS_TOKEN' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const payload = {
    email_address: email,
    list_memberships: ['b4682710-bf23-11ef-9368-fa163e4540a0'],
  };

  try {
    const res = await fetch('https://api.cc.email/v3/contacts/sign_up_form', {
      method: 'POST',
      headers: {
         Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
       return new Response(
        JSON.stringify({ error: err }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : err }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
