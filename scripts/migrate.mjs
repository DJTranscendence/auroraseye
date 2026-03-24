
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace with your service account path OR rely on ADC
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountPath) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountPath))
  });
} else {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'auroras-eye-films-v1'
  });
}

const db = admin.firestore();
const DATA_DIR = path.join(__dirname, '../src/data');

async function migrate() {
  const files = ['films.json', 'team.json', 'config.json', 'users.json', 'newsletter.json'];

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const collectionName = file.replace('.json', '');
    console.log(`Migrating ${collectionName}...`);

    if (collectionName === 'config') {
      await db.collection('config').doc('home').set(data);
    } else if (collectionName === 'newsletter') {
      for (const email of data) {
        await db.collection('newsletter').doc(email).set({ subscribedAt: new Date().toISOString() });
      }
    } else {
      for (const item of data) {
        // Use custom ID if it exists, otherwise auto-generate
        const { id, ...content } = item;
        if (id) {
          await db.collection(collectionName).doc(id).set(content);
        } else {
          await db.collection(collectionName).add(content);
        }
      }
    }
  }

  console.log('Migration complete!');
}

migrate().catch(console.error);
