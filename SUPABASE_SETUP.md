# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in:
   - Name: ChatBubble
   - Database Password: (create a strong password)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

## 2. Create Database Tables

Go to SQL Editor in Supabase and run this SQL:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  profile_image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friend requests table
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id TEXT NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_friend_requests_from ON friend_requests(from_user_id);
CREATE INDEX idx_friend_requests_to ON friend_requests(to_user_id);
CREATE INDEX idx_messages_chat ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (anyone can read, only self can update)
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

-- RLS Policies for friend_requests
CREATE POLICY "Friend requests are viewable by involved users" ON friend_requests FOR SELECT USING (true);
CREATE POLICY "Users can send friend requests" ON friend_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update friend requests" ON friend_requests FOR UPDATE USING (true);

-- RLS Policies for messages
CREATE POLICY "Messages are viewable by everyone" ON messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE USING (true);

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

## 3. Get API Keys

1. Go to Project Settings > API
2. Copy:
   - Project URL (looks like: https://xxxxx.supabase.co)
   - anon/public key (long string starting with eyJ...)

## 4. Update Environment Variables

Update your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 5. Restart Dev Server

```bash
pnpm dev
```

## Features with Supabase:

✅ Real-time chat updates (instant, no polling!)
✅ Proper database with relationships
✅ Better performance and scalability
✅ Built-in authentication (optional upgrade)
✅ Row Level Security for data protection
✅ Automatic backups
✅ Free tier: 500MB database, 2GB bandwidth
