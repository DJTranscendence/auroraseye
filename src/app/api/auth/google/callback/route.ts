import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';
import { getSiteUrl } from '@/config/site';
import { OAUTH_GOOGLE_PASSWORD_MARKER } from '@/config/auth-oauth';
import { getUsers, saveUsers } from '@/utils/cms';

function escapeForScriptJsonString(value: unknown): string {
  return JSON.stringify(JSON.stringify(value));
}

function htmlEscape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(request: Request) {
  const base = getSiteUrl();
  const loginError = (code: string) => {
    const returnPath = cookies().get('google_oauth_return')?.value?.trim() || '/login';
    const safePath = returnPath.startsWith('/') && !returnPath.startsWith('//') ? returnPath : '/login';
    const res = NextResponse.redirect(new URL(`${safePath}?error=${encodeURIComponent(code)}`, base));
    res.cookies.set('google_oauth_state', '', { httpOnly: true, maxAge: 0, path: '/' });
    res.cookies.set('google_oauth_return', '', { httpOnly: true, maxAge: 0, path: '/' });
    return res;
  };

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return loginError('google_not_configured');
  }

  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  if (error) {
    return loginError('google_denied');
  }

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  if (!code || !state) {
    return loginError('google_invalid');
  }

  const cookieStore = cookies();
  const expectedState = cookieStore.get('google_oauth_state')?.value;
  if (!expectedState || expectedState !== state) {
    return loginError('google_state');
  }

  const redirectUri = `${base}/api/auth/google/callback`;
  const client = new OAuth2Client(clientId, clientSecret, redirectUri);

  let email: string;
  try {
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      return loginError('google_no_id_token');
    }
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return loginError('google_no_email');
    }
    if (payload.email_verified === false) {
      return loginError('google_email_unverified');
    }
    email = payload.email.trim().toLowerCase();
  } catch {
    return loginError('google_token');
  }

  const users = (await getUsers()) as Array<{ id: string; email: string; password: string; role: string }>;
  let user = users.find((u) => u.email?.trim().toLowerCase() === email);

  if (!user) {
    user = {
      id: Date.now().toString(),
      email,
      password: OAUTH_GOOGLE_PASSWORD_MARKER,
      role: 'user',
    };
    users.push(user);
    await saveUsers(users);
  }

  const sessionUser = { email: user.email, role: user.role };
  const userLiteral = escapeForScriptJsonString(sessionUser);
  const nextPath = user.role === 'admin' ? '/admin' : '/';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex" />
  <title>Signing you in…</title>
</head>
<body>
  <p style="font-family:system-ui,sans-serif;padding:2rem;">Completing sign-in… If you are not redirected, <a href="${htmlEscape(nextPath)}">continue here</a>.</p>
  <script>
    try {
      localStorage.setItem('user', ${userLiteral});
    } catch (e) {}
    window.location.replace(${JSON.stringify(nextPath)});
  </script>
</body>
</html>`;

  const res = new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
  res.cookies.set('google_oauth_state', '', { httpOnly: true, maxAge: 0, path: '/' });
  res.cookies.set('google_oauth_return', '', { httpOnly: true, maxAge: 0, path: '/' });
  return res;
}
