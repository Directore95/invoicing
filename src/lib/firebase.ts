import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCVO_JyJf3QYmnx84mFEbl8H8JR9lWSKy4",
  authDomain: "wamc-7f599.firebaseapp.com",
  projectId: "wamc-7f599",
  storageBucket: "wamc-7f599.firebasestorage.app",
  messagingSenderId: "625801280571",
  appId: "1:625801280571:web:7008abdc4ed066f608b01e",
  measurementId: "G-59RG4FSMXN",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

// Initialize Firestore with persistent local cache for offline support.
// This ensures data loads instantly on refresh from IndexedDB cache,
// then syncs with the server in the background.
function createFirestore() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    // If Firestore was already initialized (e.g. HMR), get the existing instance
    return getFirestore(app);
  }
}

export const db = createFirestore();

export const googleProvider = new GoogleAuthProvider();
