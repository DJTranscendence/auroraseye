import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'auroras-eye-films-v1';

if (!getApps().length) {
  initializeApp({ projectId });
}

export const getDb = () => getFirestore();

