'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Message, User } from '@/types';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatId = [user?.id, userId].sort().join('_');
  const lastMessageCountRef = useRef(0);

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [chatId]);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    fetchOtherUser();
    loadMessages();
    
    // Set up Supabase real-time subscription
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            senderId: payload.new.sender_id,
            text: payload.new.text,
            timestamp: payload.new.created_at,
          };
          
          // Check if message already exists (prevent duplicates)
          setMessages((prev) => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userId, router, chatId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchOtherUser = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setOtherUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Save to server - real-time subscription will add it to UI
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chatId, 
          message: {
            senderId: user.id,
            text: messageText,
          }
        }),
      });

      if (!response.ok) {
        // Restore message on error
        setNewMessage(messageText);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageText);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCloseChat = async () => {
    if (confirm('Delete this chat? Messages will be permanently removed.')) {
      try {
        await fetch(`/api/messages?chatId=${chatId}`, { method: 'DELETE' });
        router.push('/dashboard');
      } catch (error) {
        console.error('Failed to delete chat:', error);
        router.push('/dashboard');
      }
    }
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
            ← Back
          </Link>
          {otherUser && (
            <>
              <img
                src={otherUser.profileImage || otherUser.profile_image}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold text-gray-800">{otherUser.name}</h2>
                <p className="text-xs text-green-600">Online</p>
              </div>
            </>
          )}
        </div>
        <button
          onClick={handleCloseChat}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
        >
          Close Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.senderId === user.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.senderId === user.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="bg-white border-t p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
