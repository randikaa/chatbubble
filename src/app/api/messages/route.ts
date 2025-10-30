import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const chatId = request.nextUrl.searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Transform to match frontend format
    const formattedMessages = messages?.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      text: msg.text,
      timestamp: msg.created_at,
    })) || [];

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { chatId, message } = await request.json();

    if (!chatId || !message) {
      return NextResponse.json({ error: 'Chat ID and message required' }, { status: 400 });
    }

    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: message.senderId,
        text: message.text,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    // Get all messages for this chat
    const { data: allMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    const formattedMessages = allMessages?.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      text: msg.text,
      timestamp: msg.created_at,
    })) || [];

    return NextResponse.json({
      message: {
        id: newMessage.id,
        senderId: newMessage.sender_id,
        text: newMessage.text,
        timestamp: newMessage.created_at,
      },
      messages: formattedMessages
    });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const chatId = request.nextUrl.searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('chat_id', chatId);

    if (error) {
      console.error('Error deleting messages:', error);
      return NextResponse.json({ error: 'Failed to delete messages' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting messages:', error);
    return NextResponse.json({ error: 'Failed to delete messages' }, { status: 500 });
  }
}
