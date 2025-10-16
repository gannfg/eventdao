import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time errors
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { verified: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { userId, requiredMention, requiredHashtag } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
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
    
    // Get user's recent tweets
    const response = await fetch(
      `https://api.twitter.com/2/users/${user.x_account_id}/tweets?max_results=10&tweet.fields=created_at`,
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
        { verified: false, error: 'Failed to fetch tweets' },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    
    // Check if any recent tweet matches criteria
    const hasTweet = data.data?.some((tweet: any) => {
      const text = tweet.text.toLowerCase();
      const mentionMatch = !requiredMention || text.includes(requiredMention.toLowerCase());
      const hashtagMatch = !requiredHashtag || text.includes(requiredHashtag.toLowerCase());
      return mentionMatch && hashtagMatch;
    });
    
    return NextResponse.json({ 
      verified: hasTweet || false,
      tweetsChecked: data.data?.length || 0
    });
  } catch (error) {
    console.error('Verify tweet error:', error);
    return NextResponse.json(
      { verified: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

