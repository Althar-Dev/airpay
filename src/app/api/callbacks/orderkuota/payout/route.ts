import { NextResponse } from 'next/server';
import { firestore } from '@/firebase/server';
import { collection, collectionGroup, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const refid = searchParams.get('refid') || searchParams.get('refID') || '';
    const message = searchParams.get('message') || '';

    console.log(`[Orderkuota Payout Callback] Received GET: refid=${refid}, message=${message}`);

    if (!refid) {
      return NextResponse.json({ status: false, message: 'Parameter refid wajib disertakan' }, { status: 400 });
    }

    const messageLower = message.toLowerCase();
    const isSuccess = messageLower.includes('sukses');
    const isFailed = messageLower.includes('gagal');

    // 1. Cari transaksi berdasarkan refid atau WD-refid di collectionGroup('transactions')
    const txQuery = query(
      collectionGroup(firestore, 'transactions'),
      where('externalId', 'in', [refid, `WD-${refid}`, refid.replace(/[^0-9]/g, '')])
    );

    let txSnap = await getDocs(txQuery);

    // Fallback: Cari dengan ID murni
    if (txSnap.empty) {
      const fallbackQuery = query(
        collectionGroup(firestore, 'transactions'),
        where('id', 'in', [refid, `WD-${refid}`])
      );
      txSnap = await getDocs(fallbackQuery);
    }

    if (txSnap.empty) {
      console.warn(`[Orderkuota Callback] Transaksi tidak ditemukan untuk refid: ${refid}`);
      return NextResponse.json({ status: true, message: 'Transaksi tidak ditemukan tapi callback diterima' });
    }

    // Process matching transaction
    for (const txDoc of txSnap.docs) {
      const txData = txDoc.data();
      const parentRef = txDoc.ref.parent.parent; // Path to merchants/{userId}

      if (isSuccess) {
        await updateDoc(txDoc.ref, {
          status: 'Success',
          h2hMessage: message,
          updatedAt: new Date().toISOString()
        });
        console.log(`[Orderkuota Callback] Transaksi ${txData.id} di-update ke Success`);
      } else if (isFailed) {
        await updateDoc(txDoc.ref, {
          status: 'Failed',
          rejectionReason: message || 'Gagal dari H2H Orderkuota',
          h2hMessage: message,
          updatedAt: new Date().toISOString()
        });

        // Refund Saldo Merchant jika transaksi gagal
        if (parentRef) {
          const refundAmount = Math.abs(txData.amount || 0);
          await updateDoc(parentRef, {
            balance: increment(refundAmount),
            updatedAt: new Date().toISOString()
          });
          console.log(`[Orderkuota Callback] Saldo merchant ${parentRef.id} di-refund sebesar ${refundAmount}`);
        }
      }
    }

    return NextResponse.json({
      status: true,
      refid: refid,
      message: 'Callback penarikan Orderkuota berhasil diproses'
    });

  } catch (error: any) {
    console.error('[Orderkuota Payout Callback Error]:', error);
    return NextResponse.json(
      { status: false, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// Support POST as well if server sends POST
export async function POST(req: Request) {
  return GET(req);
}
