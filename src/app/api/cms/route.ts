import { NextResponse } from 'next/server';
import { getFilms, saveFilms, getTeam, saveTeam, getConfig, saveConfig } from '@/utils/cms';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type === 'films') {
      return NextResponse.json(await getFilms());
    } else if (type === 'team') {
      return NextResponse.json(await getTeam());
    } else if (type === 'config') {
      return NextResponse.json(await getConfig());
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('API GET error:', error);
    return NextResponse.json({ 
      error: 'Backend Failure', 
      details: error.message || String(error),
      env: {
        hasKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      }
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const body = await request.json();
    
    if (type === 'films') {
      await saveFilms(body);
      return NextResponse.json({ success: true });
    } else if (type === 'team') {
      await saveTeam(body);
      return NextResponse.json({ success: true });
    } else if (type === 'config') {
      await saveConfig(body);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
     console.error('API POST error:', error);
     return NextResponse.json({ 
       error: 'Backend Failure', 
       details: error.message || String(error) 
     }, { status: 500 });
  }
}
