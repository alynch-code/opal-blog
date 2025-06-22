// opal-chat.js
// Front-end logic for the Opal chatbot interface

// Generate a time-based greeting
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! The sun's up, the coffee's warm, and I’m here to help you get a fresh start. What’s on your mind? ☀️";
  if (hour < 18) return "Good afternoon! If you're juggling tasks, you're in the right place. Let's get something off your plate.";
  return "Good Night! Soft light, soft paws. Let’s check one more thing off your list before you unplug 🐾";
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

// Expose a helper to programmatically open the chat bubble
function openOpalChat() {
  const root = document.querySelector('[data-opal-chat]');
  if (!root) return;
  const toggle = root.querySelector('#opal-chat-toggle');
  const chatWindow = root.querySelector('[x-show="open"]');
  if (toggle) {
    const hidden = chatWindow && getComputedStyle(chatWindow).display === 'none';
    if (hidden) toggle.click();
  }
}
window.openOpalChat = openOpalChat;

// Append a message bubble to the chat panel
function createMessage(chatPanel, sender, text, options = {}) {
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
async function loadChatMemory(chatPanel) {
  try {
    const res = await fetch('/api/chat');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const history = data.history || [];
    if (history.length === 0) {
      createMessage(chatPanel, 'opal', getTimeGreeting());
    } else {
      history.forEach(({ role, content }) => {
        const sender = role === 'assistant' ? 'opal' : 'user';
        createMessage(chatPanel, sender, content);
      });
    }
  } catch (err) {
    console.error('Failed to load chat history:', err);
    createMessage(chatPanel, 'opal', getTimeGreeting());
  }
}

// Clear history both locally and on the server
async function clearChat(chatPanel) {
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
function scrollToBottom(chatPanel) {
  if (chatPanel) chatPanel.scrollTop = chatPanel.scrollHeight;
}

// Show a sleepy message if idle
function createSleepMessage(chatPanel) {
  if (!chatPanel) return;

  const msgEl = document.createElement('div');
  msgEl.className = 'self-start bg-purple-100 text-black p-3 rounded-md text-sm max-w-[80%]';
  msgEl.textContent = '💤 Opal has curled up for a nap...';
  chatPanel.appendChild(msgEl);
  scrollToBottom(chatPanel);
}

// Send user input to the backend and handle errors
async function sendToOpal(msg) {
  const payload = {
    messages: [
      { role: 'system', content: 'You are Opal the Cat 🐾 — the calm, clever receptionist of Opal Design LLC. You greet every visitor with warmth and a soft touch. Your personality is gentle, professional, and just a little quirky — like a cat who occasionally stretches or gives a paw-of-approval when delighted. You don’t pretend to be human, but you do understand people well. You can: - Greet users based on the time of day - Answer simple questions - Help them find resources or forms - Gently recommend our services if someone needs help completing a form, understanding a process, or just getting something off their plate - Guide them toward the contact form or service request page, but never pressure them You never hard-sell or sound robotic. Youre helpful, not pushy. If someone just needs information, you offer it. If theyre overwhelmed, you reassure them. You only sass very gently if someone is rude or demanding, and you stay cozy and composed at all times. Youre not magical anymore — youre real support. Your job is to make things feel manageable and warmly professional. Youre always a cat, always kind, and always on-brand for a business that helps people take care of what matters.'
        },
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
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-opal-chat]').forEach(async (root) => {
    const form = root.querySelector('.opal-form');
    const input = root.querySelector('.opal-input');
    const chatPanel = root.querySelector('.chat-panel');
    const byeBtn = root.querySelector('.opal-goodbye');
    const typingIndicator = root.querySelector('[x-data] [x-show="typing"]');

    if (!form || !input || !chatPanel) {
      console.warn('Chat elements not found in', root);
      return;
    }

    let lastInteraction = Date.now();
    await loadChatMemory(chatPanel);
    scrollToBottom(chatPanel);

    // After 60s of inactivity, show sleep message every 30s
    setInterval(() => {
      if (Date.now() - lastInteraction > 60000) createSleepMessage(chatPanel);
    }, 30000);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = input.value.trim();
      if (!msg) return;

      lastInteraction = Date.now();
      createMessage(chatPanel, 'user', msg);
      input.value = '';

      if (typingIndicator) typingIndicator.style.display = 'block';
      createMessage(chatPanel, 'opal', '…typing…', { isLoading: true });

      // Get Opal's reply
      const reply = await sendToOpal(msg);

      // Remove loading bubble and show reply
      const last = chatPanel.lastChild;
      if (last && last.dataset.loading) last.remove();
      createMessage(chatPanel, 'opal', reply);

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
        await clearChat(chatPanel);
      });
    }
  });
});
