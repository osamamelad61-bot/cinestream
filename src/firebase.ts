import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Firestore (default database)
export const db = getFirestore(app);

// Firebase Authentication
export const auth = getAuth(app);

// Optional: export app if needed elsewhere
export default app;
