function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️ Good meowning! Did you dream of yarn?";
  if (hour < 18) return "🌤️ Opal hopes your afternoon is full of sunbeams.";
  return "🌙 Cozy night ahead. I'm here if you need a soft paw.";
}

function scrollToBottom() {
  const chatPanel = document.getElementById('chat-panel');
  if (chatPanel) {
    chatPanel.scrollTop = chatPanel.scrollHeight;
  }
}


const initialGreeting = getTimeGreeting();

// opal-chat.js

document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatPanel = document.getElementById('chat-panel');

  const scrollToBottom = () => {
    chatPanel.scrollTop = chatPanel.scrollHeight;
  };

  const createMessage = (sender, text) => {
    const message = document.createElement('div');
    message.className = `p-3 rounded-md text-sm max-w-[80%] ${
      sender === 'user'
        ? 'self-end bg-primary-100 text-primary-900'
        : 'self-start bg-opal-blush text-opal-deep'
    }`;

    // Emoji swap
    const emojiReplacements = {
      '*yawn*': '😪',
      '*purr*': '😸',
      '*stretch*': '🐾',
      '*sleep*': '💤',
      '*hiss*': '😾',
      '*meow*': '🐱',
    };

    let parsedText = text;
    Object.entries(emojiReplacements).forEach(([txt, emoji]) => {
      parsedText = parsedText.replaceAll(txt, emoji);
    });

    message.textContent = `${sender === 'user' ? 'You' : 'Opal'}: ${parsedText}`;
    chatPanel.appendChild(message);
    scrollToBottom();
  };

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = userInput.value.trim();
    if (!input) return;

    createMessage('user', input);
    userInput.value = '';

    createMessage('opal', '...'); // typing placeholder

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      chatPanel.lastChild.remove(); // remove "..." placeholder
      createMessage('opal', data.reply || 'Hmm... nothing to say 😽');
    } catch (err) {
      chatPanel.lastChild.remove();
      createMessage('opal', 'Oops! I got tangled in yarn 🧶');
    }
  });
});
