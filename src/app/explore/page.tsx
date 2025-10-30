'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { User, FriendRequest } from '@/types';

export default function Explore() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [requestUsers, setRequestUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Filter pending requests received by current user
  const pendingRequests = requests.filter(
    r => (r.toUserId === user?.id || r.to_user_id === user?.id) && r.status === 'pending'
  );

  // Filter pending requests sent by current user
  const sentRequests = requests.filter(
    r => (r.fromUserId === user?.id || r.from_user_id === user?.id) && r.status === 'pending'
  );

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    fetchRequests();
  }, [user, router]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/requests?userId=${user?.id}`);
      const data = await response.json();
      const allRequests = data.requests || [];
      setRequests(allRequests);

      // Fetch user details for all requests
      const userIds = new Set<string>();
      allRequests.forEach((r: FriendRequest) => {
        if (r.fromUserId || r.from_user_id) userIds.add(r.fromUserId || r.from_user_id || '');
        if (r.toUserId || r.to_user_id) userIds.add(r.toUserId || r.to_user_id || '');
      });

      // Remove current user ID
      userIds.delete(user?.id || '');

      // Fetch all user details
      const userPromises = Array.from(userIds).map(id =>
        fetch(`/api/users/${id}`).then(res => res.json()).then(data => data.user)
      );

      const users = await Promise.all(userPromises);
      setRequestUsers(users.filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchEmail.trim()) {
      setSearchError('Please enter an email address');
      return;
    }

    setSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const response = await fetch(`/api/users/search?email=${encodeURIComponent(searchEmail)}`);
      const data = await response.json();

      if (!response.ok) {
        setSearchError(data.error || 'User not found');
        return;
      }

      if (data.user.id === user?.id) {
        setSearchError("That's you! Search for other users.");
        return;
      }

      setSearchResults([data.user]);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (toUserId: string) => {
    try {
      const response = await fetch('/api/requests/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: user?.id, toUserId }),
      });

      if (response.ok) {
        await fetchRequests();
        // Refresh search results
        if (searchEmail) {
          handleSearch(new Event('submit') as any);
        }
      }
    } catch (error) {
      console.error('Failed to send request:', error);
    }
  };

  const handleRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch('/api/requests/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });

      if (response.ok) {
        await fetchRequests();
        // Refresh search results
        if (searchEmail) {
          handleSearch(new Event('submit') as any);
        }
      }
    } catch (error) {
      console.error('Failed to handle request:', error);
    }
  };

  const getRequestStatus = (userId: string) => {
    const sent = requests.find(r => 
      (r.fromUserId === user?.id || r.from_user_id === user?.id) && 
      (r.toUserId === userId || r.to_user_id === userId)
    );
    const received = requests.find(r => 
      (r.fromUserId === userId || r.from_user_id === userId) && 
      (r.toUserId === user?.id || r.to_user_id === user?.id)
    );
    return { sent, received };
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">ChatBubble</h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Find Users</h2>
          <p className="text-gray-600 mb-4">Search for users by their email address to connect</p>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => {
                setSearchEmail(e.target.value);
                setSearchError('');
              }}
              placeholder="Enter email address..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={searching}
            />
            <button
              type="submit"
              disabled={searching || !searchEmail.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {searchError}
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results</h3>
            <div className="space-y-3">
              {searchResults.map((u) => {
                const { sent, received } = getRequestStatus(u.id);
                const isAccepted = sent?.status === 'accepted' || received?.status === 'accepted';

                return (
                  <div key={u.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={u.profileImage || u.profile_image}
                        alt={u.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">{u.name}</h3>
                        <p className="text-sm text-gray-600">{u.email}</p>
                      </div>
                    </div>

                    <div>
                      {isAccepted ? (
                        <Link
                          href={`/chat/${u.id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Chat
                        </Link>
                      ) : received?.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRequest(received.id, 'accepted')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRequest(received.id, 'rejected')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : sent?.status === 'pending' ? (
                        <span className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg">Pending</span>
                      ) : (
                        <button
                          onClick={() => sendRequest(u.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Send Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && pendingRequests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Pending Friend Requests ({pendingRequests.length})
            </h3>
            <div className="space-y-3">
              {pendingRequests.map((request) => {
                const requestUser = requestUsers.find(u => u.id === request.from_user_id || u.id === request.fromUserId);
                if (!requestUser) return null;

                return (
                  <div key={request.id} className="bg-blue-50 rounded-lg p-4 flex items-center justify-between border border-blue-200">
                    <div className="flex items-center gap-4">
                      <img
                        src={requestUser.profileImage || requestUser.profile_image}
                        alt={requestUser.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">{requestUser.name}</h3>
                        <p className="text-sm text-gray-600">{requestUser.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Sent {new Date(request.created_at || request.createdAt || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequest(request.id, 'accepted')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequest(request.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && sentRequests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Sent Requests ({sentRequests.length})
            </h3>
            <div className="space-y-3">
              {sentRequests.map((request) => {
                const requestUser = requestUsers.find(u => u.id === request.to_user_id || u.id === request.toUserId);
                if (!requestUser) return null;

                return (
                  <div key={request.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={requestUser.profileImage || requestUser.profile_image}
                        alt={requestUser.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">{requestUser.name}</h3>
                        <p className="text-sm text-gray-600">{requestUser.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Sent {new Date(request.created_at || request.createdAt || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                      Waiting for response
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
