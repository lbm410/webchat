document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const chatContainer = document.getElementById('chat-container');

    messageForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const message = messageInput.value;

        // Send the message to the backend
        const response = await fetch('https://webchatbackend.vercel.app/api/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatId: 'your-chat-id', // Replace with actual chat ID
                senderId: 'your-user-id', // Replace with actual sender ID
                content: message,
                type: 'text',
                mediaUrl: null
            })
        });

        if (response.ok) {
            // Display the message in the chat
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            chatContainer.appendChild(messageElement);
            messageInput.value = ''; // Clear the input field
        } else {
            console.error('Error sending message:', response.statusText);
        }
    });

    // Fetch and display existing messages
    async function fetchMessages() {
        const response = await fetch('https://webchatbackend.vercel.app/api/messages/chat/your-chat-id'); // Replace with actual chat ID

        if (response.ok) {
            const messages = await response.json();
            messages.forEach((msg) => {
                const messageElement = document.createElement('div');
                messageElement.textContent = msg.content;
                chatContainer.appendChild(messageElement);
            });
        } else {
            console.error('Error fetching messages:', response.statusText);
        }
    }

    fetchMessages();
});
