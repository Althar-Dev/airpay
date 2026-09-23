'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpRight, Search, Landmark, Wallet, CheckCircle2, XCircle, Clock, ShieldCheck, Loader2, RefreshCw, AlertCircle, Store } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || '';
  switch (s) {
    case 'success':
    case 'successful':
    case 'completed':
    case 'paid':
      return (
        <span className="bg-neo-green text-black border-2 border-black shadow-neo-sm text-[10px] font-headline font-black px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 stroke-[3]" /> Selesai / Ditransfer
        </span>
      );
    case 'pending':
      return (
        <span className="bg-neo-yellow text-black border-2 border-black shadow-neo-sm text-[10px] font-headline font-black px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1">
          <Clock className="w-3 h-3 stroke-[3]" /> Menunggu Transfer
        </span>
      );
    case 'failed':
    case 'rejected':
      return (
        <span className="bg-neo-coral text-white border-2 border-black shadow-neo-sm text-[10px] font-headline font-black px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1">
          <XCircle className="w-3 h-3 stroke-[3]" /> Ditolak / Dibatalkan
        </span>
      );
    default:
      return <span className="bg-white text-black border-2 border-black text-[10px] font-bold px-2 py-0.5 rounded-lg inline-block">{status}</span>;
  }
};

export default function AdminWithdrawalsPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'success' | 'failed'>('all');

  // Modal States
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');

  // Fetch All Merchants
  const merchantsQuery = useMemoFirebase(() => collection(firestore, 'merchants'), [firestore]);
  const { data: merchants, isLoading: isMerchantsLoading } = useCollection(merchantsQuery);

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Math.abs(amount || 0));

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-32">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 sm:border-3 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md text-black dark:text-white transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-green text-black border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
            <ArrowUpRight className="w-3.5 h-3.5 text-black stroke-[3]" /> MANAJEMEN PENARIKAN SALDO
          </div>
          <h1 className="font-headline font-black text-xl sm:text-3xl text-black dark:text-white tracking-tight">
            Withdraw Requests Admin
          </h1>
          <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
            Kelola dan proses pengajuan penarikan dana merchant ke rekening bank & e-wallet.
          </p>
        </div>
      </div>

      {/* Main Withdrawal Table Section */}
      <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
        <CardHeader className="bg-[#FFFDF5] dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-headline font-black text-base sm:text-lg text-black dark:text-white">Daftar Permintaan Penarikan Saldo</CardTitle>
            <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Proses pencairan dana merchant dan verifikasi transfer manual.</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-black/60 dark:text-zinc-400 stroke-[2.5]" />
              <Input
                placeholder="Cari merchant / rekening..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white font-bold text-xs rounded-xl shadow-neo-sm"
              />
            </div>

            {/* Filter Tabs */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
              <TabsList className="bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 p-0.5 rounded-xl shadow-neo-sm h-9">
                <TabsTrigger value="all" className="text-[10px] font-headline font-black px-2.5 py-1 rounded-lg data-[state=active]:bg-neo-yellow data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black dark:text-zinc-300">
                  Semua
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-[10px] font-headline font-black px-2.5 py-1 rounded-lg data-[state=active]:bg-neo-yellow data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black dark:text-zinc-300">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="success" className="text-[10px] font-headline font-black px-2.5 py-1 rounded-lg data-[state=active]:bg-neo-green data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black dark:text-zinc-300">
                  Selesai
                </TabsTrigger>
                <TabsTrigger value="failed" className="text-[10px] font-headline font-black px-2.5 py-1 rounded-lg data-[state=active]:bg-neo-coral data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black dark:text-zinc-300">
                  Ditolak
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isMerchantsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl bg-black/10 dark:bg-zinc-800" />)}
            </div>
          ) : (
            <MerchantWithdrawalsTable
              merchants={merchants || []}
              searchTerm={searchTerm}
              activeTab={activeTab}
              formatIDR={formatIDR}
              onSelectAction={(item: any, type: 'approve' | 'reject') => {
                setSelectedWithdrawal(item);
                setModalType(type);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Action Approval / Rejection Modal */}
      {selectedWithdrawal && (
        <Dialog open={!!modalType} onOpenChange={(open) => !open && setModalType(null)}>
          <DialogContent className="w-[92vw] max-w-md rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-lg bg-white dark:bg-zinc-900 text-black dark:text-white p-5 sm:p-6 space-y-4">
            <DialogHeader className="space-y-1">
              <div className={cn(
                "inline-flex items-center gap-1.5 border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase w-fit",
                modalType === 'approve' ? "bg-neo-green text-black" : "bg-neo-coral text-white"
              )}>
                {modalType === 'approve' ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> : <XCircle className="w-3.5 h-3.5 stroke-[3]" />}
                {modalType === 'approve' ? 'KONFIRMASI TRANSFER' : 'TOLAK PENARIKAN SALDO'}
              </div>
              <DialogTitle className="font-headline font-black text-lg sm:text-xl text-black dark:text-white">
                {modalType === 'approve' ? 'Setujui & Tandai Ditransfer' : 'Tolak Penarikan & Kembalikan Saldo'}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">
                {modalType === 'approve' 
                  ? 'Pastikan Anda telah melakukan transfer ke rekening merchant berikut.' 
                  : 'Total saldo yang dipotong (Nominal + Fee) akan otomatis dikembalikan (refund) ke dompet merchant.'}
              </DialogDescription>
            </DialogHeader>

            {/* Target Account Summary Card */}
            <div className="p-3.5 bg-[#FFFDF5] dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm space-y-2 text-xs text-black dark:text-white">
              <div className="flex justify-between items-center pb-2 border-b border-black/10 dark:border-zinc-700">
                <span className="font-extrabold text-black/60 dark:text-zinc-400">Merchant:</span>
                <span className="font-headline font-black text-black dark:text-white">{selectedWithdrawal.merchantName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-black/60 dark:text-zinc-400">Tujuan Payout:</span>
                <span className="font-headline font-black text-black dark:text-white">{selectedWithdrawal.bankName || 'Bank/E-Wallet'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-black/60 dark:text-zinc-400">No. Rekening / HP:</span>
                <span className="font-mono font-black text-black dark:text-white">{selectedWithdrawal.accountNumber || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-black/60 dark:text-zinc-400">Pemilik Rekening:</span>
                <span className="font-bold text-black dark:text-white">a.n. {selectedWithdrawal.accountName || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-bold">
                <span>Fee Admin ({selectedWithdrawal.feeAmount ? 'Tercatat' : 'Default'}):</span>
                <span>+{formatIDR(selectedWithdrawal.feeAmount || 3500)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-black/10 dark:border-zinc-700 text-emerald-700 dark:text-emerald-400 font-headline font-black text-sm">
                <span>Net Transfer (Wajib Kirim Ke Bank):</span>
                <span>{formatIDR(selectedWithdrawal.netReceived || selectedWithdrawal.withdrawRequested || (Math.abs(selectedWithdrawal.amount) - (selectedWithdrawal.feeAmount || 3500)))}</span>
              </div>
              <div className="flex justify-between items-center text-rose-700 dark:text-rose-400 font-headline font-black text-xs pt-1">
                <span>Total Dipotong Dari Saldo Merchant:</span>
                <span>{formatIDR(Math.abs(selectedWithdrawal.amount))}</span>
              </div>
            </div>

            {modalType === 'reject' && (
              <div className="space-y-1">
                <label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Alasan Penolakan (Opsional)</label>
                <Input
                  placeholder="Contoh: Nomor rekening tidak ditemukan / nama tidak sesuai"
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  className="h-10 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white font-bold text-xs rounded-xl shadow-neo-sm"
                />
              </div>
            )}

            <DialogFooter className="pt-2 gap-2 flex-col sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setModalType(null)}
                className="w-full sm:w-auto h-11 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-cream text-black dark:text-white font-headline font-black text-xs rounded-xl shadow-neo-sm"
              >
                Batal
              </Button>
              <Button
                onClick={async () => {
                  if (!selectedWithdrawal) return;
                  setIsProcessing(true);
                  try {
                    const txRef = doc(firestore, 'merchants', selectedWithdrawal.merchantId, 'transactions', selectedWithdrawal.docId);

                    if (modalType === 'approve') {
                      await updateDoc(txRef, {
                        status: 'Success',
                        updatedAt: new Date().toISOString()
                      });

                      toast({
                        title: "Penarikan Disetujui! 🟢",
                        description: `Status penarikan ${selectedWithdrawal.merchantName} diubah menjadi Berhasil.`,
                      });
                    } else {
                      // Reject: Update status to Failed and refund total balance deducted (amount + fee)
                      const refundAmount = Math.abs(selectedWithdrawal.amount);
                      await updateDoc(txRef, {
                        status: 'Failed',
                        rejectionReason: rejectionNote || 'Ditolak oleh admin',
                        updatedAt: new Date().toISOString()
                      });

                      const merchantRef = doc(firestore, 'merchants', selectedWithdrawal.merchantId);
                      await updateDoc(merchantRef, {
                        balance: increment(refundAmount),
                        updatedAt: new Date().toISOString()
                      });

                      toast({
                        variant: "destructive",
                        title: "Penarikan Ditolak & Saldo Di-refund! 🔴",
                        description: `Saldo total ${formatIDR(refundAmount)} telah dikembalikan ke dompet ${selectedWithdrawal.merchantName}.`,
                      });
                    }
                    setModalType(null);
                  } catch (err) {
                    console.error('Error processing withdrawal action:', err);
                    toast({ variant: 'destructive', title: 'Gagal Memproses Status', description: 'Terjadi kesalahan saat mengupdate status penarikan.' });
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className={cn(
                  "w-full sm:w-auto h-11 border-2 border-black dark:border-zinc-700 font-headline font-black text-xs shadow-neo-sm hover:shadow-neo rounded-xl flex items-center justify-center gap-2",
                  modalType === 'approve' ? "bg-neo-green hover:bg-emerald-400 text-black" : "bg-neo-coral hover:bg-rose-600 text-white"
                )}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : (modalType === 'approve' ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : <XCircle className="w-4 h-4 stroke-[3]" />)}
                {modalType === 'approve' ? 'Konfirmasi Sudah Ditransfer' : 'Tolak & Refund Saldo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function MerchantWithdrawalsTable({
  merchants,
  searchTerm,
  activeTab,
  formatIDR,
  onSelectAction
}: {
  merchants: any[];
  searchTerm: string;
  activeTab: string;
  formatIDR: (amt: number) => string;
  onSelectAction: (item: any, type: 'approve' | 'reject') => void;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-neo-cream dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="py-3 px-4 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Tanggal & Merchant</TableHead>
            <TableHead className="py-3 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Tujuan Rekening / E-Wallet</TableHead>
            <TableHead className="py-3 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Net Wajib Transfer (Bank)</TableHead>
            <TableHead className="py-3 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Fee Admin</TableHead>
            <TableHead className="py-3 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Total Potong Saldo</TableHead>
            <TableHead className="py-3 text-center font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Status</TableHead>
            <TableHead className="py-3 text-center font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Aksi Admin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {merchants.map((m) => (
            <MerchantSubcollectionRows
              key={m.id}
              merchant={m}
              searchTerm={searchTerm}
              activeTab={activeTab}
              formatIDR={formatIDR}
              onSelectAction={onSelectAction}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MerchantSubcollectionRows({
  merchant,
  searchTerm,
  activeTab,
  formatIDR,
  onSelectAction
}: {
  merchant: any;
  searchTerm: string;
  activeTab: string;
  formatIDR: (amt: number) => string;
  onSelectAction: (item: any, type: 'approve' | 'reject') => void;
}) {
  const { firestore } = useFirebase();
  const txRef = useMemoFirebase(() => query(collection(firestore, 'merchants', merchant.id, 'transactions'), orderBy('transactionDate', 'desc')), [merchant.id, firestore]);
  const { data: transactions } = useCollection(txRef);

  const withdrawals = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((tx: any) => {
      const isWd = tx.type === 'WITHDRAWAL' || tx.amount < 0;
      if (!isWd) return false;

      // Filter Tab
      const statusLower = (tx.status || '').toLowerCase();
      if (activeTab === 'pending' && statusLower !== 'pending') return false;
      if (activeTab === 'success' && (statusLower !== 'success' && statusLower !== 'successful' && statusLower !== 'completed' && statusLower !== 'paid')) return false;
      if (activeTab === 'failed' && (statusLower !== 'failed' && statusLower !== 'rejected')) return false;

      // Filter Search
      if (searchTerm.trim()) {
        const queryStr = searchTerm.toLowerCase();
        const mName = (merchant.name || merchant.businessName || '').toLowerCase();
        const mEmail = (merchant.email || '').toLowerCase();
        const bankName = (tx.bankName || '').toLowerCase();
        const accNum = (tx.accountNumber || '').toLowerCase();
        const accName = (tx.accountName || '').toLowerCase();

        return mName.includes(queryStr) || mEmail.includes(queryStr) || bankName.includes(queryStr) || accNum.includes(queryStr) || accName.includes(queryStr);
      }

      return true;
    });
  }, [transactions, activeTab, searchTerm, merchant]);

  if (!withdrawals || withdrawals.length === 0) return null;

  return (
    <>
      {withdrawals.map((tx: any) => {
        const totalDeducted = Math.abs(tx.amount || 0);
        const feeAmt = tx.feeAmount ?? 3500;
        const netTransfer = tx.netReceived ?? tx.withdrawRequested ?? Math.max(0, totalDeducted - feeAmt);
        const isPending = (tx.status || '').toLowerCase() === 'pending';

        const itemPayload = {
          ...tx,
          docId: tx.id,
          merchantId: merchant.id,
          merchantName: merchant.name || merchant.businessName || 'Merchant',
          merchantEmail: merchant.email || '',
        };

        return (
          <TableRow key={tx.id} className="border-b-2 border-black/10 dark:border-zinc-800 last:border-none hover:bg-[#FFFDF5] dark:hover:bg-zinc-800/60 transition-colors">
            <TableCell className="py-3 px-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-neo-yellow text-black border-2 border-black shadow-neo-sm flex items-center justify-center shrink-0">
                  <Store className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <p className="font-headline font-black text-xs text-black dark:text-white truncate">{merchant.name || merchant.businessName || 'Merchant'}</p>
                  <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400 truncate">
                    {tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell className="py-3 font-headline font-black text-xs text-black dark:text-white">
              <div>
                <p className="truncate flex items-center gap-1">
                  {tx.bankName || 'Bank/E-Wallet'}
                </p>
                <p className="text-[10px] font-mono font-black text-sky-800 dark:text-sky-400">
                  {tx.accountNumber || '-'} <span className="font-sans font-bold text-black/70 dark:text-zinc-300">(a.n. {tx.accountName || merchant.name})</span>
                </p>
              </div>
            </TableCell>

            <TableCell className="py-3 text-right font-headline font-black text-xs text-emerald-700 dark:text-emerald-400">
              {formatIDR(netTransfer)}
            </TableCell>

            <TableCell className="py-3 text-right font-bold text-xs text-rose-600 dark:text-rose-400">
              +{formatIDR(feeAmt)}
            </TableCell>

            <TableCell className="py-3 text-right font-headline font-black text-xs text-rose-700 dark:text-rose-400">
              -{formatIDR(totalDeducted)}
            </TableCell>

            <TableCell className="py-3 text-center">
              {getStatusBadge(tx.status)}
            </TableCell>

            <TableCell className="py-3 text-center">
              {isPending ? (
                <div className="flex items-center justify-center gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => onSelectAction(itemPayload, 'approve')}
                    className="h-7 px-2.5 bg-neo-green hover:bg-emerald-400 text-black border-2 border-black shadow-neo-sm font-headline font-black text-[10px] rounded-lg"
                  >
                    Transfer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectAction(itemPayload, 'reject')}
                    className="h-7 px-2.5 bg-neo-coral hover:bg-rose-600 text-white border-2 border-black shadow-neo-sm font-headline font-black text-[10px] rounded-lg"
                  >
                    Tolak
                  </Button>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-black/50 dark:text-zinc-400 italic">Telah diproses</span>
              )}
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
