import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/firebase/server';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, increment } from 'firebase/firestore';
import { goBizMutations } from '@/lib/payment/gopay';

/**
 * Helper serbaguna untuk memproses nominal angka Rupiah Indonesia/API.
 * Mengubah string maupun float desimal seperti 1.061, "1.061", 1.099, "1.000", 1.000 (1)
 * menjadi angka numerik murni (misal: 1061, 1099, 1000, 10500) tanpa risiko terbaca sebagai 1.
 */
export function parseIndonesianNumber(val: any): number {
    if (val === null || val === undefined) return 0;

    // Jika input bertipe JS number (seperti 1.061, 1.099, 1.000=1 dari JSON deserializer)
    if (typeof val === 'number') {
        if (isNaN(val)) return 0;
        if (Number.isInteger(val)) return val;
        if (val > 0 && val < 10) {
            const strFloat = val.toFixed(3);
            return parseInt(strFloat.replace('.', ''), 10);
        }
        return Math.round(val);
    }

    let str = String(val).trim();
    if (!str) return 0;

    // Bersihkan karakter non-numeric selain angka, titik, dan koma (misal "Rp ")
    str = str.replace(/[^0-9.,]/g, '');
    if (!str) return 0;

    // Jika ada koma desimal sen (1.000,00) -> ambil bagian sebelum koma
    if (str.includes(',')) {
        str = str.split(',')[0];
    }

    // Jika string berisi desimal berformat titik "1.061", "1.099", "5.170", "1.000", "137.00"
    if (str.includes('.')) {
        const parts = str.split('.');
        if (parts.length === 2) {
            const [intPart, decPart] = parts;
            // Desimal sen standar seperti "137.00", "500.00", "50034.00", "137.0"
            if (decPart === '00' || decPart === '0' || intPart.length > 3) {
                str = intPart;
            } else if (intPart.length <= 3 && decPart.length === 3) {
                // Ribuan format Indonesia seperti "1.061" -> "1061"
                str = intPart + decPart;
            } else {
                str = intPart;
            }
        } else {
            // Lebih dari 1 titik (misal "1.000.000") -> hapus semua titik
            str = str.replace(/\./g, '');
        }
    }

    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Shared status check logic for both GET and POST requests
 */
async function handleCheckStatusLogic(merchantId: string, targetId: string) {
    const searchId = targetId.trim();

    // 2. Cari dokumen transaksi di Firestore
    let trxRef = doc(firestore, 'merchants', merchantId, 'transactions', searchId);
    let trxSnap = await getDoc(trxRef);
    let trxData: any = null;

    if (trxSnap.exists()) {
        trxData = { id: trxSnap.id, ...trxSnap.data() };
    } else {
        // Fallback: Cari berdasarkan field externalId
        try {
            const transactionsRef = collection(firestore, 'merchants', merchantId, 'transactions');
            const q = query(transactionsRef, where('externalId', '==', searchId));
            const querySnap = await getDocs(q);

            if (!querySnap.empty) {
                const docFound = querySnap.docs[0];
                trxRef = docFound.ref;
                trxData = { id: docFound.id, ...docFound.data() };
            }
        } catch (err) {
            console.warn('Fallback query error:', err);
        }
    }

    if (!trxData) {
        return NextResponse.json({
            success: false,
            message: `Transaction '${searchId}' not found.`
        }, { status: 404 });
    }

    // Ambil Pengaturan Sistem (payments & mdrMDR)
    let payments: any = {};
    let mdrFeePercent = 0.7; // default MDR = 0.7%

    try {
        const settingsSnap = await getDoc(doc(firestore, 'system', 'settings'));
        if (settingsSnap.exists()) {
            const settings = settingsSnap.data() || {};
            payments = settings.payments || {};
            if (typeof settings.mdrFee === 'number') {
                mdrFeePercent = settings.mdrFee;
            }
        }
    } catch (e) { }

    const targetAmount = parseIndonesianNumber(trxData.amount || trxData.total_amount || 0);
    const feeAmount = trxData.feeAmount ?? Math.round(targetAmount * (mdrFeePercent / 100));
    const netAmount = trxData.netAmount ?? Math.max(0, targetAmount - feeAmount);

    // 3. Jika transaksi sudah Berhasil (Success)
    if (trxData.status === 'Success' || trxData.status === 'Paid') {
        return NextResponse.json({
            success: true,
            data: {
                transaction_id: trxData.id,
                external_id: trxData.externalId || trxData.id,
                status: 'Success',
                base_amount: trxData.baseAmount || trxData.amount,
                unique_code: trxData.uniqueCode || 0,
                total_amount: targetAmount,
                fee_amount: feeAmount,
                net_amount: netAmount,
                mdr_rate: `${trxData.mdrRate ?? mdrFeePercent}%`,
                paid_at: trxData.paidAt || trxData.transactionDate,
                payment_method: trxData.paymentMethod || 'API QRIS'
            }
        });
    }

    // 4. Cek apakah transaksi sudah kedaluwarsa (Expired)
    const now = new Date();
    const isExpiredByTime = trxData.expiryDate && new Date(trxData.expiryDate) < now;

    if (trxData.status === 'Expired' || isExpiredByTime) {
        if (trxData.status !== 'Expired') {
            try {
                await updateDoc(trxRef, { status: 'Expired', updatedAt: now.toISOString() });
            } catch (e) { }
        }
        return NextResponse.json({
            success: true,
            data: {
                transaction_id: trxData.id,
                external_id: trxData.externalId || trxData.id,
                status: 'Expired',
                base_amount: trxData.baseAmount || trxData.amount,
                unique_code: trxData.uniqueCode || 0,
                total_amount: targetAmount,
                fee_amount: feeAmount,
                net_amount: netAmount,
                mdr_rate: `${trxData.mdrRate ?? mdrFeePercent}%`,
                expiry_at: trxData.expiryDate
            }
        });
    }

    let isMatched = false;
    let paidAtTime = now.toISOString();
    let matchedMutationId = '';

    // Ambil timestamp pembuatan transaksi (Wajib: Mutasi harus terjadi SETELAH/SAAT transaksi dibuat)
    const trxCreatedTime = new Date(trxData.transactionDate || trxData.createdAt || trxData.updatedAt || Date.now()).getTime();
    // Berikan toleransi maksimal 60 detik buffer untuk perbedaan clock jam server
    const minValidTime = trxCreatedTime - 60000;

    // 5. Cek Mutasi di Payment Channel yang Memiliki Token Kredensial Valid
    // GoPay / GoBiz Channel
    if (!isMatched && payments.gopay?.accessToken && payments.gopay?.merchantId) {
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
                console.log(`[STATUS CHECK] Target: Rp ${targetAmount} (${trxData.id}), CreatedAt: ${new Date(trxCreatedTime).toISOString()}, Mutations fetched: ${res.data.mutations.length}`);
                
                for (const item of res.data.mutations) {
                    const itemAmount = parseIndonesianNumber(item.amount);

                    const typeStr = String(item.type || 'IN').toUpperCase();
                    const isIncoming = ['IN', 'CR', 'KREDIT', 'CREDIT'].includes(typeStr) || !['OUT', 'DB', 'DEBIT'].includes(typeStr);

                    const statusStr = String(item.status || 'paid').toLowerCase();
                    const isStatusOk = ['paid', 'success', 'successful', 'settlement', 'completed', 'ok'].includes(statusStr);

                    const rawTime = item.timestamp || item.created_at || item.transaction_time || item.date || item.time;
                    let itemTime: number | null = null;
                    if (rawTime) {
                        if (typeof rawTime === 'number') {
                            itemTime = rawTime < 1e11 ? rawTime * 1000 : rawTime;
                        } else {
                            const parsedDate = new Date(rawTime).getTime();
                            if (!isNaN(parsedDate)) itemTime = parsedDate;
                        }
                    }

                    // Strict timestamp validation: Mutasi HARUS terjadi SETELAH transaksi dibuat (minValidTime)
                    const isTimeValid = !itemTime || isNaN(itemTime) || itemTime >= minValidTime;

                    const mutationId = item.id || item.trx_id || item.reference_id || item.transaction_id || '';
                    let isAlreadyClaimed = false;

                    // Cek jika ID mutasi ini sudah pernah diklaim oleh transaksi lain yang sudah Lunas
                    if (mutationId) {
                        try {
                            const usedQuery = query(
                                collection(firestore, 'merchants', merchantId, 'transactions'),
                                where('matchedMutationId', '==', String(mutationId))
                            );
                            const usedSnap = await getDocs(usedQuery);
                            if (!usedSnap.empty) {
                                const claimedTrxId = usedSnap.docs[0].id;
                                if (claimedTrxId !== trxData.id) {
                                    isAlreadyClaimed = true;
                                    console.log(`[MUTATION SKIPPED] Mutation ID '${mutationId}' already claimed by transaction '${claimedTrxId}'`);
                                }
                            }
                        } catch (e) { }
                    }

                    if (isIncoming && isStatusOk && Math.abs(itemAmount - targetAmount) < 1 && isTimeValid && !isAlreadyClaimed) {
                        isMatched = true;
                        matchedMutationId = String(mutationId);
                        if (rawTime) paidAtTime = typeof rawTime === 'string' ? rawTime : new Date(itemTime!).toISOString();
                        console.log(`[MATCH FOUND] Trx ${trxData.id} matched with mutation amount: ${itemAmount}, Mutation ID: ${matchedMutationId}`);
                        break;
                    }
                }
            }
        } catch (err) {
            console.error('Error checking GoPay mutations:', err);
        }
    }

    // 6. Jika ditemukan mutasi yang sesuai, PERBARUI STATUS & SALDO DENGAN POTONGAN MDR
    if (isMatched) {
        try {
            await updateDoc(trxRef, {
                status: 'Success',
                feeAmount: feeAmount,
                netAmount: netAmount,
                mdrRate: mdrFeePercent,
                paidAt: paidAtTime,
                matchedMutationId: matchedMutationId || null,
                updatedAt: now.toISOString()
            });

            // Perbarui Saldo & Total Omset Merchant
            const merchantRef = doc(firestore, 'merchants', merchantId);
            await updateDoc(merchantRef, {
                balance: increment(netAmount),
                totalRevenue: increment(targetAmount),
                updatedAt: now.toISOString()
            });

            console.log(`[SUCCESS] Firestore document '${trxData.id}' updated to status: Success. Gross: Rp ${targetAmount}, Fee: Rp ${feeAmount}, Net Credited: Rp ${netAmount}`);
        } catch (err) {
            console.error('CRITICAL FIRESTORE UPDATE ERROR in /api/qris/status:', err);
        }

        return NextResponse.json({
            success: true,
            data: {
                transaction_id: trxData.id,
                external_id: trxData.externalId || trxData.id,
                status: 'Success',
                base_amount: trxData.baseAmount || trxData.amount,
                unique_code: trxData.uniqueCode || 0,
                total_amount: targetAmount,
                fee_amount: feeAmount,
                net_amount: netAmount,
                mdr_rate: `${mdrFeePercent}%`,
                paid_at: paidAtTime,
                payment_method: trxData.paymentMethod || 'API QRIS'
            }
        });
    }

    // 7. Jika mutasi belum terdeteksi, kembalikan status 'Pending'
    return NextResponse.json({
        success: true,
        data: {
            transaction_id: trxData.id,
            external_id: trxData.externalId || trxData.id,
            status: 'Pending',
            base_amount: trxData.baseAmount || trxData.amount,
            unique_code: trxData.uniqueCode || 0,
            total_amount: targetAmount,
            fee_amount: feeAmount,
            net_amount: netAmount,
            mdr_rate: `${mdrFeePercent}%`,
            expiry_at: trxData.expiryDate
        }
    });
}

