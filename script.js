document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('ai-question-input');
    const sendBtn = document.getElementById('ai-ask-button');
    const messagesContainer = document.getElementById('ai-chat-messages');

    // Function to add a message to the chat
    function addMessage(content, type) { // type: 'user' or 'bot'
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('ai-message', type);
        // Escape HTML to prevent XSS (simple version)
        const text = document.createTextNode(content);
        msgDiv.appendChild(text);
        messagesContainer.appendChild(msgDiv);
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to handle sending a message
    async function sendMessage() {
        const question = textarea.value.trim();
        if (!question) {
            // Optionally show a placeholder or just return
            return;
        }
        // Clear textarea
        textarea.value = '';
        // Disable input while waiting? We'll just add user message and show thinking
        addMessage(question, 'user');
        // Show thinking message
        const thinkingId = 'thinking-' + Date.now();
        addMessage('Thinking...', 'bot');
        // We'll replace the last message (the thinking one) with the actual response
        // So we keep a reference to the last message element? Instead, we can add a temporary message and then update it.
        // Simpler: we add a bot message with a special class, then when we get the response we find the last .bot message and update it.
        // But we just added a thinking message, so we can get the last child.
        // However, if we want to show a spinner, we could use a placeholder. For simplicity, we'll just update the last bot message.

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer sk-993b46f1fe8a411081161f286de056d1',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'openai/gpt-4o-mini',
                    messages: [{ role: 'user', content: question }]
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            let answer = data.choices[0]?.message?.content;
            if (!answer) {
                answer = 'Sorry, I could not generate a response.';
            }

            // Find the last bot message (the one we just added) and replace its text
            const botMessages = messagesContainer.querySelectorAll('.ai-message.bot');
            if (botMessages.length > 0) {
                const lastBot = botMessages[botMessages.length - 1];
                lastBot.textContent = answer;
            } else {
                // Fallback: just add a new message
                addMessage(answer, 'bot');
            }
        } catch (error) {
            console.error('Error:', error);
            // Replace the thinking message with an error
            const botMessages = messagesContainer.querySelectorAll('.ai-message.bot');
            if (botMessages.length > 0) {
                const lastBot = botMessages[botMessages.length - 1];
                lastBot.textContent = 'Something went wrong, please try again.';
            } else {
                addMessage('Something went wrong, please try again.', 'bot');
            }
        }
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);

    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent newline
            sendMessage();
        }
    });

    // Optional: focus on textarea on load
    textarea.focus();
});