import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  users: {
    id: string;
    name: string;
    email: string;
    password: string;
    profile_image: string;
    created_at: string;
  };
  friend_requests: {
    id: string;
    from_user_id: string;
    to_user_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
  };
  messages: {
    id: string;
    chat_id: string;
    sender_id: string;
    text: string;
    created_at: string;
  };
};
