'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, increment } from 'firebase/firestore';
import { Landmark, Wallet, Loader2, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import { EWALLET_OPTIONS } from './bank-account-modal';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBankModal: () => void;
}

export function WithdrawModal({ isOpen, onClose, onOpenBankModal }: WithdrawModalProps) {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  const merchantRef = useMemoFirebase(() => user ? doc(firestore, 'merchants', user.uid) : null, [user, firestore]);
  const { data: merchantData } = useDoc(merchantRef);

  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settingsData } = useDoc(settingsRef);

  const bankFeeVal = settingsData?.bankFee ?? 3500;
  const ewalletFeeVal = settingsData?.ewalletFee ?? 2000;
  const minWithdrawalVal = settingsData?.minWithdrawal ?? 10000;

  const formatIDR = (amount: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

  const availableBalance = merchantData?.balance || 0;
  const isAccountSet = !!(merchantData?.bankName && merchantData?.bankAccountNumber);
  const isEwallet = merchantData?.accountType === 'ewallet' || EWALLET_OPTIONS.some(e => e.id === merchantData?.bankNameId || e.name === merchantData?.bankName);
  const feeVal = isEwallet ? ewalletFeeVal : bankFeeVal;

  const numAmount = parseInt(withdrawAmount.replace(/[^0-9]/g, ''), 10) || 0;
  const totalDeducted = numAmount > 0 ? numAmount + feeVal : 0;
  const netReceived = numAmount; // Merchant menerima bersih nominal yang diinput

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantRef || !user) return;

    if (!isAccountSet) {
      toast({ variant: 'destructive', title: 'Rekening Belum Diatur', description: 'Silakan atur rekening bank atau e-wallet Anda terlebih dahulu.' });
      onOpenBankModal();
      return;
    }

    if (numAmount < minWithdrawalVal) {
      toast({ variant: 'destructive', title: 'Nominal Terlalu Kecil', description: `Minimal penarikan saldo adalah ${formatIDR(minWithdrawalVal)}.` });
      return;
    }

    if (totalDeducted > availableBalance) {
      toast({ 
        variant: 'destructive', 
        title: 'Saldo Tidak Mencukupi', 
        description: `Saldo Anda (${formatIDR(availableBalance)}) tidak cukup untuk memotong nominal penarikan ${formatIDR(numAmount)} + Biaya Admin ${formatIDR(feeVal)} (Total Dipotong: ${formatIDR(totalDeducted)}).` 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const txId = `WD-${Date.now()}`;

      // 1. Simpan catatan transaksi penarikan saldo (Total Dipotong = Nominal + Fee)
      const txRef = collection(firestore, 'merchants', user.uid, 'transactions');
      const newTxDoc = await addDoc(txRef, {
        id: txId,
        externalId: txId,
        type: 'WITHDRAWAL',
        status: 'Pending',
        amount: -totalDeducted, // Potong Saldo Total (Nominal + Fee)
        netAmount: -totalDeducted,
        withdrawRequested: numAmount,
        feeAmount: feeVal,
        netReceived: netReceived, // Transfer bersih ke bank merchant = numAmount
        paymentMethod: `Penarikan: ${merchantData.bankName} (${merchantData.bankAccountNumber})`,
        bankName: merchantData.bankName,
        accountNumber: merchantData.bankAccountNumber,
        accountName: merchantData.bankAccountName || merchantData.name,
        transactionDate: now.toISOString(),
        updatedAt: now.toISOString()
      });

      // 2. Potong Saldo Merchant sekaligus dengan Fee Admin (totalDeducted)
      await updateDocumentNonBlocking(merchantRef, {
        balance: increment(-totalDeducted),
        updatedAt: now.toISOString()
      });

      // 3. Eksekusi Otomatis H2H Payout Orderkuota via Server Action (Node.js - Bypass CORS)
      try {
        const { processOrderkuotaPayoutAction } = await import('@/lib/actions/orderkuota-payout-action');
        const payoutRes = await processOrderkuotaPayoutAction({
          refId: txId,
          bankName: merchantData.bankName,
          bankNameId: merchantData.bankNameId,
          accountNumber: merchantData.bankAccountNumber,
          qtyAmount: numAmount
        });

        if (payoutRes.status === 'Success' || payoutRes.success) {
          updateDocumentNonBlocking(newTxDoc, {
            status: 'Success',
            h2hMessage: payoutRes.message,
            updatedAt: new Date().toISOString()
          });

          toast({
            title: "Penarikan Saldo Berhasil Diproses! 🟢",
            description: `Dana ${formatIDR(numAmount)} telah berhasil dikirim otomatis via Orderkuota H2H ke ${merchantData.bankName} (${merchantData.bankAccountNumber}).`,
          });
        } else if (payoutRes.status === 'Failed') {
          updateDocumentNonBlocking(newTxDoc, {
            status: 'Failed',
            rejectionReason: payoutRes.message,
            h2hMessage: payoutRes.message,
            updatedAt: new Date().toISOString()
          });

          // Refund saldo jika H2H Orderkuota Gagal
          updateDocumentNonBlocking(merchantRef, {
            balance: increment(totalDeducted),
            updatedAt: new Date().toISOString()
          });

          toast({
            variant: "destructive",
            title: "Penarikan Gagal & Saldo Di-refund 🔴",
            description: `Gagal mengirim ke Orderkuota: ${payoutRes.message}. Saldo telah dikembalikan.`,
          });
        }
      } catch (err: any) {
        console.error('Orderkuota client trigger error:', err);
        toast({
          title: "Pengajuan Penarikan Saldo Dikirim! ⌛",
          description: `Penarikan ${formatIDR(numAmount)} ke ${merchantData.bankName} diajukan (Status: Pending). Admin akan segera mengonfirmasi transfer.`,
        });
      }

      setWithdrawAmount('');
      onClose();
    } catch (err) {
      console.error('Withdraw Error:', err);
      toast({ variant: 'destructive', title: 'Gagal Menarik Saldo', description: 'Terjadi kesalahan saat memproses penarikan saldo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[92vw] max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-lg bg-white dark:bg-zinc-900 text-black dark:text-white p-4 sm:p-6 space-y-4 focus:outline-none transition-colors">
        <DialogHeader className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-green text-black border-2 border-black px-2.5 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider w-fit">
            <ArrowUpRight className="w-3.5 h-3.5 text-black stroke-[3]" /> PENARIKAN SALDO DANA
          </div>
          <DialogTitle className="font-headline font-black text-lg sm:text-xl text-black dark:text-white">
            Tarik Saldo Ke Rekening
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">
            Transfer saldo dompet toko Anda ke rekening bank atau e-wallet.
          </DialogDescription>
        </DialogHeader>

        {!isAccountSet ? (
          <div className="p-4 bg-neo-yellow/20 border-2 border-black dark:border-zinc-700 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-black dark:text-white mx-auto stroke-[2.5]" />
            <div>
              <p className="font-headline font-black text-sm text-black dark:text-white">Rekening Belum Diatur</p>
              <p className="text-xs font-bold text-black/70 dark:text-zinc-300 mt-1">Anda harus mengonfigurasi nomor rekening bank atau e-wallet sebelum menarik saldo.</p>
            </div>
            <Button
              onClick={() => {
                onClose();
                onOpenBankModal();
              }}
              className="w-full h-10 border-2 border-black dark:border-zinc-700 bg-neo-yellow hover:bg-yellow-400 text-black font-headline font-black text-xs shadow-neo-sm rounded-xl"
            >
              Atur Rekening Bank / E-Wallet Sekarang
            </Button>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-4">
            {/* Account Info Box */}
            <div className="p-3 sm:p-3.5 bg-[#FFFDF5] dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm flex items-center justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-black/60 dark:text-zinc-400">Tujuan Pencairan</p>
                <p className="font-headline font-black text-xs sm:text-sm text-black dark:text-white flex items-center gap-1.5 truncate">
                  {isEwallet ? <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5] shrink-0" /> : <Landmark className="w-4 h-4 text-sky-600 dark:text-sky-400 stroke-[2.5] shrink-0" />}
                  <span className="truncate">{merchantData?.bankName} ({merchantData?.bankAccountNumber})</span>
                </p>
                <p className="text-[10px] sm:text-[11px] font-bold text-black/70 dark:text-zinc-300 truncate">a.n. {merchantData?.bankAccountName || merchantData?.name}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenBankModal();
                }}
                className="h-8 text-[10px] font-headline font-black border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-neo-sky text-black dark:text-white rounded-lg shadow-neo-sm shrink-0"
              >
                Ubah
              </Button>
            </div>

            {/* Available Balance Box */}
            <div className="flex items-center justify-between p-3 bg-neo-sky/20 border-2 border-black dark:border-zinc-700 rounded-xl">
              <span className="text-xs font-headline font-black text-black dark:text-white">Saldo Tersedia:</span>
              <span className="text-xs sm:text-sm font-headline font-black text-black dark:text-white">{formatIDR(availableBalance)}</span>
            </div>

            {/* Withdraw Amount Input */}
            <div className="space-y-1">
              <Label className="font-headline font-black text-[11px] sm:text-xs uppercase tracking-wider text-black dark:text-zinc-200">Nominal Yang Ingin Diterima Di Rekening (IDR)</Label>
              <Input
                type="text"
                placeholder={`Minimal ${formatIDR(minWithdrawalVal)}`}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="h-10 sm:h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-headline font-black text-sm sm:text-base rounded-xl shadow-neo-sm"
              />
            </div>

            {/* Fee & Total Cut Calculation Breakdown */}
            {numAmount > 0 && (
              <div className="p-3 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm space-y-1.5 text-xs font-bold text-black dark:text-white">
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-headline font-black">
                  <span>Transfer Masuk Rekening:</span>
                  <span>{formatIDR(netReceived)}</span>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>Biaya Admin ({isEwallet ? 'E-Wallet' : 'Bank'}):</span>
                  <span>+{formatIDR(feeVal)}</span>
                </div>
                <div className="flex justify-between text-black dark:text-white font-headline font-black pt-1 border-t-2 border-black/10 dark:border-zinc-700 text-sm">
                  <span>Total Saldo Dipotong Dari Wallet:</span>
                  <span className="text-rose-700 dark:text-rose-400">{formatIDR(totalDeducted)}</span>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || numAmount < minWithdrawalVal || totalDeducted > availableBalance}
                className="w-full h-11 border-2 border-black dark:border-zinc-700 bg-neo-green hover:bg-emerald-400 text-black font-headline font-black text-xs sm:text-sm shadow-neo-sm hover:shadow-neo rounded-xl flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Clock className="w-4 h-4 stroke-[3]" />}
                Kirim Pengajuan Penarikan Saldo
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
