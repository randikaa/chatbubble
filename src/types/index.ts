export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  profileImage?: string;
  profile_image?: string;
  createdAt?: string;
  created_at?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId?: string;
  from_user_id?: string;
  toUserId?: string;
  to_user_id?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
  created_at?: string;
}

export interface Chat {
  userId: string;
  userName: string;
  profileImage: string;
  lastMessage?: string;
  timestamp?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}
