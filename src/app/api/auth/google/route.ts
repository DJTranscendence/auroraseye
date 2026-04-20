import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { getSiteUrl } from '@/config/site';

/**
 * Starts Google OAuth. Configure in Google Cloud Console (OAuth 2.0 Web client):
 * - Authorized redirect URI: `{NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`
 * - For local dev set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` (match your dev port).
 */
export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const base = getSiteUrl();
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?error=google_not_configured', base));
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from')?.trim();
  const returnPath = from === 'signup' ? '/signup' : '/login';

  const redirectUri = `${base}/api/auth/google/callback`;
  const client = new OAuth2Client(clientId, clientSecret, redirectUri);
  const state = randomBytes(24).toString('hex');

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'select_account',
  });

  const res = NextResponse.redirect(url);
  res.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  res.cookies.set('google_oauth_return', returnPath, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return res;
}
