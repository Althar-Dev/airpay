import { NextResponse } from 'next/server';
import { firestore } from '@/firebase/server';
import { collection, doc, getDoc, updateDoc, addDoc, increment } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const apiKeyHeader = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKeyHeader) {
      return NextResponse.json(
        { status: false, message: 'Header x-api-key atau Bearer token wajib disertakan' },
        { status: 401 }
      );
    }

    // 1. Cari merchant berdasarkan API Key
    const apiKeyRef = doc(firestore, 'apiKeys', apiKeyHeader);
    const apiKeySnap = await getDoc(apiKeyRef);

    let merchantId: string | null = null;

    if (apiKeySnap.exists()) {
      merchantId = apiKeySnap.data().merchantId;
    } else {
      // Fallback: Cari di merchants collection
      const mSnap = await getDoc(doc(firestore, 'merchants', apiKeyHeader));
      if (mSnap.exists()) {
        merchantId = apiKeyHeader;
      }
    }

    if (!merchantId) {
      return NextResponse.json(
        { status: false, message: 'API Key tidak valid atau merchant tidak ditemukan' },
        { status: 403 }
      );
    }

    const merchantRef = doc(firestore, 'merchants', merchantId);
    const merchantSnap = await getDoc(merchantRef);

    if (!merchantSnap.exists()) {
      return NextResponse.json(
        { status: false, message: 'Merchant tidak terdaftar' },
        { status: 404 }
      );
    }

    const merchantData = merchantSnap.data();

    // 2. Cek apakah merchant sudah mengonfigurasi rekening
    if (!merchantData.bankName || !merchantData.bankAccountNumber) {
      return NextResponse.json(
        { status: false, message: 'Rekening bank / e-wallet belum dikonfigurasi di profil merchant' },
        { status: 400 }
      );
    }

    // 3. Parse input body
    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount);

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { status: false, message: 'Parameter amount wajib diisi dengan angka positif' },
        { status: 400 }
      );
    }

    // 4. Cek System Settings (Limits & Fees)
    const settingsSnap = await getDoc(doc(firestore, 'system', 'settings'));
    const settingsData = settingsSnap.exists() ? settingsSnap.data() : {};

    const minWithdrawal = settingsData.minWithdrawal ?? 10000;
    const bankFee = settingsData.bankFee ?? 3500;
    const ewalletFee = settingsData.ewalletFee ?? 2000;

    if (amount < minWithdrawal) {
      return NextResponse.json(
        { status: false, message: `Minimal penarikan saldo adalah Rp ${minWithdrawal.toLocaleString('id-ID')}` },
        { status: 400 }
      );
    }

    const isEwallet = merchantData.accountType === 'ewallet';
    const feeVal = isEwallet ? ewalletFee : bankFee;
    const totalDeducted = amount + feeVal; // Total dipotong dari saldo dompet = amount + fee

    // 5. Validasi kecukupan saldo merchant
    const currentBalance = merchantData.balance || 0;
    if (totalDeducted > currentBalance) {
      return NextResponse.json(
        { status: false, message: `Saldo merchant tidak mencukupi untuk memotong nominal penarikan Rp ${amount.toLocaleString('id-ID')} + fee admin Rp ${feeVal.toLocaleString('id-ID')} (Butuh total saldo: Rp ${totalDeducted.toLocaleString('id-ID')})` },
        { status: 400 }
      );
    }

    const now = new Date();
    const txId = `WD-${Date.now()}`;

    // 6. Buat transaksi penarikan (Status: Pending)
    const txRef = collection(firestore, 'merchants', merchantId, 'transactions');
    const newTxDoc = await addDoc(txRef, {
      id: txId,
      externalId: txId,
      type: 'WITHDRAWAL',
      status: 'Pending',
      amount: -totalDeducted, // Total dipotong dari wallet
      netAmount: -totalDeducted,
      withdrawRequested: amount,
      feeAmount: feeVal,
      netReceived: amount, // Transfer bersih ke rekening = amount
      paymentMethod: `Penarikan: ${merchantData.bankName} (${merchantData.bankAccountNumber})`,
      bankName: merchantData.bankName,
      accountNumber: merchantData.bankAccountNumber,
      accountName: merchantData.bankAccountName || merchantData.name,
      transactionDate: now.toISOString(),
      updatedAt: now.toISOString()
    });

    // 7. Potong saldo merchant sekaligus dengan fee (totalDeducted)
    await updateDoc(merchantRef, {
      balance: increment(-totalDeducted),
      updatedAt: now.toISOString()
    });

    return NextResponse.json({
      status: true,
      message: 'Pengajuan penarikan saldo berhasil dikirim (Status: Pending)',
      data: {
        transaction_id: txId,
        withdraw_amount: amount,
        fee_amount: feeVal,
        total_balance_deducted: totalDeducted,
        net_received_in_bank: amount,
        bank_name: merchantData.bankName,
        account_number: merchantData.bankAccountNumber,
        account_name: merchantData.bankAccountName || merchantData.name,
        status: 'Pending',
        created_at: now.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Withdraw API Error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
