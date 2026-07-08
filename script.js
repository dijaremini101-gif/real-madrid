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

    function getBotReply(question) {
        const q = question.toLowerCase();

        if (q.includes('trophy') || q.includes('champions') || q.includes('league')) {
            return 'Real Madrid have won 15 UEFA Champions League titles and 36 La Liga titles, making them one of the most decorated clubs in football history.';
        }

        if (q.includes('stadium') || q.includes('bernabeu')) {
            return 'The Santiago Bernabéu is Real Madrid’s iconic home stadium and has been upgraded into a modern venue with a retractable roof, huge screens, and world-class facilities.';
        }

        if (q.includes('player') || q.includes('star') || q.includes('bellingham') || q.includes('vinicius') || q.includes('mbappe') || q.includes('modri')) {
            return 'Real Madrid’s squad features stars such as Jude Bellingham, Vinícius Jr., Rodrygo, and Kylian Mbappé, alongside experienced leaders like Luka Modrić.';
        }

        if (q.includes('coach') || q.includes('manager') || q.includes('carlo')) {
            return 'Real Madrid’s legendary history has been shaped by managers such as Carlo Ancelotti, who is widely respected for his success and experience.';
        }

        if (q.includes('founded') || q.includes('history')) {
            return 'Real Madrid was founded in 1902 and has grown into one of the most successful football clubs in the world.';
        }

        if (q.includes('transfer') || q.includes('sign')) {
            return 'Real Madrid is known for making major transfer moves and building teams around elite talent, especially in the European and global football market.';
        }

        return 'I can help with Real Madrid’s history, trophies, stadium, players, transfers, and current squad. Try asking about a player, a trophy, or the Bernabéu.';
    }

    // Function to handle sending a message
    async function sendMessage() {
        const question = textarea.value.trim();
        if (!question) {
            return;
        }

        textarea.value = '';
        addMessage(question, 'user');
        addMessage('Thinking...', 'bot');

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
                answer = getBotReply(question);
            }

            const botMessages = messagesContainer.querySelectorAll('.ai-message.bot');
            if (botMessages.length > 0) {
                const lastBot = botMessages[botMessages.length - 1];
                lastBot.textContent = answer;
            } else {
                addMessage(answer, 'bot');
            }
        } catch (error) {
            console.error('Error:', error);
            const botMessages = messagesContainer.querySelectorAll('.ai-message.bot');
            if (botMessages.length > 0) {
                const lastBot = botMessages[botMessages.length - 1];
                lastBot.textContent = getBotReply(question);
            } else {
                addMessage(getBotReply(question), 'bot');
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