import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
