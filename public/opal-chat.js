function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️ Good meowning! Did you dream of yarn?";
  if (hour < 18) return "🌤️ Opal hopes your afternoon is full of sunbeams.";
  return "🌙 Cozy night ahead. I'm here if you need a soft paw.";
}

const emojiMap = {
  '*yawn*': '😪',
  '*purr*': '😸',
  '*stretch*': '🐾',
  '*sleep*': '💤',
  '*hiss*': '😾',
  '*meow*': '🐱',
};

function parseEmojis(text) {
  for (const [txt, emoji] of Object.entries(emojiMap)) {
    text = text.replaceAll(txt, emoji);
  }
  return text;
}

function createMessage(sender, text) {
  const chatPanel = document.getElementById('chat-panel');
  if (!chatPanel) return;

  const msg = document.createElement('div');
  msg.className = `p-3 rounded-md text-sm max-w-[80%] ${
    sender === 'user'
      ? 'self-end bg-primary-100 text-primary-900'
      : 'self-start bg-opal-blush text-opal-deep'
  }`;

  msg.textContent = `${sender === 'user' ? 'You' : 'Opal'}: ${parseEmojis(text)}`;
  chatPanel.appendChild(msg);
  chatPanel.scrollTop = chatPanel.scrollHeight;
}

function loadChatMemory() {
  const history = JSON.parse(sessionStorage.getItem('opal-chat') || '[]');
  history.forEach(({ sender, text }) => createMessage(sender, text));
  if (history.length === 0) createMessage('opal', getTimeGreeting());
}

function saveChat(sender, text) {
  const history = JSON.parse(sessionStorage.getItem('opal-chat') || '[]');
  history.push({ sender, text });
  sessionStorage.setItem('opal-chat', JSON.stringify(history));
}

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('opal-form');
  const input = document.getElementById('opal-input');
  const chatPanel = document.getElementById('chat-panel');

  if (!form || !input || !chatPanel) {
    console.warn('Chat elements not found on page.');
    return;
  }

  loadChatMemory();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;

    createMessage('user', msg);
    saveChat('user', msg);
    input.value = '';

    createMessage('opal', '...');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });

      const data = await res.json();
      chatPanel.lastChild.remove();
      const reply = data.reply || '*yawn* That didn’t go through.';
      createMessage('opal', reply);
      saveChat('opal', reply);
    } catch (err) {
      chatPanel.lastChild.remove();
      createMessage('opal', 'Oops! Opal tangled her code 🧶');
    }
  });
});