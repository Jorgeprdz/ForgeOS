// legacy/crmaddlife/chat-shell.js
// CRMAddlife compatibility chat shell.

import { Analytics } from '../../analytics-engine.js';

const _escapeHtml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#x27;');
};

const _handleChatSend = () => {

    const input    = document.getElementById('ai-chat-input');
    const messages = document.getElementById('ai-chat-messages');

    if (!input || !messages) return;

    const text = input.value.trim();
    if (!text) return;

    const userRow = document.createElement('div');
    userRow.className = 'msg-row user-row';
    userRow.innerHTML =
        `<div class="chat-bubble user-bubble">${_escapeHtml(text)}</div>`;
    messages.appendChild(userRow);

    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    Analytics.track('chat_message_sent');

    setTimeout(() => {
        const iaRow = document.createElement('div');
        iaRow.className = 'msg-row ia-row';
        iaRow.innerHTML =
            `<div class="chat-bubble ia-bubble">` +
                `Procesando tu consulta... (AI engine Phase 3)` +
            `</div>`;
        messages.appendChild(iaRow);
        messages.scrollTop = messages.scrollHeight;
    }, 600);
};

export function bindCrmAddlifeChatShell() {

    const chatBubble = document.getElementById('ai-chat-bubble');
    const chatWindow = document.getElementById('ai-chat-window');

    if (chatBubble && chatWindow) {
        chatBubble.addEventListener('click', () => {
            chatWindow.classList.add('chat-window-open');
            chatBubble.style.display = 'none';
            const input = document.getElementById('ai-chat-input');
            if (input) input.focus();
        });
    }

    const closeChat = document.getElementById('close-chat');
    if (closeChat && chatWindow && chatBubble) {
        closeChat.addEventListener('click', () => {
            chatWindow.classList.remove('chat-window-open');
            chatBubble.style.display = '';
        });
    }

    const sendBtn = document.getElementById('ai-chat-send');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            _handleChatSend();
        });
    }

    const chatInput = document.getElementById('ai-chat-input');
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                _handleChatSend();
            }
        });
    }
}
