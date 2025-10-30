import { Message } from '@/types';

// Local cache for better performance
const messageCache = new Map<string, Message[]>();

export function getCachedMessages(chatId: string): Message[] {
  return messageCache.get(chatId) || [];
}

export function setCachedMessages(chatId: string, messages: Message[]) {
  messageCache.set(chatId, messages);
}

export function clearCachedMessages(chatId: string) {
  messageCache.delete(chatId);
}
