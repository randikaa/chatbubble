'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Chat } from '@/types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    fetchChats();
  }, [user, router]);

  const fetchChats = async () => {
    try {
      const response = await fetch(`/api/chats?userId=${user?.id}`);
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/signin');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">ChatBubble</h1>
          <div className="flex gap-4">
            <Link
              href="/explore"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Explore
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Chats</h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No chats yet. Go to Explore to connect with others!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chats.map((chat) => (
                <Link
                  key={chat.userId}
                  href={`/chat/${chat.userId}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition border border-gray-200"
                >
                  <img
                    src={chat.profileImage}
                    alt={chat.userName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{chat.userName}</h4>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    )}
                  </div>
                  {chat.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
