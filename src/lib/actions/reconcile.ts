'use server';

import { firestore } from '@/firebase/server';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { goBizMutations } from '@/lib/payment/gopay';
import { parseIndonesianNumber } from '@/app/api/qris/status/route';

/**
 * Server Action: Rekonsiliasi Otomatis Transaksi Pending Merchant dengan Pemotongan MDR.
 */
export async function reconcileMerchantPendingTransactions(merchantId: string) {
    try {
        if (!merchantId) return { success: false, message: 'Missing merchantId' };

        const transactionsRef = collection(firestore, 'merchants', merchantId, 'transactions');
        const q = query(transactionsRef, where('status', '==', 'Pending'));
        const pendingSnap = await getDocs(q);

        if (pendingSnap.empty) {
            return { success: true, updatedCount: 0 };
        }

        const now = new Date();
        const settingsSnap = await getDoc(doc(firestore, 'system', 'settings'));
        const settings = settingsSnap.exists() ? settingsSnap.data() : {};
        const payments = settings.payments || {};
        const mdrFeePercent = typeof settings.mdrFee === 'number' ? settings.mdrFee : 0.7;

        let gopayMutations: any[] = [];

        // Tarik Mutasi GoPay jika token ada
        if (payments.gopay?.accessToken && payments.gopay?.merchantId) {
            try {
                const res = await goBizMutations({
                    apiKey: payments.gopay.apiKey || 'GoMerchant_Single',
                    accessToken: payments.gopay.accessToken,
                    refreshToken: payments.gopay.refreshToken || '',
                    xUniqueId: payments.gopay.xUniqueId || '',
                    merchantId: payments.gopay.merchantId,
                    limit: 30
                });
                if (res.status === 'success' && Array.isArray(res.data?.mutations)) {
                    gopayMutations = res.data.mutations;
                }
            } catch (e) { }
        }

        let updatedCount = 0;

        for (const docSnap of pendingSnap.docs) {
            const trx = docSnap.data();
            const trxRef = docSnap.ref;
            const targetAmount = parseIndonesianNumber(trx.amount || trx.total_amount || 0);

            // Ambil timestamp pembuatan transaksi (Wajib: Mutasi harus terjadi SETELAH/SAAT transaksi dibuat)
            const trxCreatedTime = new Date(trx.transactionDate || trx.createdAt || trx.updatedAt || Date.now()).getTime();
            const minValidTime = trxCreatedTime - 60000;

            // 1. Cek Kadaluarsa
            if (trx.expiryDate && new Date(trx.expiryDate) < now) {
                try {
                    await updateDoc(trxRef, { status: 'Expired', updatedAt: now.toISOString() });
                    updatedCount++;
                } catch (e) { }
                continue;
            }

            let isPaid = false;
            let paidTime = now.toISOString();

            // Cek Match GoPay
            for (const m of gopayMutations) {
                const itemAmount = parseIndonesianNumber(m.amount);
                const itemTime = m.timestamp ? new Date(m.timestamp).getTime() : null;
                const isTimeValid = !itemTime || isNaN(itemTime) || itemTime >= minValidTime;

                if (m.type === 'IN' && Math.abs(itemAmount - targetAmount) < 1 && isTimeValid) {
                    isPaid = true;
                    if (m.timestamp) paidTime = m.timestamp;
                    break;
                }
            }

            // 5. Update jika Lunas dengan Potongan MDR
            if (isPaid) {
                const feeAmount = Math.round(targetAmount * (mdrFeePercent / 100));
                const netAmount = Math.max(0, targetAmount - feeAmount);

                try {
                    await updateDoc(trxRef, {
                        status: 'Success',
                        feeAmount: feeAmount,
                        netAmount: netAmount,
                        mdrRate: mdrFeePercent,
                        paidAt: paidTime,
                        updatedAt: now.toISOString()
                    });

                    // Update Saldo Merchant di Firestore (Saldo bertambah Net Amount)
                    const merchantRef = doc(firestore, 'merchants', merchantId);
                    await updateDoc(merchantRef, {
                        balance: increment(netAmount),
                        totalRevenue: increment(targetAmount),
                        updatedAt: now.toISOString()
                    });

                    updatedCount++;
                } catch (e) {
                    console.error('Error updating transaction status to Success:', e);
                }
            }
        }

        return { success: true, updatedCount };
    } catch (err: any) {
        console.error('Reconciliation Server Action Error:', err);
        return { success: false, message: err.message };
    }
}
