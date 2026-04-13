import { NextResponse } from 'next/server';
import { getNewsletterSubscribers } from '@/utils/cms';

export async function GET() {
  const subscribers = await getNewsletterSubscribers();
  return NextResponse.json(subscribers);
}
