export async function POST({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const email = formData.get('email')?.toString();
    const amount = formData.get('amount')?.toString();

    if (!name || !email || !amount) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Placeholder for real payment processing logic
    console.log(`Payment from ${name} (${email}) for $${amount}`);

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Something went wrong', { status: 500 });
  }
}