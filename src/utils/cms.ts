
import { getDb } from './firebase-admin';

const COLLECTIONS = {
  FILMS: 'films',
  TEAM: 'team',
  CONFIG: 'config',
  USERS: 'users',
  NEWSLETTER: 'newsletter',
};

// --- Films ---
export async function getFilms() {
  const snapshot = await getDb().collection(COLLECTIONS.FILMS).get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function saveFilms(films: any[]) {
  const db = getDb();
  for (const film of films) {
    const { id, ...data } = film;
    if (id) {
      await db.collection(COLLECTIONS.FILMS).doc(id).set(data, { merge: true });
    } else {
      await db.collection(COLLECTIONS.FILMS).add(data);
    }
  }
}

// --- Team ---
export async function getTeam() {
  const snapshot = await getDb().collection(COLLECTIONS.TEAM).get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function saveTeam(team: any[]) {
  const db = getDb();
  for (const member of team) {
    const { id, ...data } = member;
    if (id) {
      await db.collection(COLLECTIONS.TEAM).doc(id).set(data, { merge: true });
    } else {
      await db.collection(COLLECTIONS.TEAM).add(data);
    }
  }
}

// --- Config ---
export async function getConfig() {
  const doc = await getDb().collection(COLLECTIONS.CONFIG).doc('home').get();
  return doc.exists ? doc.data() : null;
}

export async function saveConfig(config: any) {
  await getDb().collection(COLLECTIONS.CONFIG).doc('home').set(config, { merge: true });
}

// --- Users ---
export async function getUsers() {
  const snapshot = await getDb().collection(COLLECTIONS.USERS).get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function saveUsers(users: any[]) {
  const db = getDb();
  for (const user of users) {
    const { id, ...data } = user;
    if (id) {
       await db.collection(COLLECTIONS.USERS).doc(id).set(data, { merge: true });
    } else {
       await db.collection(COLLECTIONS.USERS).add(data);
    }
  }
}

// --- Newsletter ---
export async function getSubscribers() {
  const snapshot = await getDb().collection(COLLECTIONS.NEWSLETTER).get();
  return snapshot.docs.map((doc: any) => doc.id); // Assuming doc ID is the email
}

export async function addSubscriber(email: string) {
  await getDb().collection(COLLECTIONS.NEWSLETTER).doc(email).set({ 
    subscribedAt: new Date().toISOString() 
  });
}
