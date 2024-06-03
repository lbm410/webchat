document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const chatContainer = document.getElementById('chat-container');
    const chatTitle = document.getElementById('chat-title');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    const chatList = document.getElementById('chat-list');
    const newChatBtn = document.getElementById('new-chat-btn');
    const newGroupChatBtn = document.getElementById('new-group-chat-btn');
    const logoutBtn = document.getElementById('logout-btn');
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

    newGroupChatBtn.addEventListener('click', async () => {
        const chatName = prompt('Enter name for the group chat:');
        if (!chatName) return;

        const participants = prompt('Enter usernames of participants separated by commas:').split(',').map(u => u.trim());
        if (participants.length < 2) {
            alert('A group chat must have at least 2 participants.');
            return;
        }

        const response = await fetch(`${API_URL}/api/chats/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ participants, name: chatName })
        });

        if (response.ok) {
            loadChats();
        } else {
            alert('Failed to create group chat');
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
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
        formData.append('senderId', 'your-sender-id'); // Asegúrate de proporcionar el senderId correcto
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
                chatElement.className = 'chat-item';
                chatElement.textContent = chat.name || chat.participants.map(p => p.username).join(', ');
                chatElement.addEventListener('click', () => {
                    selectChat(chat._id, chat.name || chat.participants.map(p => p.username).join(', '));
                });
                chatList.appendChild(chatElement);
            });
        } else {
            alert('Failed to load chats');
        }
    }

    async function selectChat(chatId, chatName) {
        selectedChatId = chatId;
        chatTitle.textContent = chatName;
        const response = await fetch(`${API_URL}/api/messages/chat/${chatId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const messages = await response.json();
            const messageContainer = document.getElementById('message-container');
            messageContainer.innerHTML = '';
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
        const messageContainer = document.getElementById('message-container');
        messageContainer.appendChild(messageElement);
    }

    loadChats();
});
