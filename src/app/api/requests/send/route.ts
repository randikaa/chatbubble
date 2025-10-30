import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { fromUserId, toUserId } = await request.json();

    // Check if request already exists
    const { data: existing } = await supabase
      .from('friend_requests')
      .select('id')
      .or(`and(from_user_id.eq.${fromUserId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${fromUserId})`)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Request already exists' }, { status: 400 });
    }

    // Create new request
    const { data: newRequest, error } = await supabase
      .from('friend_requests')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending request:', error);
      return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
    }

    return NextResponse.json({ request: newRequest });
  } catch (error) {
    console.error('Error sending request:', error);
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }
}
