import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Support both NEXT_PUBLIC_TWITTER_CLIENT_ID and TWITTER_CLIENT_ID
    // Support TWITTER_CALLBACK_URL and NEXT_PUBLIC_TWITTER_CALLBACK_URL
    const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || process.env.TWITTER_CLIENT_ID;
    const redirectUri = process.env.TWITTER_CALLBACK_URL || process.env.NEXT_PUBLIC_TWITTER_CALLBACK_URL;
    
    if (!clientId || !redirectUri) {
      const missing: string[] = [];
      if (!clientId) missing.push('NEXT_PUBLIC_TWITTER_CLIENT_ID|TWITTER_CLIENT_ID');
      if (!redirectUri) missing.push('TWITTER_CALLBACK_URL|NEXT_PUBLIC_TWITTER_CALLBACK_URL');
      return NextResponse.json(
        { error: 'Twitter API credentials not configured', missing },
        { status: 500 }
      );
    }
    
    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(7);
    
    // Generate code verifier for PKCE (43-128 chars)
    const random = () => Math.random().toString(36).slice(2);
    const codeVerifier = (random() + random() + random()).slice(0, 64);

    // Compute S256 code challenge
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(digest));
    const codeChallenge = Buffer.from(new Uint8Array(hashArray))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // Build authorization URL
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'tweet.read users.read follows.read offline.access');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    
    // Store state and code_verifier in cookies for verification
    const response = NextResponse.redirect(authUrl.toString());
    
    response.cookies.set('twitter_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });
    
    response.cookies.set('twitter_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });
    
    return response;
  } catch (error) {
    console.error('Twitter OAuth initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Twitter OAuth' },
      { status: 500 }
    );
  }
}

