'use server';

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/server';

interface SessionData {
  status: 'otp_required' | 'logged_in' | string;
  token?: string;
  otp_value?: string;
  username?: string;
}

/**
 * A custom session store for @starvale-sdk/authqris that uses Firestore.
 * It stores session data in a `businesses` collection, with each document
 * identified by the merchant's UID.
 */
class FirestoreSessionStore {
  private getDocRef(sessionId: string) {
    return doc(firestore, 'businesses', sessionId);
  }

  // Not used by the SDK in a one-session-per-user model, but required by interface
  async load() {
    console.warn('FirestoreSessionStore: load() is not implemented.');
    return {};
  }

  // Not used by the SDK in a one-session-per-user model, but required by interface
  async save(sessions: Record<string, any>) {
     console.warn('FirestoreSessionStore: save() is not implemented.');
  }

  /**
   * Retrieves session data for a given session ID from Firestore.
   */
  async get(sessionId: string): Promise<SessionData | undefined> {
    if (!sessionId) return undefined;
    const docRef = this.getDocRef(sessionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()?.orderkuotaSession;
    }
    return undefined;
  }

  /**
   * Saves or updates session data for a given session ID in Firestore.
   */
  async set(sessionId: string, data: SessionData): Promise<void> {
    if (!sessionId) return;
    const docRef = this.getDocRef(sessionId);
    const docSnap = await getDoc(docRef);

    const sessionPayload = { orderkuotaSession: data };
    
    if (docSnap.exists()) {
        await updateDoc(docRef, sessionPayload);
    } else {
        await setDoc(docRef, { id: sessionId, ...sessionPayload });
    }
  }

  /**
   * Deletes session data for a given session ID from Firestore.
   */
  async delete(sessionId: string): Promise<void> {
    if (!sessionId) return;
    const docRef = this.getDocRef(sessionId);
    // Set the session field to null instead of deleting the document
    await setDoc(docRef, { orderkuotaSession: null }, { merge: true });
  }
}

export default FirestoreSessionStore;
