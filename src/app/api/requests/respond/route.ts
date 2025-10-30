import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { requestId, status } = await request.json();

    const { data: updatedRequest, error } = await supabase
      .from('friend_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error responding to request:', error);
      return NextResponse.json({ error: 'Failed to respond to request' }, { status: 500 });
    }

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error('Error responding to request:', error);
    return NextResponse.json({ error: 'Failed to respond to request' }, { status: 500 });
  }
}
