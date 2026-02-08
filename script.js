document.addEventListener('DOMContentLoaded', () => {
    console.log('Irene Luxury Hair Chat Initialized');

    const chatWidget = document.getElementById('chat-widget-container');
    const chatTrigger = document.getElementById('chat-trigger');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    const N8N_WEBHOOK_URL = 'https://irenenotions.app.n8n.cloud/webhook/a4143705-eca0-4d53-a1db-49416a6824a6/chat';

    // Toggle Chat Window
    chatTrigger.addEventListener('click', () => {
        const isOpen = chatWidget.classList.contains('chat-open');
        if (isOpen) {
            chatWidget.classList.remove('chat-open');
            chatWidget.classList.add('chat-closed');
            console.log('Chat closed via trigger');
        } else {
            chatWidget.classList.remove('chat-closed');
            chatWidget.classList.add('chat-open');
            console.log('Chat opened via trigger');
        }
    });

    closeChat.addEventListener('click', () => {
        chatWidget.classList.remove('chat-open');
        chatWidget.classList.add('chat-closed');
        console.log('Chat closed');
    });

    // Handle Form Submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        console.log('User sent message:', message);

        // Add User Message
        appendMessage('user', message);
        chatInput.value = '';

        // Typing Indicator
        const typingId = appendTypingIndicator();

        try {
            console.log('Sending request to n8n...');
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

            console.log('n8n response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('n8n response data:', data);

            removeTypingIndicator(typingId);

            // Robust data extraction
            let botResponse = "";
            if (Array.isArray(data)) {
                botResponse = data[0].output || data[0].message || data[0].text;
            } else {
                botResponse = data.output || data.message || data.text || data.response;
            }

            if (!botResponse) {
                console.warn('n8n returned empty or unrecognized format:', data);
                botResponse = "Thank you for reaching out. We will get back to you shortly!";
            }

            appendMessage('bot', botResponse);

        } catch (error) {
            console.error('CRITICAL: Error communicating with n8n:', error);
            removeTypingIndicator(typingId);
            appendMessage('bot', "I'm having trouble connecting to my luxury advisor right now. Please try again or check your internet connection.");
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
        typingDiv.innerHTML = `<p><em>Luxury advisor is thinking...</em></p>`;
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
            console.log('New session generated:', sid);
        }
        return sid;
    }
});
