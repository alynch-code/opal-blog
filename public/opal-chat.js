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

document.addEventListener('DOMContentLoaded', () => {
  const chatPanel = document.getElementById('chat-panel');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');

  if (!chatPanel || !chatForm || !userInput) {
    console.warn('Chat elements not found on page.');
    return;
  }

  // Utility: Scroll to bottom
  const scrollToBottom = () => {
    chatPanel.scrollTop = chatPanel.scrollHeight;
  };

  // Utility: Add message to panel
  const addMessage = (sender, text, mood = '') => {
    const msg = document.createElement('div');
    msg.className = `p-2 rounded-md ${sender === 'Opal' ? 'bg-opal-blush self-start' : 'bg-opal-sky self-end'} max-w-[75%]`;
    msg.innerHTML = `<strong>${sender}${mood ? ` ${mood}` : ''}:</strong> ${text}`;
    chatPanel.appendChild(msg);
    scrollToBottom();
  };

  // Mood-based emoji (simplified)
  const getMoodEmoji = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('sleep') || lower.includes('bored')) return '😴';
    if (lower.includes('happy') || lower.includes('yay')) return '😺';
    if (lower.includes('sad') || lower.includes('help')) return '😿';
    if (lower.includes('cozy') || lower.includes('purr')) return '🐾';
    return '';
  };

  // Handle form submission
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = userInput.value.trim();
    if (!input) return;

    addMessage('You', input);
    userInput.value = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      const mood = getMoodEmoji(data.reply);
      addMessage('Opal', data.reply, mood);
    } catch (err) {
      addMessage('Opal', 'Oops! I got my paws tangled in the internet 😿');
      console.error('Chat error:', err);
    }
  });
});
