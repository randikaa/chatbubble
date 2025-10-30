import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get accepted friend requests
    const { data: requests, error: requestsError } = await supabase
      .from('friend_requests')
      .select('from_user_id, to_user_id')
      .eq('status', 'accepted')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

    if (requestsError) {
      console.error('Error fetching chats:', requestsError);
      return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
    }

    // Get other user IDs
    const otherUserIds = requests?.map(r => 
      r.from_user_id === userId ? r.to_user_id : r.from_user_id
    ) || [];

    if (otherUserIds.length === 0) {
      return NextResponse.json({ chats: [] });
    }

    // Get user details
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, profile_image')
      .in('id', otherUserIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    const chats = users?.map(user => ({
      userId: user.id,
      userName: user.name,
      profileImage: user.profile_image,
    })) || [];

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}
