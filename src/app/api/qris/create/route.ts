import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/firebase/server';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * POST /api/qris/create
 * Body: { amount: number, external_id: string }
 * Header: X-API-KEY: <merchant_secret_key>
 */
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('x-api-key') || '';
        const apiKey = authHeader.trim();

        if (!apiKey) {
            return NextResponse.json({ success: false, message: 'Missing API Key header (X-API-KEY).' }, { status: 401 });
        }

        let merchantId = '';
        const systemKeyRef = doc(firestore, 'system', `key_${apiKey}`);
        const systemKeySnap = await getDoc(systemKeyRef);

        if (systemKeySnap.exists()) {
            merchantId = systemKeySnap.data().merchantId;
        }

        if (!merchantId) {
            return NextResponse.json({
                success: false,
                message: 'Invalid API Key. Access denied. Please ensure your key is active in the dashboard.'
            }, { status: 403 });
        }

        const body = await req.json();
        const { amount: baseAmount } = body;
        const rawExternalId = body.external_id || body.externalId;

        // 1. Validasi Wajib external_id
        if (!rawExternalId || (typeof rawExternalId !== 'string' && typeof rawExternalId !== 'number') || !String(rawExternalId).trim()) {
            return NextResponse.json({
                success: false,
                message: 'Missing or invalid external_id. Parameter external_id (string) is required.'
            }, { status: 400 });
        }

        const externalId = String(rawExternalId).trim();

        // 2. Validasi Wajib nominal amount
        if (!baseAmount || isNaN(baseAmount) || baseAmount <= 0) {
            return NextResponse.json({ success: false, message: 'Invalid or missing base amount.' }, { status: 400 });
        }

        // 3. Tentukan ID Transaksi berbasis external_id
        const transactionRef = doc(firestore, 'merchants', merchantId, 'transactions', externalId);

        // 4. Cek Konflik: Apakah external_id ini sudah pernah digunakan oleh merchant ini
        const existingCheck = await getDoc(transactionRef);
        if (existingCheck.exists()) {
            return NextResponse.json({
                success: false,
                message: `Transaction with external_id '${externalId}' already exists.`
            }, { status: 409 });
        }

        // Ambil MDR MDR (Default 0.7%)
        let mdrFeePercent = 0.7;
        try {
            const settingsSnap = await getDoc(doc(firestore, 'system', 'settings'));
            if (settingsSnap.exists() && typeof settingsSnap.data()?.mdrFee === 'number') {
                mdrFeePercent = settingsSnap.data()!.mdrFee;
            }
        } catch (e) { }

        const now = new Date();
        const EXPIRED_MINUTES = 15;
        const expiryDate = new Date(now.getTime() + EXPIRED_MINUTES * 60 * 1000);

        let uniqueCode = 0;
        let finalAmount = baseAmount;
        let isFound = false;

        // 5. Mencari nominal unik (Base Amount + Kode Unik) yang belum ada di status Pending aktif
        for (let attempt = 0; attempt < 20; attempt++) {
            if (baseAmount <= 50000) {
                uniqueCode = Math.floor(Math.random() * 100);
            } else {
                uniqueCode = Math.floor(Math.random() * 900) + 100;
            }

            finalAmount = baseAmount + uniqueCode;

            const transactionsRef = collection(firestore, 'merchants', merchantId, 'transactions');
            const q = query(
                transactionsRef,
                where('amount', '==', finalAmount),
                where('status', '==', 'Pending')
            );

            const collisionSnap = await getDocs(q);
            let hasActivePending = false;

            for (const d of collisionSnap.docs) {
                const data = d.data();
                if (data.expiryDate && new Date(data.expiryDate) > now) {
                    hasActivePending = true;
                    break;
                }
            }

            if (!hasActivePending) {
                isFound = true;
                break;
            }
        }

        if (!isFound) {
            return NextResponse.json({
                success: false,
                message: 'Conflict: Nominal queue is currently full for this base amount. Please try again in a few minutes.'
            }, { status: 409 });
        }

        // Hitung Potongan MDR (MDR Fee) & Nominal Bersih
        const feeAmount = Math.round(finalAmount * (mdrFeePercent / 100));
        const netAmount = Math.max(0, finalAmount - feeAmount);

        const trxData = {
            id: externalId,
            externalId: externalId,
            baseAmount: baseAmount,
            uniqueCode: uniqueCode,
            amount: finalAmount,
            feeAmount: feeAmount,
            netAmount: netAmount,
            mdrRate: mdrFeePercent,
            status: 'Pending',
            transactionDate: now.toISOString(),
            expiryDate: expiryDate.toISOString(),
            paymentMethod: 'API QRIS',
            customer: 'API Client',
            currency: 'IDR'
        };

        // 6. Simpan transaksi di Firestore
        await setDoc(transactionRef, trxData);

        // 7. Buat URL Gambar QRIS
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const qrUrl = `${protocol}://${host}/api/qris/image?tid=${externalId}&mid=${merchantId}`;

        return NextResponse.json({
            success: true,
            data: {
                transaction_id: externalId,
                external_id: externalId,
                qr_url: qrUrl,
                base_amount: baseAmount,
                unique_code: uniqueCode,
                total_amount: finalAmount,
                fee_amount: feeAmount,
                net_amount: netAmount,
                mdr_rate: `${mdrFeePercent}%`,
                expiry_at: expiryDate.toISOString(),
                status: 'Pending'
            }
        });

    } catch (error: any) {
        console.error('API QRIS Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
