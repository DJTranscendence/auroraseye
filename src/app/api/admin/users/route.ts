import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/utils/cms';

export async function GET() {
  const users = await getUsers();
  // Don't send passwords in a real app, but for this demo I will as they are plain text
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  await saveUsers(body);
  return NextResponse.json({ success: true });
}