/**
 * GET /api/qris/status?transaction_id=INV-xxx&merchant_id=xxx
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        let merchantId = searchParams.get('merchant_id') || searchParams.get('merchantId') || '';
        const targetId = searchParams.get('transaction_id') || searchParams.get('external_id') || searchParams.get('transactionId') || searchParams.get('id') || '';

        const authHeader = req.headers.get('x-api-key') || '';
        const apiKey = authHeader.trim();

        if (apiKey && !merchantId) {
            const systemKeyRef = doc(firestore, 'system', `key_${apiKey}`);
            const systemKeySnap = await getDoc(systemKeyRef);
            if (systemKeySnap.exists()) {
                merchantId = systemKeySnap.data().merchantId;
            }
        }

        if (!merchantId) {
            return NextResponse.json({ success: false, message: 'Missing merchant_id or X-API-KEY header.' }, { status: 401 });
        }

        if (!targetId) {
            return NextResponse.json({ success: false, message: 'Missing transaction_id or external_id parameter.' }, { status: 400 });
        }

        return await handleCheckStatusLogic(merchantId, targetId);
    } catch (error: any) {
        console.error('API GET Status Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/qris/status
 * Header: X-API-KEY: <merchant_secret_key>
 * Body: { transaction_id: string } atau { external_id: string }
 */
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('x-api-key') || '';
        const apiKey = authHeader.trim();

        let merchantId = '';
        if (apiKey) {
            const systemKeyRef = doc(firestore, 'system', `key_${apiKey}`);
            const systemKeySnap = await getDoc(systemKeyRef);

            if (systemKeySnap.exists()) {
                merchantId = systemKeySnap.data().merchantId;
            }
        }

        const body = await req.json().catch(() => ({}));
        if (!merchantId) {
            merchantId = body.merchant_id || body.merchantId || '';
        }

        if (!merchantId) {
            return NextResponse.json({ success: false, message: 'Missing merchant_id or X-API-KEY.' }, { status: 401 });
        }

        const targetId = body.transaction_id || body.external_id || body.transactionId || body.externalId;

        if (!targetId || typeof targetId !== 'string' || !targetId.trim()) {
            return NextResponse.json({
                success: false,
                message: 'Missing or invalid transaction_id or external_id parameter.'
            }, { status: 400 });
        }

        return await handleCheckStatusLogic(merchantId, targetId);

    } catch (error: any) {
        console.error('API POST Status Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

