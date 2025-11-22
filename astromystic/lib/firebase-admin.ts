import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Helper to log missing keys to your VS Code Terminal
const checkEnvVars = () => {
  const missing = [];
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
  if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');
  
  if (missing.length > 0) {
    console.error('❌ [FIREBASE ADMIN] Critical Error: Missing Environment Variables:', missing.join(', '));
  } else {
    console.log('✅ [FIREBASE ADMIN] Environment variables found. Attempting to initialize...');
  }
};

const getFirebaseAdminApp = () => {
  if (getApps().length) {
    return getApp();
  }

  // Run the check
  checkEnvVars();

  // Retrieve keys from Environment Variables
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') // Fix newlines for Vercel/Env
    : undefined;

  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  };

  // Only initialize if we have credentials
  if (serviceAccount.privateKey && serviceAccount.clientEmail) {
    try {
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error) {
      console.error('❌ [FIREBASE ADMIN] Initialization Failed. Check your Private Key format.', error);
    }
  } else {
    console.error('❌ [FIREBASE ADMIN] privateKey or clientEmail is undefined.');
  }
  
  return null;
};

const app = getFirebaseAdminApp();
export const adminDb = app ? getFirestore(app) : null;