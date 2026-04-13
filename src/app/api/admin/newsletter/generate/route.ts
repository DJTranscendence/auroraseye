import { NextResponse } from 'next/server';
import { generateNewsletterTemplateFromNews } from '@/utils/cms';

export async function POST() {
  try {
    const result = await generateNewsletterTemplateFromNews();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate newsletter template',
        details: error.message || String(error),
      },
      { status: 500 },
    );
  }
}
