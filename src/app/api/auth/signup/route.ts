import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password,
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      })
      .select()
      .single();

    if (error) {
      console.error('Signup error:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
