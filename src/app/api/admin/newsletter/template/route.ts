import { NextResponse } from 'next/server';
import { getNewsletterTemplate, saveNewsletterTemplate } from '@/utils/cms';

export async function GET() {
  const template = await getNewsletterTemplate();
  return NextResponse.json(template);
}

export async function POST(request: Request) {
  const body = await request.json();
  const template = await saveNewsletterTemplate(body);
  return NextResponse.json({ success: true, template });
}
