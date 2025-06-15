function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️ Good meowning! Did you dream of yarn?";
  if (hour < 18) return "🌤️ Opal hopes your afternoon is full of sunbeams.";
  return "🌙 Cozy night ahead. I'm here if you need a soft paw.";
}

const initialGreeting = getTimeGreeting();

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('opal-form');
  const input = document.getElementById('opal-input');
  const messages = document.getElementById('opal-messages');

  if (!form || !input || !messages) {
    console.error("🐾 Opal Chat: Missing required elements.");
    return;
  }

  function showTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'text-xs italic text-gray-400';
    typing.textContent = 'Opal is typing...';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  function addMessage(text, from = 'opal') {
    const message = document.createElement('div');
    message.className = `opal-message ${from} p-2 rounded-md mt-1 ${
      from === 'user'
        ? 'bg-gray-200 dark:bg-gray-700 text-right'
        : 'bg-opal-blush/30 dark:bg-opal-ocean/30'
    }`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  // Inject time-based greeting with a cozy delay
  setTimeout(() => {
    addMessage(initialGreeting, 'opal');
  }, 800);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = input.value.trim();
    if (!userInput) return;

    addMessage(userInput, 'user');
    input.value = '';

    const typing = showTypingIndicator();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });

      const data = await res.json();
      typing.remove();
      addMessage(data.reply || "🐱 Opal got distracted... try again?", 'opal');
    } catch (err) {
      typing.remove();
      addMessage("⚠️ Opal tripped on a bug in the code. Try again later.", 'opal');
      console.error(err);
    }
  });
});
