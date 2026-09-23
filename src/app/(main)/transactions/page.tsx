'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ListFilter, Search, Clock, ArrowRightLeft, Zap, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportTransactionsToPDF } from '@/lib/pdf-export';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || '';
  switch (s) {
    case 'success':
    case 'successful':
      return <span className="bg-neo-green text-black border-2 border-black shadow-neo-sm text-[10px] font-headline font-black px-2 py-0.5 rounded-lg inline-block">Berhasil</span>;
    case 'pending':
      return <span className="bg-neo-yellow text-black border-2 border-black shadow-neo-sm text-[10px] font-headline font-black px-2 py-0.5 rounded-lg inline-block">Pending</span>;
    case 'expired':
    case 'failed':
      return <span className="bg-neo-coral text-white border-2 border-black shadow-neo-sm text-[10px] font-headline font-black px-2 py-0.5 rounded-lg inline-block">Gagal</span>;
    default:
      return <span className="bg-white text-black border-2 border-black text-[10px] font-bold px-2 py-0.5 rounded-lg inline-block">{status}</span>;
  }
};

export default function TransactionsPage() {
  const router = useRouter();
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'merchants', user.uid, 'transactions'),
      orderBy('transactionDate', 'desc')
    );
  }, [user, firestore]);

  const { data: allTransactions, isLoading } = useCollection(transactionsQuery);

  useEffect(() => {
    if (!allTransactions || !user || !firestore) return;

    const now = new Date();
    allTransactions.forEach(async (tx: any) => {
      if (tx.status === 'Pending' && tx.expiryDate && new Date(tx.expiryDate) < now) {
        try {
          const txRef = doc(firestore, 'merchants', user.uid, 'transactions', tx.id);
          await updateDoc(txRef, {
            status: 'Expired',
            updatedAt: now.toISOString()
          });
        } catch (err) { }
      }
    });
  }, [allTransactions, user, firestore]);

  const filteredTransactions = useMemo(() => {
    if (!allTransactions) return [];

    return allTransactions.filter(tx => {
      const matchesTab = activeTab === 'all' || tx.status === activeTab;

      const searchStr = searchTerm.toLowerCase();
      const matchesSearch =
        (tx.id?.toLowerCase() || '').includes(searchStr) ||
        (tx.externalId?.toLowerCase() || '').includes(searchStr) ||
        (tx.customer?.toLowerCase() || '').includes(searchStr) ||
        (tx.payerReference?.toLowerCase() || '').includes(searchStr);

      return matchesTab && matchesSearch;
    });
  }, [allTransactions, activeTab, searchTerm]);

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);

  return (
    <div className="space-y-6 pb-32">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 sm:border-3 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md text-black dark:text-white transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
            <ArrowRightLeft className="w-3 h-3 text-black stroke-[3]" /> LOG TRANSAKSI MERCHANT
          </div>
          <h1 className="font-headline font-black text-xl sm:text-3xl text-black dark:text-white tracking-tight">
            Riwayat Transaksi QRIS
          </h1>
          <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
            Pantau dan audit seluruh aktivitas pembayaran yang masuk ke toko Anda secara otomatis.
          </p>
        </div>
      </div>

      {/* Filter & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-black dark:text-zinc-400 stroke-[3]" />
          <Input
            placeholder="Cari Transaction ID, external_id, atau nominal..."
            className="pl-9 h-10 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs shadow-neo-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-neo-yellow dark:hover:bg-zinc-800 shadow-neo-sm gap-2 font-headline font-black text-xs text-black dark:text-white">
                <ListFilter className="h-3.5 w-3.5 stroke-[3]" />
                Filter Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-neo-md p-2 space-y-1 font-bold text-xs text-black dark:text-white">
              <DropdownMenuLabel className="font-headline font-black text-xs">Filter Berdasarkan Status</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-black/10 dark:bg-zinc-800" />
              <DropdownMenuCheckboxItem checked={activeTab === 'all'} onSelect={() => setActiveTab('all')} className="rounded-lg font-bold">Semua Status</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={activeTab === 'Success'} onSelect={() => setActiveTab('Success')} className="rounded-lg font-bold">Berhasil</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={activeTab === 'Pending'} onSelect={() => setActiveTab('Pending')} className="rounded-lg font-bold">Pending</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={activeTab === 'Expired'} onSelect={() => setActiveTab('Expired')} className="rounded-lg font-bold">Gagal / Expired</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              if (!filteredTransactions || filteredTransactions.length === 0) {
                toast({ variant: 'destructive', title: 'Tidak Ada Data', description: 'Tidak ada data transaksi yang dapat diekspor ke PDF.' });
                return;
              }
              exportTransactionsToPDF(filteredTransactions, user?.displayName || 'Merchant');
              toast({ title: 'PDF Laporan Berhasil Diunduh! 📄', description: 'File laporan transaksi PDF telah disimpan.' });
            }}
            className="h-10 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-neo-sky dark:hover:bg-zinc-800 shadow-neo-sm gap-2 font-headline font-black text-xs text-black dark:text-white"
          >
            <FileText className="h-3.5 w-3.5 stroke-[3]" />
            Export Laporan PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#FFFDF5] dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-1 rounded-xl shadow-neo-sm h-auto mb-3 flex-wrap justify-start gap-1">
          <TabsTrigger value="all" className="text-xs font-headline font-black py-1.5 px-4 rounded-lg transition-all data-[state=active]:bg-neo-yellow data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-neo-sm dark:text-zinc-200">Semua</TabsTrigger>
          <TabsTrigger value="Success" className="text-xs font-headline font-black py-1.5 px-4 rounded-lg transition-all data-[state=active]:bg-neo-green data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-neo-sm dark:text-zinc-200">Berhasil</TabsTrigger>
          <TabsTrigger value="Pending" className="text-xs font-headline font-black py-1.5 px-4 rounded-lg transition-all data-[state=active]:bg-neo-yellow data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-neo-sm dark:text-zinc-200">Pending</TabsTrigger>
          <TabsTrigger value="Expired" className="text-xs font-headline font-black py-1.5 px-4 rounded-lg transition-all data-[state=active]:bg-neo-coral data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-neo-sm dark:text-zinc-200">Gagal</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl bg-black/10 dark:bg-zinc-800" />)}
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader className="bg-neo-cream dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700">
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="py-3 px-6 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Transaction ID</TableHead>
                          <TableHead className="py-3 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Status</TableHead>
                          <TableHead className="py-3 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Tanggal Transaksi</TableHead>
                          <TableHead className="py-3 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">MDR</TableHead>
                          <TableHead className="py-3 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Nominal Pembayaran</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions?.map(tx => {
                          const feeVal = tx.feeAmount ?? Math.round((tx.amount || 0) * 0.007);
                          const netVal = tx.netAmount ?? Math.max(0, (tx.amount || 0) - feeVal);

                          return (
                            <TableRow 
                              key={tx.id} 
                              onClick={() => router.push(`/transactions/${tx.id}`)}
                              className="border-b-2 border-black/10 dark:border-zinc-800 last:border-none hover:bg-[#FFFDF5] dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                            >
                              <TableCell className="py-3.5 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-xl bg-neo-sky border-2 border-black shadow-neo-sm flex items-center justify-center shrink-0 text-black">
                                    <CreditCard className="h-4 w-4 stroke-[2.5]" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-headline font-black text-xs text-black dark:text-white truncate font-mono">{tx.externalId || tx.id}</p>
                                    <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400 truncate">{tx.paymentMethod || 'QRIS All Bank'}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3.5">
                                {getStatusBadge(tx.status)}
                              </TableCell>
                              <TableCell className="py-3.5">
                                <div className="flex items-center gap-2 text-black/80 dark:text-zinc-300">
                                  <Clock className="h-3.5 w-3.5 stroke-[2.5]" />
                                  <span className="text-xs font-extrabold">
                                    {tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    }) : '-'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3.5 text-right">
                                <span className="inline-block bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded-md font-mono text-xs font-bold">
                                  -{formatIDR(feeVal)}
                                </span>
                              </TableCell>
                              <TableCell className="py-3.5 text-right">
                                <div className="font-headline font-black text-sm text-black dark:text-white">
                                  {formatIDR(tx.amount)}
                                </div>
                                {(tx.status === 'Success' || tx.status === 'Paid') && (
                                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    Income: {formatIDR(netVal)}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card List View */}
                  <div className="md:hidden p-3 space-y-3 bg-[#FFFDF5] dark:bg-zinc-950">
                    {filteredTransactions?.map(tx => {
                      const feeVal = tx.feeAmount ?? Math.round((tx.amount || 0) * 0.007);
                      const netVal = tx.netAmount ?? Math.max(0, (tx.amount || 0) - feeVal);

                      return (
                        <div 
                          key={tx.id} 
                          onClick={() => router.push(`/transactions/${tx.id}`)}
                          className="p-3.5 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl shadow-neo-sm flex items-center justify-between gap-3 text-black dark:text-white cursor-pointer hover:bg-neo-cream dark:hover:bg-zinc-800/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border-2 border-black bg-neo-yellow shadow-neo-sm text-black">
                              <ArrowRightLeft className="h-4 w-4 stroke-[2.5]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-headline font-black text-xs text-black dark:text-white truncate font-mono">{tx.externalId || tx.id}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-black/60 dark:text-zinc-400 font-bold">
                                  {tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                                </span>
                                {getStatusBadge(tx.status)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono">
                                Fee: -{formatIDR(feeVal)}
                              </span>
                              <p className="font-headline font-black text-xs text-black dark:text-white">
                                {formatIDR(tx.amount)}
                              </p>
                            </div>
                            {(tx.status === 'Success' || tx.status === 'Paid') && (
                              <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                Income: {formatIDR(netVal)}
                              </p>
                            )}
                            <p className="text-[9px] text-black/60 dark:text-zinc-400 font-extrabold mt-0.5 font-mono">ID: {(tx.externalId || tx.id).substring(0, 8)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(!filteredTransactions || filteredTransactions.length === 0) && (
                    <div className="py-16 text-center flex flex-col items-center gap-2 bg-[#FFFDF5] dark:bg-zinc-900 text-black dark:text-white">
                      <div className="p-3 bg-neo-yellow border-2 border-black rounded-2xl shadow-neo-sm text-black">
                        <Zap className="h-6 w-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <p className="font-headline font-black text-xs text-black dark:text-white">Tidak Ada Transaksi Ditemukan</p>
                        <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400">Coba ubah kata kunci pencarian atau tab filter status Anda.</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}