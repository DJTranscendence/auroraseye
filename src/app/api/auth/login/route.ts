import { NextResponse } from 'next/server';
import { getUsers } from '@/utils/cms';
import { OAUTH_GOOGLE_PASSWORD_MARKER } from '@/config/auth-oauth';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  const users = await getUsers();
  const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const user = users.find(
    (u: any) => typeof u.email === 'string' && u.email.trim().toLowerCase() === normalized,
  ) as any;

  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  if (user.password === OAUTH_GOOGLE_PASSWORD_MARKER) {
    return NextResponse.json(
      { error: 'This account uses Google sign-in. Use “Continue with Google” on the login page.' },
      { status: 401 },
    );
  }

  if (user.password !== password) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  return NextResponse.json({ success: true, user: { email: user.email, role: user.role } });
}
