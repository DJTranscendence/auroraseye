import { NextResponse } from 'next/server';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export async function GET() {
  const status: any = {
    env: {
       projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
       hasKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    },
    apps: getApps().length,
  };

  try {
     const db = getFirestore();
     status.firestore = 'Initialized';
     const test = await db.collection('films').limit(1).get();
     status.filmsCount = test.size;
  } catch (e: any) {
     status.error = e.message || String(e);
  }

  return NextResponse.json(status);
}
