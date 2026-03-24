import { NextResponse } from 'next/server';
import { getSubscribers, addSubscriber } from '@/utils/cms';

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;
  
  const emails = await getSubscribers();
  
  if (emails.includes(email)) {
    return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
  }
  
  await addSubscriber(email);
  
  return NextResponse.json({ success: true });
}
