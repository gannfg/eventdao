import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  // Create Supabase client inside the function to avoid build-time errors
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured');
    return NextResponse.redirect(
      new URL('/account?error=config_error', request.url)
    );
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Check for errors from Twitter
    if (error) {
      console.error('Twitter OAuth error:', error);
      return NextResponse.redirect(
        new URL('/account?error=twitter_denied', request.url)
      );
    }
    
    // Verify state to prevent CSRF
    const storedState = request.cookies.get('twitter_oauth_state')?.value;
    if (!state || state !== storedState) {
      return NextResponse.redirect(
        new URL('/account?error=invalid_state', request.url)
      );
    }
    
    if (!code) {
      return NextResponse.redirect(
        new URL('/account?error=no_code', request.url)
      );
    }
    
    // Get code verifier from cookie
    const codeVerifier = request.cookies.get('twitter_code_verifier')?.value;
    
    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL('/account?error=no_verifier', request.url)
      );
    }
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TWITTER_CALLBACK_URL!,
        code_verifier: codeVerifier,
      }).toString(),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL('/account?error=token_exchange_failed', request.url)
      );
    }
    
    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL('/account?error=no_access_token', request.url)
      );
    }
    
    // Get user information from Twitter
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    
    if (!userResponse.ok) {
      console.error('Failed to fetch user data');
      return NextResponse.redirect(
        new URL('/account?error=user_fetch_failed', request.url)
      );
    }
    
    const userData = await userResponse.json();
    
    // Get user ID from cookie or session (you'll need to implement this)
    const userId = request.cookies.get('user_id')?.value;
    
    if (!userId) {
      // Store Twitter data temporarily and redirect to get user ID
      return NextResponse.redirect(
        new URL(`/account?twitter_id=${userData.data.id}&twitter_username=${userData.data.username}`, request.url)
      );
    }
    
    // Update user record in Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({
        x_account_id: userData.data.id,
        x_username: userData.data.username,
        x_connected_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Failed to update user:', updateError);
      return NextResponse.redirect(
        new URL('/account?error=db_update_failed', request.url)
      );
    }
    
    // Success! Redirect back to account page
    const response = NextResponse.redirect(
      new URL('/account?twitter_connected=true', request.url)
    );
    
    // Clear OAuth cookies
    response.cookies.delete('twitter_oauth_state');
    response.cookies.delete('twitter_code_verifier');
    
    return response;
  } catch (error) {
    console.error('Twitter OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/account?error=callback_failed', request.url)
    );
  }
}

