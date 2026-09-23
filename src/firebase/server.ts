import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

function initializeServerFirebase() {
    if (getApps().length > 0) {
        return getApp();
    }
    
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      return initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic server-side initialization failed. Falling back to firebase config object.', e);
      }
      // Fallback to config for local development or other environments
      return initializeApp(firebaseConfig);
    }
}

const firebaseApp = initializeServerFirebase();
const firestore = getFirestore(firebaseApp);

export { firestore };
