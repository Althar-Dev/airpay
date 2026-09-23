'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Landmark, Loader2, Save, CreditCard, CheckCircle2, Smartphone, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BANK_OPTIONS = [
  { id: 'BCA', name: 'Bank Central Asia (BCA)', category: 'bank' },
  { id: 'Mandiri', name: 'Bank Mandiri', category: 'bank' },
  { id: 'BRI', name: 'Bank Rakyat Indonesia (BRI)', category: 'bank' },
  { id: 'BNI', name: 'Bank Negara Indonesia (BNI)', category: 'bank' },
  { id: 'CIMB', name: 'Bank CIMB Niaga', category: 'bank' },
  { id: 'Permata', name: 'Bank Permata', category: 'bank' },
];

export const EWALLET_OPTIONS = [
  { id: 'GoPay', name: 'GoPay', category: 'ewallet' },
  { id: 'DANA', name: 'DANA', category: 'ewallet' },
  { id: 'OVO', name: 'OVO', category: 'ewallet' },
  { id: 'ShopeePay', name: 'ShopeePay', category: 'ewallet' },
  { id: 'LinkAja', name: 'LinkAja', category: 'ewallet' },
];

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BankAccountModal({ isOpen, onClose }: BankAccountModalProps) {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const merchantRef = useMemoFirebase(() => user ? doc(firestore, 'merchants', user.uid) : null, [user, firestore]);
  const { data: merchantData } = useDoc(merchantRef);

  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settingsData } = useDoc(settingsRef);

  const bankFeeVal = settingsData?.bankFee ?? 3500;
  const ewalletFeeVal = settingsData?.ewalletFee ?? 2000;

  const [category, setCategory] = useState<'bank' | 'ewallet'>('bank');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('BCA');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');

  useEffect(() => {
    if (merchantData) {
      const type = merchantData.accountType || (EWALLET_OPTIONS.some(e => e.id === merchantData.bankNameId || e.name === merchantData.bankName) ? 'ewallet' : 'bank');
      setCategory(type);
      setSelectedMethodId(merchantData.bankNameId || (type === 'ewallet' ? 'GoPay' : 'BCA'));
      setAccountNumber(merchantData.bankAccountNumber || '');
      setAccountName(merchantData.bankAccountName || merchantData.name || '');
    }
  }, [merchantData]);

  const currentOptions = category === 'bank' ? BANK_OPTIONS : EWALLET_OPTIONS;
  const currentSelectedMethod = [...BANK_OPTIONS, ...EWALLET_OPTIONS].find(m => m.id === selectedMethodId) || BANK_OPTIONS[0];
  const feeVal = category === 'bank' ? bankFeeVal : ewalletFeeVal;

  const formatIDR = (amount: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantRef) return;

    if (!accountNumber.trim()) {
      toast({ variant: 'destructive', title: 'Nomor Rekening/HP Wajib Diisi', description: 'Silakan masukkan nomor rekening bank atau nomor HP e-wallet Anda.' });
      return;
    }

    if (!accountName.trim()) {
      toast({ variant: 'destructive', title: 'Nama Pemilik Wajib Diisi', description: 'Silakan masukkan nama lengkap sesuai pemilik rekening.' });
      return;
    }

    setIsSaving(true);
    try {
      updateDocumentNonBlocking(merchantRef, {
        accountType: category,
        bankName: currentSelectedMethod.name,
        bankNameId: currentSelectedMethod.id,
        bankAccountNumber: accountNumber.trim(),
        bankAccountName: accountName.trim(),
        payoutFee: feeVal,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Pengaturan Rekening Disimpan",
        description: `Metode pencairan ${currentSelectedMethod.name} berhasil disimpan (Biaya Pencairan: ${formatIDR(feeVal)}).`,
      });
      onClose();
    } catch (err) {
      console.error('Error saving bank account:', err);
      toast({ variant: 'destructive', title: 'Gagal Menyimpan', description: 'Terjadi kesalahan saat menyimpan pengaturan rekening.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[92vw] max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-lg bg-white dark:bg-zinc-900 text-black dark:text-white p-4 sm:p-6 space-y-4 focus:outline-none transition-colors">
        <DialogHeader className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-2.5 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider w-fit">
            <Landmark className="w-3.5 h-3.5 text-black stroke-[3]" /> PENGATURAN PAYOUT
          </div>
          <DialogTitle className="font-headline font-black text-lg sm:text-xl text-black dark:text-white">
            Atur Rekening & E-Wallet
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">
            Pilih metode tujuan pencairan otomatis saldo toko Anda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Category Toggle Tabs */}
          <div className="space-y-1.5">
            <Label className="font-headline font-black text-[11px] sm:text-xs uppercase tracking-wider text-black dark:text-zinc-200">Kategori Metode</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#FFFDF5] dark:bg-zinc-800 p-1.5 rounded-xl border-2 border-black dark:border-zinc-700 shadow-neo-sm">
              <button
                type="button"
                onClick={() => {
                  setCategory('bank');
                  setSelectedMethodId('BCA');
                }}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-headline font-black flex items-center justify-center gap-2 transition-all border-2",
                  category === 'bank' 
                    ? "bg-neo-sky text-black border-black shadow-neo-sm" 
                    : "border-transparent text-black/70 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                )}
              >
                <Building2 className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>Bank (Fee {formatIDR(bankFeeVal)})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('ewallet');
                  setSelectedMethodId('GoPay');
                }}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-headline font-black flex items-center justify-center gap-2 transition-all border-2",
                  category === 'ewallet' 
                    ? "bg-neo-green text-black border-black shadow-neo-sm" 
                    : "border-transparent text-black/70 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                )}
              >
                <Smartphone className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>E-Wallet (Fee {formatIDR(ewalletFeeVal)})</span>
              </button>
            </div>
          </div>

          {/* Select Provider */}
          <div className="space-y-1.5">
            <Label className="font-headline font-black text-[11px] sm:text-xs uppercase tracking-wider text-black dark:text-zinc-200">
              {category === 'bank' ? 'Pilih Bank Transfer' : 'Pilih E-Wallet'}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentOptions.map((opt) => {
                const isSelected = selectedMethodId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedMethodId(opt.id)}
                    className={cn(
                      "p-2 sm:p-2.5 rounded-xl border-2 text-left transition-all flex items-center justify-between font-headline font-black text-[11px] sm:text-xs min-h-[42px]",
                      isSelected 
                        ? "bg-neo-yellow border-black shadow-neo-sm text-black" 
                        : "bg-white dark:bg-zinc-800 border-black/20 dark:border-zinc-700 hover:border-black dark:hover:border-zinc-500 text-black/80 dark:text-zinc-200"
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {category === 'bank' ? (
                        <Building2 className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                      )}
                      <span className="truncate">{opt.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Number Input */}
          <div className="space-y-1">
            <Label className="font-headline font-black text-[11px] sm:text-xs uppercase tracking-wider text-black dark:text-zinc-200">
              {category === 'bank' ? 'Nomor Rekening Bank' : 'Nomor HP E-Wallet'}
            </Label>
            <Input
              type="text"
              placeholder={category === 'bank' ? 'Contoh: 1234567890' : 'Contoh: 081234567890'}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="h-10 sm:h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-mono font-bold text-xs sm:text-sm rounded-xl shadow-neo-sm"
            />
          </div>

          {/* Account Owner Name Input */}
          <div className="space-y-1">
            <Label className="font-headline font-black text-[11px] sm:text-xs uppercase tracking-wider text-black dark:text-zinc-200">Nama Pemilik Akun</Label>
            <Input
              type="text"
              placeholder="Sesuai nama di buku tabungan / e-wallet"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="h-10 sm:h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs sm:text-sm rounded-xl shadow-neo-sm"
            />
          </div>

          {/* Fee Information Box */}
          <div className="p-3 bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm flex items-center justify-between gap-2 text-black dark:text-white">
            <div className="flex items-center gap-1.5 min-w-0">
              <CreditCard className="w-4 h-4 text-black dark:text-white stroke-[2.5] shrink-0" />
              <span className="text-[11px] sm:text-xs font-headline font-black text-black dark:text-white truncate">Biaya Pencairan ({category === 'bank' ? 'Bank' : 'E-Wallet'}):</span>
            </div>
            <span className="text-[11px] sm:text-xs font-mono font-black bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-black dark:border-zinc-700 text-rose-700 dark:text-rose-400 shrink-0">
              {formatIDR(feeVal)} / tx
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full h-11 border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs sm:text-sm shadow-neo-sm hover:shadow-neo rounded-xl flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4 stroke-[3]" />}
              Simpan Pengaturan Rekening
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
