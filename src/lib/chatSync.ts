import { Message } from '@/types';

// BroadcastChannel for real-time updates across tabs
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined') {
  broadcastChannel = new BroadcastChannel('chatbubble_messages');
}

export function initChatSync(chatId: string, onMessage: (messages: Message[]) => void) {
  if (!broadcastChannel) return () => {};

  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'NEW_MESSAGE' && event.data.chatId === chatId) {
      onMessage(event.data.messages);
    }
  };

  broadcastChannel.addEventListener('message', handleMessage);

  return () => {
    broadcastChannel?.removeEventListener('message', handleMessage);
  };
}

export function broadcastNewMessage(chatId: string, messages: Message[]) {
  if (!broadcastChannel) return;
  
  broadcastChannel.postMessage({
    type: 'NEW_MESSAGE',
    chatId,
    messages,
    timestamp: Date.now(),
  });
}

export function closeChatSync() {
  if (broadcastChannel) {
    broadcastChannel.close();
  }
}
