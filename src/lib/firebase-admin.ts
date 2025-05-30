import admin from 'firebase-admin';

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'demo@demo.com',
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || 'demo-key',
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseAdminConfig),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
    });
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error);
    // Initialize with minimal config for build
    admin.initializeApp({
      projectId: 'demo-project',
    });
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export { admin };

export default admin;