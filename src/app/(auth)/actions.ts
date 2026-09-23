'use server';

import { adminDb } from '@/firebase/admin';
import { sendVerificationCodeEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

/**
 * Generates a 6-digit code, stores its hash in Firestore via Admin SDK, and sends the plain code via email.
 */
export async function sendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    if (!email) {
        return { success: false, message: 'Email is required.' };
    }

    try {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const codeHash = await bcrypt.hash(code, salt);
        const expires = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 minutes expiry

        const verificationRef = adminDb.collection('verificationCodes').doc(email);
        await verificationRef.set({
            email,
            codeHash,
            expires: expires.toISOString(),
        });

        await sendVerificationCodeEmail({ to: email, code });

        return { success: true, message: 'Verification code sent successfully.' };
    } catch (error: any) {
        console.error('Error sending verification code:', error);
        return { success: false, message: error.message || 'Failed to send verification code.' };
    }
}

/**
 * Verifies the provided code against the stored hash in Firestore via Admin SDK.
 */
export async function verifyCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
    if (!email || !code) {
        return { success: false, message: 'Email and code are required.' };
    }
    
    try {
        const verificationRef = adminDb.collection('verificationCodes').doc(email);
        const docSnap = await verificationRef.get();

        if (!docSnap.exists) {
            return { success: false, message: 'Invalid or expired verification code.' };
        }

        const data = docSnap.data();
        if (!data || new Date(data.expires) < new Date()) {
            await verificationRef.delete();
            return { success: false, message: 'Verification code has expired. Please try again.' };
        }

        const isMatch = await bcrypt.compare(code, data.codeHash);
        if (!isMatch) {
            return { success: false, message: 'Invalid verification code.' };
        }
        
        return { success: true, message: 'Code verified successfully.' };

    } catch (error: any) {
        console.error('Error verifying code:', error);
        return { success: false, message: error.message || 'Failed to verify code.' };
    }
}

/**
 * Deletes the verification code from Firestore after successful user creation via Admin SDK.
 */
export async function deleteVerificationCode(email: string): Promise<void> {
    if (!email) return;
    try {
        const verificationRef = adminDb.collection('verificationCodes').doc(email);
        await verificationRef.delete();
    } catch (error) {
        console.error("Failed to delete verification code:", error);
    }
}
