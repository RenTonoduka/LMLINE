// Mock Firebase for development
const isDevelopment = process.env.NODE_ENV === 'development';

// Check if we have production Firebase config
const hasValidConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                       process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
                       !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('demo');

// Only import Firebase if we have valid config or are in production
let auth: any = null;
let db: any = null;
let storage: any = null;
let app: any = null;

if (!isDevelopment || hasValidConfig) {
  try {
    const { initializeApp, getApps } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    const { getStorage } = require('firebase/storage');

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    };

    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('Firebase initialization skipped in development:', error);
  }
} else {
  console.warn('Firebase: Using mock configuration for development');
  // Create mock objects for development
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {}, // Return a cleanup function
    signOut: () => Promise.resolve(),
  };
  db = {};
  storage = {};
  app = {};
}

export { auth, db, storage, app };
export default app;