document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const chatContainer = document.getElementById('chat-container');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    const chatList = document.getElementById('chat-list');
    const newChatBtn = document.getElementById('new-chat-btn');
    let selectedChatId = null;

    newChatBtn.addEventListener('click', async () => {
        const username = prompt('Enter username to chat with:');
        if (!username) return;

        const response = await fetch(`${API_URL}/api/chats/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ participants: [username] })
        });

        if (response.ok) {
            loadChats();
        } else {
            alert('Failed to create chat');
        }
    });

    messageForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!selectedChatId) {
            alert('Please select a chat first');
            return;
        }

        const message = messageInput.value;
        const file = fileInput.files[0];

        const formData = new FormData();
        formData.append('chatId', selectedChatId);
        formData.append('content', message);
        if (file) formData.append('file', file);

        const response = await fetch(`${API_URL}/api/messages/send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            displayMessage({ content: message });
            messageInput.value = '';
            fileInput.value = '';
        } else {
            alert('Failed to send message');
        }
    });

    async function loadChats() {
        const response = await fetch(`${API_URL}/api/chats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const chats = await response.json();
            chatList.innerHTML = '';
            chats.forEach(chat => {
                const chatElement = document.createElement('div');
                chatElement.textContent = chat.name;
                chatElement.addEventListener('click', () => {
                    selectChat(chat._id);
                });
                chatList.appendChild(chatElement);
            });
        } else {
            alert('Failed to load chats');
        }
    }

    async function selectChat(chatId) {
        selectedChatId = chatId;
        const response = await fetch(`${API_URL}/api/messages/chat/${chatId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const messages = await response.json();
            chatContainer.innerHTML = '';
            messages.forEach(message => {
                displayMessage(message);
            });
        } else {
            alert('Failed to load messages');
        }
    }

    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message.content;
        chatContainer.appendChild(messageElement);
    }

    loadChats();
});
