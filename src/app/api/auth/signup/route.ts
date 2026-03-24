import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/utils/cms';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, role } = body;
  
  const users = await getUsers();
  
  if (users.find((u: any) => u.email === email)) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }
  
  const newUser = {
    id: Date.now().toString(),
    email,
    password, // In a real app, hash this!
    role: 'user'
  };
  
  users.push(newUser);
  await saveUsers(users);
  
  return NextResponse.json({ success: true, user: { email, role: 'user' } });
}
