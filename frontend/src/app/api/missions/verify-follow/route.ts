import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, targetUsername } = await request.json();
    
    if (!userId || !targetUsername) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Get user's Twitter account info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('x_account_id, x_username')
      .eq('id', userId)
      .single();
    
    if (userError || !user?.x_account_id) {
      return NextResponse.json(
        { verified: false, error: 'X account not connected' },
        { status: 401 }
      );
    }
    
    // Use Twitter API to check if user follows target
    // Note: This requires a bearer token or OAuth 2.0 App-Only authentication
    const response = await fetch(
      `https://api.twitter.com/2/users/${user.x_account_id}/following?user.fields=username`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_ACCESS_TOKEN}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Twitter API error:', errorData);
      return NextResponse.json(
        { verified: false, error: 'Failed to verify follow status' },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    
    // Check if target username is in the following list
    const isFollowing = data.data?.some(
      (followedUser: any) => followedUser.username.toLowerCase() === targetUsername.toLowerCase()
    );
    
    return NextResponse.json({ verified: isFollowing });
  } catch (error) {
    console.error('Verify follow error:', error);
    return NextResponse.json(
      { verified: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

