'use server';

import { adminDb } from '@/firebase/admin';

function expandDotNotation(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === null || val === undefined) {
      // Handle null deletes
      const parts = key.split('.');
      let current = result;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = {};
        }
        current = current[part];
      }
      current[parts[parts.length - 1]] = null;
      continue;
    }
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = val;
  }
  return result;
}

/**
 * Updates the /system/settings document using Firebase Admin SDK to bypass client Firestore Security Rules.
 */
export async function updateSystemSettingsAction(updates: Record<string, any>): Promise<{ success: boolean; message?: string }> {
  try {
    const docRef = adminDb.collection('system').doc('settings');
    const expanded = expandDotNotation(updates);
    
    await docRef.set(expanded, { merge: true });

    return { success: true };
  } catch (error: any) {
    if (error?.code === 16 || error?.message?.includes('UNAUTHENTICATED')) {
      console.error('[Firebase Admin Error] Kredensial Service Account di admin.json tidak valid / telah dicabut di Firebase Console. Harap generate key baru.');
    } else {
      console.error('Error updating system settings via Admin SDK:', error);
    }
    return { success: false, message: error.message || 'Gagal memperbarui pengaturan sistem.' };
  }
}

/**
 * Gets the /system/settings document using Firebase Admin SDK.
 */
export async function getSystemSettingsAction(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const docRef = adminDb.collection('system').doc('settings');
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { success: true, data: null };
    }
    return { success: true, data: docSnap.data() };
  } catch (error: any) {
    if (error?.code === 16 || error?.message?.includes('UNAUTHENTICATED')) {
      console.error('[Firebase Admin Error] Kredensial Service Account di admin.json tidak valid / telah dicabut di Firebase Console. Harap generate key baru.');
    } else {
      console.error('Error getting system settings via Admin SDK:', error);
    }
    return { success: false, error: error.message };
  }
}
