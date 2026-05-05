import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/utils/cms';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const users: any[] = await getUsers();

    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      role: 'user',
    };

    users.push(newUser);
    await saveUsers(users);

    return NextResponse.json({ success: true, user: { email, role: 'user' } });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Signup failed', details: error?.message || String(error) },
      { status: 500 },
    );
  }
}
