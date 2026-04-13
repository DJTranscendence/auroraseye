import { NextResponse } from 'next/server';
import { recordYouTubeClick } from '@/utils/cms';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.url || !body?.location || !body?.label) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await recordYouTubeClick({
      label: body.label,
      url: body.url,
      location: body.location,
      pathname: body.pathname ?? '/',
      timestamp: body.timestamp ?? new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}