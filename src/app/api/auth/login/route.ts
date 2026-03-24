import { NextResponse } from 'next/server';
import { getUsers } from '@/utils/cms';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;
  
  const users = await getUsers();
  const user = users.find((u: any) => u.email === email && u.password === password) as any;
  
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
  
  return NextResponse.json({ success: true, user: { email: user.email, role: user.role } });
}
