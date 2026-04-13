import { NextResponse } from 'next/server';

export async function GET() {
  const status: any = {
    env: {
       projectId: 'mock-project',
       hasKey: false,
    },
    apps: 0,
    firestore: 'Not connected (Firebase removed)',
    filmsCount: 0,
  };

  return NextResponse.json(status);
}
