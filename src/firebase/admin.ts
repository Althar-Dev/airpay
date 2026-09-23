import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';
import fs from 'fs';
import path from 'path';

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  let serviceAccount: any = null;

  // 1. Try reading from admin.json in project root
  const adminJsonPath = path.join(process.cwd(), 'admin.json');
  if (fs.existsSync(adminJsonPath)) {
    try {
      const fileContent = fs.readFileSync(adminJsonPath, 'utf8');
      serviceAccount = JSON.parse(fileContent);
      console.log('[Firebase Admin] Successfully loaded service account from admin.json');
    } catch (err: any) {
      console.error('[Firebase Admin] Failed to parse admin.json:', err.message);
    }
  }

  // 2. Fallback to process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const envContent = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      serviceAccount = typeof envContent === 'string' ? JSON.parse(envContent) : envContent;
      console.log('[Firebase Admin] Successfully loaded service account from process.env');
    } catch (err: any) {
      console.error('[Firebase Admin] Failed to parse process.env.FIREBASE_SERVICE_ACCOUNT_KEY:', err.message);
    }
  }

  // 3. Initialize with credential if serviceAccount loaded
  if (serviceAccount) {
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    return initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || firebaseConfig.projectId,
    });
  }

  // 4. Default uncredentialed fallback
  console.warn('[Firebase Admin Warning] No service account key found! Admin operations may fail.');
  return initializeApp({ projectId: firebaseConfig.projectId });
}

const adminApp = getAdminApp();
export const adminDb: Firestore = getFirestore(adminApp);
