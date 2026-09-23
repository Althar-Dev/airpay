import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/firebase/server';
import { doc, getDoc } from 'firebase/firestore';
import { drawMerchantQris } from '@/lib/qris';

/**
 * GET /api/qris/image?tid=TRANSACTION_ID&mid=MERCHANT_ID
 * Merender gambar QRIS sebagai file PNG asli.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const transactionId = searchParams.get('tid');
        const merchantId = searchParams.get('mid');

        if (!transactionId || !merchantId) {
            return new NextResponse('Missing transaction or merchant ID', { status: 400 });
        }

        // 1. Fetch data transaksi
        const trxRef = doc(firestore, 'merchants', merchantId, 'transactions', transactionId);
        const trxSnap = await getDoc(trxRef);

        if (!trxSnap.exists()) {
            return new NextResponse('Transaction not found', { status: 404 });
        }

        const trxData = trxSnap.data();
        const amount = trxData.amount;

        // 2. Fetch profil merchant untuk desain
        const merchantRef = doc(firestore, 'merchants', merchantId);
        const merchantSnap = await getDoc(merchantRef);
        const merchantData = merchantSnap.exists() ? merchantSnap.data() : {};

        // 3. Ambil Base QRIS dari Pengaturan Sistem
        const settingsRef = doc(firestore, 'system', 'settings');
        const settingsSnap = await getDoc(settingsRef);
        const settings = settingsSnap.exists() ? settingsSnap.data() : {};
        const payments = settings.payments || {};

        let qrisBase = '';
        if (payments.orderkuota?.enabled) qrisBase = payments.orderkuota.qrisString;
        else if (payments.gopay?.enabled) qrisBase = payments.gopay.qrisString;
        else if (payments.shopeepay?.enabled) qrisBase = payments.shopeepay.qrisString;

        if (!qrisBase) {
            return new NextResponse('Payment gateway not configured', { status: 503 });
        }

        // 4. Render Gambar menggunakan Jimp
        const result = await drawMerchantQris(qrisBase, amount, merchantData.qrDesign || {});

        // 5. Kembalikan sebagai PNG mentah
        return new NextResponse(result.buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            }
        });

    } catch (error: any) {
        console.error('QR Image Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
