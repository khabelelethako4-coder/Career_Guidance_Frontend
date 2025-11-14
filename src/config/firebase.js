// firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // ✅ Added Firebase Storage import

/**
 * ✅ Firebase Configuration
 * You can move these to environment variables (.env) for better security:
 * VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAcJSg5vyrKJ0gqOeNeeZfKV2kfng-Hffs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "career-guidance-8f18b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "career-guidance-8f18b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "career-guidance-8f18b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "177085483947",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:177085483947:web:46347e527eacf30bdf20ee",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BQNYZ6ZYDC",
};

/**
 * 🔧 Initialize Firebase Safely
 * Prevents multiple initializations during hot reloads in development.
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * 🔐 Initialize Firebase Services
 */
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ Added Firebase Storage export

/**
 * 🧩 Optional: Useful for debugging and monitoring Firebase state
 */
if (import.meta.env.DEV) {
  console.groupCollapsed('🔥 Firebase Initialized');
  console.log('Project ID:', firebaseConfig.projectId);
  console.log('Auth Domain:', firebaseConfig.authDomain);
  console.log('Storage Bucket:', firebaseConfig.storageBucket); // ✅ Added storage bucket info
  console.groupEnd();
}

export default app;