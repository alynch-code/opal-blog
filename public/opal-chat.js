function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️ Good meowning! Did you dream of yarn?";
  if (hour < 18) return "🌤️ Opal hopes your afternoon is full of sunbeams.";
  return "🌙 Cozy night ahead. I'm here if you need a soft paw.";
}

const emojiReplacements = {
  '*yawn*': '😪',
  '*purr*': '😸',
  '*stretch*': '🐾',
  '*sleep*': '💤',
  '*hiss*': '😾',
  '*meow*': '🐱',
};

function parseWithEmojis(text) {
  let result = text;
  for (const [txt, emoji] of Object.entries(emojiReplacements)) {
    result = result.replaceAll(txt, emoji);
  }
  return result;
}

function scrollToBottom() {
  const chatPanel = document.getElementById('chat-panel');
  if (chatPanel) {
    chatPanel.scrollTop = chatPanel.scrollHeight;
  }
}

function createMessage(sender, text) {
  const chatPanel = document.getElementById('chat-panel');
  if (!chatPanel) return;

  const message = document.createElement('div');
  message.className = `p-3 rounded-md text-sm max-w-[80%] ${
    sender === 'user'
      ? 'self-end bg-primary-100 text-primary-900'
      : 'self-start bg-opal-blush text-opal-deep'
  }`;

  message.textContent = `${sender === 'user' ? 'You' : 'Opal'}: ${parseWithEmojis(text)}`;
  chatPanel.appendChild(message);
  scrollToBottom();
}

function loadChatMemory() {
  const saved = sessionStorage.getItem('opal-chat');
  if (saved) {
    const messages = JSON.parse(saved);
    messages.forEach(({ sender, text }) => createMessage(sender, text));
  } else {
    createMessage('opal', getTimeGreeting());
  }
}

function saveChatMessage(sender, text) {
  const saved = sessionStorage.getItem('opal-chat');
  const messages = saved ? JSON.parse(saved) : [];
  messages.push({ sender, text });
  sessionStorage.setItem('opal-chat', JSON.stringify(messages));
}

// Delay until DOM is fully loaded AND elements are mounted
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const chatForm = document.getElementById('opal-form');
    const userInput = document.getElementById('opal-input');
    const chatPanel = document.getElementById('chat-panel');

    if (!chatForm || !userInput || !chatPanel) {
      console.warn("Chat elements not found on page.");
      return;
    }

    loadChatMemory();

    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = userInput.value.trim();
      if (!input) return;

      createMessage('user', input);
      saveChatMessage('user', input);
      userInput.value = '';

      createMessage('opal', '...');

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input }),
        });

        const data = await res.json();
        chatPanel.lastChild.remove();
        const reply = data.reply || 'Hmm... nothing to say 😽';
        createMessage('opal', reply);
        saveChatMessage('opal', reply);
      } catch (err) {
        chatPanel.lastChild.remove();
        const fallback = 'Oops! I got tangled in yarn 🧶';
        createMessage('opal', fallback);
        saveChatMessage('opal', fallback);
      }
    });
  }, 100); // slight delay ensures AlpineJS or Astro rendering is done
});