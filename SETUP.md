# ChatBubble Setup Guide

## Features
- User authentication (signup/signin)
- Profile with random avatar images
- Friend request system
- Real-time chat with Supabase
- Explore users and connect
- Supabase for database and real-time updates

## Setup Instructions

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Supabase

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

Quick steps:
1. Create account at https://supabase.com
2. Create new project
3. Run the SQL from SUPABASE_SETUP.md to create tables
4. Copy your Project URL and anon key

### 3. Environment Variables

Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run the App
```bash
pnpm dev
```

Visit `http://localhost:3000`

## How It Works

### Authentication
- Users sign up with name, email, and password
- Profile pictures are generated using DiceBear API
- User data is stored in JSONBin.io

### Friend Requests
- Browse all users in the Explore tab
- Send friend requests to users
- Accept or reject incoming requests
- Only accepted friends appear in your chat list

### Chat System
- Chats are stored in Supabase PostgreSQL (persistent across devices)
- **Real-time updates using Supabase Realtime** (instant, no polling!)
- Messages appear instantly across all devices and browsers
- Optimistic UI updates for instant message feedback
- Works across different browsers and devices
- Each chat is identified by a unique ID combining both user IDs
- Automatic message ordering by timestamp

### Data Storage
- **Supabase PostgreSQL**: User accounts, friend requests, and chat messages
- **LocalStorage**: Current user session (1 month expiration)
- **Supabase Realtime**: Instant message updates across all devices

## Project Structure
```
src/
├── app/
│   ├── api/              # API routes
│   ├── chat/[userId]/    # Chat interface
│   ├── dashboard/        # User dashboard
│   ├── explore/          # Browse users
│   ├── signin/           # Sign in page
│   └── signup/           # Sign up page
├── context/
│   └── AuthContext.tsx   # Authentication context
├── lib/
│   ├── jsonbin.ts        # JSONBin API helpers
│   └── storage.ts        # Browser storage helpers
└── types/
    └── index.ts          # TypeScript types
```

## Notes
- Passwords are stored in plain text (for demo purposes only - use Supabase Auth in production)
- Chat messages are persistent and work across all devices
- **Real-time updates are instant using Supabase Realtime subscriptions**
- Profile images are randomly generated based on email using DiceBear API
- User sessions last 1 month before requiring re-login
- Free Supabase tier includes: 500MB database, 2GB bandwidth, real-time subscriptions
