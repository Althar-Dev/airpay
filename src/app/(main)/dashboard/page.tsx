'use client';

import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  Plus,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { OverviewChart } from '@/app/(main)/dashboard/overview-chart';
import { useCollection, useFirebase, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, limit, orderBy, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalytics } from '@/hooks/use-analytics';
import Link from 'next/link';

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || '';
  switch (s) {
    case 'success':
    case 'successful':
      return <span className="bg-neo-green text-black border border-black shadow-neo-sm text-[9px] font-headline font-black px-1.5 py-0.5 rounded inline-block">Berhasil</span>;
    case 'pending':
      return <span className="bg-neo-yellow text-black border border-black shadow-neo-sm text-[9px] font-headline font-black px-1.5 py-0.5 rounded inline-block">Pending</span>;
    case 'expired':
    case 'failed':
      return <span className="bg-neo-coral text-white border border-black shadow-neo-sm text-[9px] font-headline font-black px-1.5 py-0.5 rounded inline-block">Gagal</span>;
    default:
      return <span className="bg-white text-black border border-black text-[9px] font-bold px-1.5 py-0.5 rounded inline-block">{status}</span>;
  }
};

export default function DashboardPage() {
  const { user, firestore } = useFirebase();
  const { isLoading: isAnalyticsLoading, monthlyStats, allTimeStats, monthlyRevenueChartData, formatCurrency } = useAnalytics();

  // Fetch merchant profile for the 'name' field
  const merchantRef = useMemoFirebase(() => user ? doc(firestore, 'merchants', user.uid) : null, [user, firestore]);
  const { data: merchantData, isLoading: isMerchantLoading } = useDoc<{ name: string }>(merchantRef);

  const recentSalesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'merchants', user.uid, 'transactions'), orderBy('transactionDate', 'desc'), limit(6));
  }, [user, firestore]);

  const { data: recentSales, isLoading: isRecentSalesLoading } = useCollection(recentSalesQuery);

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return '...';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-32">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-neo-yellow via-amber-200 to-yellow-400 dark:from-amber-900/60 dark:via-zinc-900 dark:to-zinc-900 border-2 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md text-black dark:text-white transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
            <Zap className="w-3 h-3 text-black stroke-[3]" /> DASBOR BISNIS AKTIF
          </div>
          <h1 className="font-headline font-black text-xl sm:text-3xl text-black dark:text-white tracking-tight flex flex-wrap items-center gap-2 pt-0.5">
            <span>Selamat Datang,</span>
            {isMerchantLoading ? (
              <Skeleton className="h-8 w-36 bg-black/10 dark:bg-zinc-700 rounded-xl" />
            ) : (
              <span className="bg-neo-pink text-black px-2.5 py-0.5 border-2 border-black shadow-neo rounded-xl rotate-[-1deg]">
                {merchantData?.name || 'Merchant'}
              </span>
            )}
          </h1>
          <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
            Berikut adalah ringkasan omset & aktivitas pembayaran toko Anda hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            asChild
            className="w-full sm:w-auto h-11 sm:h-12 px-5 font-headline font-black text-xs sm:text-sm border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black shadow-neo-md hover:shadow-neo-lg rounded-xl transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm flex items-center justify-center gap-2"
          >
            <Link href="/generate-qr">
              <Plus className="h-4 w-4 stroke-[3]" /> Buat QRIS Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Revenue */}
        <Card className="relative overflow-hidden border-2 border-black dark:border-zinc-700 bg-[#FFF9E6] dark:bg-zinc-900 shadow-neo-md hover:shadow-neo-lg hover:-translate-y-0.5 transition-all rounded-2xl sm:rounded-3xl p-1 text-black dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-headline font-black text-black dark:text-white">Pendapatan Bulan Ini</CardTitle>
            <div className="p-2 bg-neo-yellow border-2 border-black rounded-xl shadow-neo-sm text-black">
              <DollarSign className="h-4.5 w-4.5 stroke-[3]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isAnalyticsLoading ? <Skeleton className='h-8 w-36 bg-black/10 dark:bg-zinc-700 rounded-xl' /> : <div className="text-xl sm:text-2xl font-headline font-black text-black dark:text-white">{formatCurrency(monthlyStats?.revenueThisMonth || 0)}</div>}
            {isAnalyticsLoading ? <Skeleton className='h-4 w-28 mt-1.5 bg-black/10 dark:bg-zinc-700 rounded' /> : (
              <p className="text-xs font-extrabold text-black/80 dark:text-zinc-300 mt-1.5 flex items-center gap-1">
                <span className={`inline-block px-1.5 py-0.2 border border-black rounded font-black text-[10px] ${(monthlyStats?.revenuePercentageChange || 0) >= 0 ? 'bg-neo-green text-black' : 'bg-neo-coral text-white'}`}>
                  {formatPercentage(monthlyStats?.revenuePercentageChange)}
                </span> dari bulan lalu
              </p>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Customers */}
        <Card className="relative overflow-hidden border-2 border-black dark:border-zinc-700 bg-[#E6F4FE] dark:bg-zinc-900 shadow-neo-md hover:shadow-neo-lg hover:-translate-y-0.5 transition-all rounded-2xl sm:rounded-3xl p-1 text-black dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-headline font-black text-black dark:text-white">Pelanggan Baru</CardTitle>
            <div className="p-2 bg-neo-sky border-2 border-black rounded-xl shadow-neo-sm text-black">
              <Users className="h-4.5 w-4.5 stroke-[3]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isAnalyticsLoading ? <Skeleton className='h-8 w-20 bg-black/10 dark:bg-zinc-700 rounded-xl' /> : <div className="text-xl sm:text-2xl font-headline font-black text-black dark:text-white">+{monthlyStats?.newCustomerCount || 0}</div>}
            <p className="text-xs font-extrabold text-black/70 dark:text-zinc-300 mt-1.5">Pelanggan bulan ini</p>
          </CardContent>
        </Card>

        {/* Card 3: Total Transactions */}
        <Card className="relative overflow-hidden border-2 border-black dark:border-zinc-700 bg-[#F3E8FF] dark:bg-zinc-900 shadow-neo-md hover:shadow-neo-lg hover:-translate-y-0.5 transition-all rounded-2xl sm:rounded-3xl p-1 text-black dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-headline font-black text-black dark:text-white">Total Transaksi</CardTitle>
            <div className="p-2 bg-neo-purple border-2 border-black rounded-xl shadow-neo-sm text-black">
              <CreditCard className="h-4.5 w-4.5 stroke-[3]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isAnalyticsLoading ? <Skeleton className='h-8 w-24 bg-black/10 dark:bg-zinc-700 rounded-xl' /> : <div className="text-xl sm:text-2xl font-headline font-black text-black dark:text-white">{allTimeStats?.totalTransactions.toLocaleString() || 0}</div>}
            <p className="text-xs font-extrabold text-black/70 dark:text-zinc-300 mt-1.5">Sepanjang waktu</p>
          </CardContent>
        </Card>

        {/* Card 4: Success Rate */}
        <Card className="relative overflow-hidden border-2 border-black dark:border-zinc-700 bg-[#E6FAF0] dark:bg-zinc-900 shadow-neo-md hover:shadow-neo-lg hover:-translate-y-0.5 transition-all rounded-2xl sm:rounded-3xl p-1 text-black dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-headline font-black text-black dark:text-white">Tingkat Berhasil</CardTitle>
            <div className="p-2 bg-neo-green border-2 border-black rounded-xl shadow-neo-sm text-black">
              <TrendingUp className="h-4.5 w-4.5 stroke-[3]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isAnalyticsLoading ? <Skeleton className='h-8 w-20 bg-black/10 dark:bg-zinc-700 rounded-xl' /> : <div className="text-xl sm:text-2xl font-headline font-black text-black dark:text-white">{(allTimeStats?.successRate || 0).toFixed(1)}%</div>}
            <div className="h-2 w-full bg-white dark:bg-zinc-800 border border-black dark:border-zinc-700 rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full bg-neo-green border-r border-black transition-all duration-1000"
                style={{ width: `${allTimeStats?.successRate || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Insights Grid */}
      <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-7">
        {/* Overview Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md text-black dark:text-white">
          <OverviewChart data={monthlyRevenueChartData} loading={isAnalyticsLoading} />
        </div>

        {/* Recent Sales Activity Table */}
        <div className="lg:col-span-3">
          <Card className="h-full border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-neo-md rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between text-black dark:text-white">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5 border-b-2 border-black dark:border-zinc-700 bg-[#FFFDF5] dark:bg-zinc-900 shrink-0">
              <div>
                <CardTitle className="font-headline font-black text-base sm:text-lg text-black dark:text-white">Transaksi Terakhir</CardTitle>
                <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Aktivitas pembayaran terbaru toko Anda.</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="border-2 border-black dark:border-zinc-700 bg-neo-yellow text-black font-extrabold text-xs shadow-neo-sm hover:shadow-neo rounded-xl h-8 px-3">
                <Link href="/transactions" className="flex items-center gap-1">
                  Semua <ChevronRight className="h-3.5 w-3.5 stroke-[3]" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {isRecentSalesLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-xl bg-black/10 dark:bg-zinc-800" />
                  ))}
                </div>
              ) : (
                <div className="w-full flex-1 flex flex-col">
                  {recentSales && recentSales.length > 0 ? (
                    <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <Table className="w-full table-auto">
                        <TableHeader className="bg-neo-cream dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700">
                          <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="py-2.5 px-3 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Transaction ID</TableHead>
                            <TableHead className="py-2.5 px-2 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Status</TableHead>
                            <TableHead className="py-2.5 px-3 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Nominal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentSales.map((sale) => (
                            <TableRow key={sale.id} className="border-b border-black/10 dark:border-zinc-800 last:border-none hover:bg-[#FFFDF5] dark:hover:bg-zinc-800/60 transition-colors">
                              <TableCell className="py-2.5 px-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="h-7 w-7 rounded-lg bg-neo-sky border border-black shadow-neo-sm flex items-center justify-center shrink-0 text-black">
                                    <CreditCard className="h-3.5 w-3.5 stroke-[2.5]" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-headline font-black text-xs text-black dark:text-white truncate max-w-[110px] sm:max-w-[130px] font-mono">
                                      {sale.externalId || sale.id}
                                    </p>
                                    <p className="text-[9px] font-bold text-black/60 dark:text-zinc-400 truncate">
                                      {sale.paymentMethod || 'QRIS'} • {sale.transactionDate ? new Date(sale.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5 px-2">
                                {getStatusBadge(sale.status)}
                              </TableCell>
                              <TableCell className="py-2.5 px-3 text-right">
                                <div className="font-headline font-black text-xs text-black dark:text-white">
                                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(sale.amount)}
                                </div>
                                {(sale.status === 'Success' || sale.status === 'Paid') && (
                                  <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    Net: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(sale.netAmount ?? (sale.amount - (sale.feeAmount || 0)))}
                                    {sale.feeAmount ? ` (Fee: -${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(sale.feeAmount)})` : ''}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="py-12 my-auto text-center text-black/60 dark:text-zinc-400 flex flex-col items-center justify-center gap-2.5 w-full">
                      <div className="p-3.5 bg-neo-yellow border-2 border-black rounded-2xl shadow-neo-sm text-black">
                        <Zap className="h-7 w-7 stroke-[2.5]" />
                      </div>
                      <p className="text-xs sm:text-sm font-headline font-black text-black dark:text-white">Belum ada transaksi terdeteksi</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}