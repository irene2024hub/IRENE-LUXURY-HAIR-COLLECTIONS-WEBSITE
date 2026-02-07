document.addEventListener('DOMContentLoaded', () => {
    const chatWidget = document.getElementById('chat-widget-container');
    const chatTrigger = document.getElementById('chat-trigger');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    const N8N_WEBHOOK_URL = 'https://irenenotions.app.n8n.cloud/webhook/a4143705-eca0-4d53-a1db-49416a6824a6/chat';

    // Toggle Chat Window
    chatTrigger.addEventListener('click', () => {
        chatWidget.classList.remove('chat-closed');
        chatWidget.classList.add('chat-open');
    });

    closeChat.addEventListener('click', () => {
        chatWidget.classList.remove('chat-open');
        chatWidget.classList.add('chat-closed');
    });

    // Handle Form Submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // Add User Message
        appendMessage('user', message);
        chatInput.value = '';

        // Typing Indicator
        const typingId = appendTypingIndicator();

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatInput: message,
                    sessionId: getSessionId()
                })
            });

            const data = await response.json();
            removeTypingIndicator(typingId);

            // Handle response from n8n
            // Assuming n8n returns an array or object with message/text
            const botResponse = data.output || data.message || data.text || "Thank you for reaching out. We will get back to you shortly!";
            appendMessage('bot', botResponse);

        } catch (error) {
            console.error('Error communicating with n8n:', error);
            removeTypingIndicator(typingId);
            appendMessage('bot', "I'm having trouble connecting right now. Please try again or contact us directly.");
        }
    });

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = id;
        typingDiv.className = 'message bot';
        typingDiv.innerHTML = `<p><em>Typing...</em></p>`;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function getSessionId() {
        let sid = localStorage.getItem('irene_chat_session');
        if (!sid) {
            sid = 'session-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('irene_chat_session', sid);
        }
        return sid;
    }
});
