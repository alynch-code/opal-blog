// opal-chat.js
// Front-end logic for the Opal chatbot interface

// Generate a time-based greeting
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️ Good meowning! Did you dream of yarn?";
  if (hour < 18) return "🌤️ Opal hopes your afternoon is full of sunbeams.";
  return "🌙 Cozy night ahead. I'm here if you need a soft paw.";
}

// Map text tokens to emojis
const emojiMap = {
  '*yawn*': '😪',
  '*purr*': '😸',
  '*stretch*': '🐾',
  '*sleep*': '💤',
  '*hiss*': '😾',
  '*meow*': '🐱',
};

// Replace tokens in a string with their corresponding emojis
function parseEmojis(text) {
  for (const [token, emoji] of Object.entries(emojiMap)) {
    text = text.replaceAll(token, emoji);
  }
  return text;
}

// Append a message bubble to the chat panel
function createMessage(sender, text, options = {}) {
  const chatPanel = document.getElementById('chat-panel');
  if (!chatPanel) return;

  const msgEl = document.createElement('div');
  msgEl.className = `p-3 rounded-md text-sm max-w-[80%] ${
    sender === 'user'
      ? 'self-end bg-primary-100 text-primary-900'
      : 'self-start bg-opal-blush text-opal-deep'
  }`;

  if (options.isLoading) {
    msgEl.dataset.loading = 'true';
    msgEl.textContent = text;
  } else {
    const prefix = sender === 'user' ? 'You: ' : 'Opal: ';
    msgEl.textContent = prefix + parseEmojis(text);
  }

  chatPanel.appendChild(msgEl);
  chatPanel.scrollTop = chatPanel.scrollHeight;
  return msgEl;
}

// Persist chat history in sessionStorage
// Fetch chat history from the server
async function loadChatMemory() {
  try {
    const res = await fetch('/api/chat');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const history = data.history || [];
    if (history.length === 0) {
      createMessage('opal', getTimeGreeting());
    } else {
      history.forEach(({ role, content }) => {
        const sender = role === 'assistant' ? 'opal' : 'user';
        createMessage(sender, content);
      });
    }
  } catch (err) {
    console.error('Failed to load chat history:', err);
    createMessage('opal', getTimeGreeting());
  }
}

// Clear history both locally and on the server
async function clearChat() {
  const chatPanel = document.getElementById('chat-panel');
  if (chatPanel) chatPanel.innerHTML = '';
  try {
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clear: true })
    });
  } catch (err) {
    console.error('Failed to clear chat:', err);
  }
}

// Scroll chat panel to bottom
function scrollToBottom() {
  const chatPanel = document.getElementById('chat-panel');
  if (chatPanel) chatPanel.scrollTop = chatPanel.scrollHeight;
}

// Show a sleepy message if idle
function createSleepMessage() {
  const chatPanel = document.getElementById('chat-panel');
  if (!chatPanel) return;

  const msgEl = document.createElement('div');
  msgEl.className = 'self-start bg-purple-100 text-black p-3 rounded-md text-sm max-w-[80%]';
  msgEl.textContent = '💤 Opal has curled up for a nap...';
  chatPanel.appendChild(msgEl);
  scrollToBottom();
}

// Send user input to the backend and handle errors
async function sendToOpal(msg) {
  const payload = {
    messages: [
      { role: 'system', content: 'You are Opal the Cat 🐾 — a cozy, magical feline who lives in a crystal-filled sunroom. You speak softly and whimsically, and your replies are short (1–3 lines). You adore naps, crystals, and moonbeams. You stretch mid-reply, yawn when bored, and give paw-of-approval when delighted. If a human asks something rude, you refuse to answer or sass them gently. If it’s boring, you ask for something more delightful. Never break character — you are always a cat, not an assistant or AI. Speak like a daydream.' },
      { role: 'user',  content: msg }
    ]
  };

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const serverMsg = errJson.error?.message || errJson.message || `HTTP ${res.status}`;
      throw new Error(serverMsg);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error('❗️ Opal chat error:', err);
    return `*yawn* ${err.message}`;
  }
}

// Initialize chat UI and event listeners
window.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('opal-form');
  const input = document.getElementById('opal-input');
  const chatPanel = document.getElementById('chat-panel');
  const byeBtn = document.getElementById('opal-goodbye');
  const typingIndicator = document.querySelector('[x-data] [x-show="typing"]');

  if (!form || !input || !chatPanel) {
    console.warn('Chat elements not found on page.');
    return;
  }

  let lastInteraction = Date.now();
  await loadChatMemory();
  scrollToBottom();

  // After 60s of inactivity, show sleep message every 30s
  setInterval(() => {
    if (Date.now() - lastInteraction > 60000) createSleepMessage();
  }, 30000);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;

    lastInteraction = Date.now();
    createMessage('user', msg);
    input.value = '';

    if (typingIndicator) typingIndicator.style.display = 'block';
    createMessage('opal', '…typing…', { isLoading: true });

    // Get Opal's reply
    const reply = await sendToOpal(msg);

    // Remove loading bubble and show reply
    const last = chatPanel.lastChild;
    if (last && last.dataset.loading) last.remove();
    createMessage('opal', reply);

    if (typingIndicator) typingIndicator.style.display = 'none';
  });

  // Send on Enter without shift
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });
   if (byeBtn) {
    byeBtn.addEventListener('click', async () => {
      await clearChat();
    });
  }
});
