import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

function initializeServerFirebase() {
    if (getApps().length > 0) {
        return getApp();
    }
    
    try {
      if (process.env.FIREBASE_CONFIG || process.env.K_SERVICE) {
        return initializeApp();
      }
    } catch (e) {
      // Ignore and fallback
    }

    return initializeApp(firebaseConfig);
}

const firebaseApp = initializeServerFirebase();
const firestore = getFirestore(firebaseApp);

export { firestore };
