'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CreditCard, ShieldCheck, Activity, Globe, Zap, Database, Server, DollarSign, ArrowRightLeft, TrendingUp, Store } from "lucide-react";
import { useCollection, useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { startOfMonth } from 'date-fns';

export default function AdminDashboardPage() {
  const { firestore } = useFirebase();

  // 1. Fetch all merchants collection (Direct & Safe)
  const merchantsQuery = useMemoFirebase(() => collection(firestore, 'merchants'), [firestore]);
  const { data: merchants, isLoading: isMerchantsLoading } = useCollection(merchantsQuery);

  // 2. Fetch all system settings
  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settingsData } = useDoc(settingsRef);

  // Formatters
  const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);

  // Computed Real Platform Revenue & Merchant Analytics from Merchants Collection
  const platformAnalytics = useMemo(() => {
    const mdrFeeSetting = settingsData?.mdrFee ?? 0.7;

    if (!merchants) {
      return {
        totalFeeAllTime: 0,
        totalGrossVolume: 0,
        totalNetMerchant: 0,
        totalMerchantsCount: 0,
        mdrRate: mdrFeeSetting
      };
    }

    let totalGrossVolume = 0;
    let totalNetMerchant = 0;

    merchants.forEach((m: any) => {
      totalGrossVolume += m.totalRevenue || 0;
      totalNetMerchant += m.balance || 0;
    });

    // Total Fee Admin Platform = Total Gross Volume * (MDR % / 100)
    const totalFeeAllTime = Math.round(totalGrossVolume * (mdrFeeSetting / 100));

    return {
      totalFeeAllTime,
      totalGrossVolume,
      totalNetMerchant,
      totalMerchantsCount: merchants.length,
      mdrRate: mdrFeeSetting
    };
  }, [merchants, settingsData]);

  // Merchant Registration Growth (This Month)
  const merchantGrowth = useMemo(() => {
    if (!merchants) return 0;
    const now = new Date();
    const startOfThisMonth = startOfMonth(now);

    return merchants.filter((m: any) => {
      const reg = m.createdAt || m.registrationDate;
      if (!reg) return false;
      return new Date(reg) >= startOfThisMonth;
    }).length;
  }, [merchants]);

  // Payment Channels Active Status
  const paymentsConfig = settingsData?.payments || {};
  const isOrderkuotaActive = !!(paymentsConfig.orderkuota?.username && paymentsConfig.orderkuota?.token);
  const isGoPayActive = !!(paymentsConfig.gopay?.accessToken && paymentsConfig.gopay?.merchantId);
  const isShopeePayActive = !!(paymentsConfig.shopeepay?.token);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-32">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 sm:border-3 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md text-black dark:text-white transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-coral text-white border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-white stroke-[3]" /> SYSTEM CONTROL CENTER
          </div>
          <h1 className="font-headline font-black text-xl sm:text-3xl text-black dark:text-white tracking-tight">
            Admin Overview & Platform Analytics
          </h1>
          <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
            Pantau performa pendapatan MDR admin real, total omset kotor platform, dan status merchant.
          </p>
        </div>
      </div>

      {/* Real Quick System Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Real Platform Revenue (MDR Fee Admin) */}
        <Card className="relative overflow-hidden border-2 sm:border-3 border-black dark:border-zinc-700 bg-[#F3E8FF] dark:bg-purple-950/60 shadow-neo-md hover:shadow-neo-lg hover:-translate-y-0.5 transition-all rounded-2xl sm:rounded-3xl p-1 text-black dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-headline font-black text-black dark:text-white">Pendapatan Platform (MDR)</CardTitle>
            <div className="p-2 bg-neo-purple border-2 border-black rounded-xl shadow-neo-sm text-black">
              <DollarSign className="h-4.5 w-4.5 stroke-[3]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isMerchantsLoading ? (
              <Skeleton className="h-8 w-28 bg-black/10 dark:bg-zinc-800 rounded-xl" />
            ) : (
              <div className="text-xl sm:text-2xl font-headline font-black text-purple-950 dark:text-purple-200">
                {formatIDR(platformAnalytics.totalFeeAllTime)}
              </div>
            )}
            <p className="text-xs font-extrabold text-black/70 dark:text-zinc-300 mt-1.5">
              MDR Fee ({platformAnalytics.mdrRate}%) Terakumulasi
            </p>
          </CardContent>
        </Card>

        {/* Total Platform Gross Volume (GMV) */}
        <Card className="relative overflow-hidden border-2 sm:border-3 border-black dark:border-zinc-700 bg-[#E6FAF0] dark:bg-emerald-950/60 shadow-neo-md hover:shadow-neo-lg hover:-translate-y-0.5 transition-all rounded-2xl sm:rounded-3xl p-1 text-black dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-headline font-black text-black dark:text-white">Gross Volume (GMV)</CardTitle>
            <div className="p-2 bg-neo-green border-2 border-black rounded-xl shadow-neo-sm text-black">
              <TrendingUp className="h-4.5 w-4.5 stroke-[3]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isMerchantsLoading ? (
              <Skeleton className="h-8 w-28 bg-black/10 dark:bg-zinc-800 rounded-xl" />
            ) : (
              <div className="text-xl sm:text-2xl font-headline font-black text-emerald-950 dark:text-emerald-200">
                {formatIDR(platformAnalytics.totalGrossVolume)}
              </div>
            )}
            <p className="text-xs font-extrabold text-black/70 dark:text-zinc-300 mt-1.5">
              Total omset kotor berputar
            </p>
          </CardContent>
        </Card>

        {/* Total Merchant Net Earnings */}
        <Card className="relative overflow-hidden border-2 sm:border-3 border-black dark:border-zinc-700 bg-[#E6F4FE] dark:bg-sky-950/60 shadow-neo-md hover:shadow-neo-lg hover:-translate-y-0.5 transition-all rounded-2xl sm:rounded-3xl p-1 text-black dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-headline font-black text-black dark:text-white">Total Saldo Merchant</CardTitle>
            <div className="p-2 bg-neo-sky border-2 border-black rounded-xl shadow-neo-sm text-black">
              <CreditCard className="h-4.5 w-4.5 stroke-[3]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isMerchantsLoading ? (
              <Skeleton className="h-8 w-28 bg-black/10 dark:bg-zinc-800 rounded-xl" />
            ) : (
              <div className="text-xl sm:text-2xl font-headline font-black text-sky-950 dark:text-sky-200">
                {formatIDR(platformAnalytics.totalNetMerchant)}
              </div>
            )}
            <p className="text-xs font-extrabold text-black/70 dark:text-zinc-300 mt-1.5">
              Saldo bersih di dompet merchant
            </p>
          </CardContent>
        </Card>

        {/* Total Merchants */}
        <Card className="relative overflow-hidden border-2 sm:border-3 border-black dark:border-zinc-700 bg-[#FFF9E6] dark:bg-amber-950/60 shadow-neo-md hover:shadow-neo-lg hover:-translate-y-0.5 transition-all rounded-2xl sm:rounded-3xl p-1 text-black dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-headline font-black text-black dark:text-white">Total Merchant</CardTitle>
            <div className="p-2 bg-neo-yellow border-2 border-black rounded-xl shadow-neo-sm text-black">
              <Users className="h-4.5 w-4.5 stroke-[3]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isMerchantsLoading ? (
              <Skeleton className="h-8 w-20 bg-black/10 dark:bg-zinc-800 rounded-xl" />
            ) : (
              <div className="text-xl sm:text-2xl font-headline font-black text-black dark:text-white">
                {merchants?.length || 0} Merchant
              </div>
            )}
            <div className="flex items-center gap-1 mt-1.5 text-xs font-extrabold text-black dark:text-white">
              <span className="bg-neo-green text-black px-1.5 py-0.2 border border-black rounded font-black text-[10px]">
                +{merchantGrowth} merchant
              </span> bulan ini
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main System Health & Payment Channels Status */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* System Health Breakdown */}
        <Card className="lg:col-span-8 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
          <CardHeader className="bg-[#FFFDF5] dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700 p-4 sm:p-5">
            <CardTitle className="font-headline font-black text-base sm:text-lg text-black dark:text-white">Status Real-Time Infrastruktur Platform</CardTitle>
            <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Pemantauan integrasi mutasi dan infrastruktur AirPay secara langsung.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y-2 divide-black/10 dark:divide-zinc-800">

              <div className="flex items-center justify-between p-4 hover:bg-[#FFFDF5] dark:hover:bg-zinc-800/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-neo-yellow border-2 border-black shadow-neo-sm flex items-center justify-center text-black shrink-0">
                    <Zap className="h-4.5 w-4.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="font-headline font-black text-xs sm:text-sm text-black dark:text-white">Orderkuota Payment Gateway</p>
                    <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400">Mutasi QRIS Orderkuota Integration</p>
                  </div>
                </div>
                {isOrderkuotaActive ? (
                  <span className="bg-neo-green text-black border-2 border-black shadow-neo-sm text-[10px] font-headline font-black px-2.5 py-0.5 rounded-lg">Terhubung & Aktif ⚡</span>
                ) : (
                  <span className="bg-neo-coral text-white border-2 border-black shadow-neo-sm text-[10px] font-headline font-black px-2.5 py-0.5 rounded-lg">Belum Dikonfigurasi</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-[#FFFDF5] dark:hover:bg-zinc-800/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-neo-mint border-2 border-black shadow-neo-sm flex items-center justify-center text-black shrink-0">
                    <Server className="h-4.5 w-4.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="font-headline font-black text-xs sm:text-sm text-black dark:text-white">GoPay / GoBiz Gateway</p>
                    <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400">Mutasi QRIS GoBiz Integration</p>
                  </div>
                </div>
                {isGoPayActive ? (
                  <span className="bg-neo-green text-black border-2 border-black shadow-neo-sm text-[10px] font-headline font-black px-2.5 py-0.5 rounded-lg">Terhubung & Aktif ⚡</span>
                ) : (
                  <span className="bg-neo-coral text-white border-2 border-black shadow-neo-sm text-[10px] font-headline font-black px-2.5 py-0.5 rounded-lg">Belum Dikonfigurasi</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-[#FFFDF5] dark:hover:bg-zinc-800/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-neo-coral text-white border-2 border-black shadow-neo-sm flex items-center justify-center shrink-0">
                    <CreditCard className="h-4.5 w-4.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="font-headline font-black text-xs sm:text-sm text-black dark:text-white">ShopeePay Merchant Gateway</p>
                    <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400">Mutasi QRIS ShopeePay Bridge API</p>
                  </div>
                </div>
                {isShopeePayActive ? (
                  <span className="bg-neo-green text-black border-2 border-black shadow-neo-sm text-[10px] font-headline font-black px-2.5 py-0.5 rounded-lg">Terhubung & Aktif ⚡</span>
                ) : (
                  <span className="bg-neo-coral text-white border-2 border-black shadow-neo-sm text-[10px] font-headline font-black px-2.5 py-0.5 rounded-lg">Belum Dikonfigurasi</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Status Card */}
        <Card className="lg:col-span-4 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md bg-neo-yellow text-black flex flex-col justify-between p-4 sm:p-6 space-y-4">
          <CardHeader className="p-0 space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-white border-2 border-black shadow-neo-sm flex items-center justify-center text-black">
              <Globe className="h-5 w-5 stroke-[2.5]" />
            </div>
            <CardTitle className="text-base sm:text-lg font-headline font-black text-black">Ringkasan Konfigurasi Admin</CardTitle>
            <CardDescription className="text-black/70 text-xs font-bold">Pengaturan MDR Fee dan Maintenance sistem.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-black">
            <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-neo-sm space-y-1">
              <p className="text-[10px] font-headline font-black uppercase tracking-wider text-black/70">MDR Admin Percentage</p>
              <p className="text-lg font-headline font-black text-black">
                {platformAnalytics.mdrRate}% <span className="text-xs font-bold text-black/60">(Default Admin)</span>
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-neo-sm space-y-1">
              <p className="text-[10px] font-headline font-black uppercase tracking-wider text-black/70">Maintenance Mode</p>
              <p className="text-sm font-headline font-black text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black" /> Nonaktif (Normal)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Rincian Real Kontribusi Pendapatan Admin per Merchant */}
      <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
        <CardHeader className="bg-[#FFFDF5] dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700 p-4 sm:p-5 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline font-black text-base sm:text-lg text-black dark:text-white">Performa & Kontribusi Pendapatan Admin per Merchant (Real)</CardTitle>
            <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Rincian pendapatan MDR Fee admin dari masing-masing akun merchant terdaftar.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isMerchantsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl bg-black/10 dark:bg-zinc-800" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-neo-cream dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-3 px-6 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Nama Merchant / Email</TableHead>
                    <TableHead className="py-3 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Gross Omset (GMV)</TableHead>
                    <TableHead className="py-3 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Saldo Net Merchant</TableHead>
                    <TableHead className="py-3 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Estimasi Fee MDR Admin ({platformAnalytics.mdrRate}%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchants?.map((m: any) => {
                    const gross = m.totalRevenue || 0;
                    const net = m.balance || 0;
                    const estFee = Math.round(gross * (platformAnalytics.mdrRate / 100));

                    return (
                      <TableRow key={m.id} className="border-b-2 border-black/10 dark:border-zinc-800 last:border-none hover:bg-[#FFFDF5] dark:hover:bg-zinc-800/60 transition-colors">
                        <TableCell className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-neo-sky border-2 border-black shadow-neo-sm flex items-center justify-center shrink-0 text-black">
                              <Store className="h-4 w-4 stroke-[2.5]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-headline font-black text-xs text-black dark:text-white truncate">{m.name || m.businessName || 'Merchant'}</p>
                              <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400 truncate">{m.email || '-'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 text-right font-bold text-xs text-black dark:text-white">
                          {formatIDR(gross)}
                        </TableCell>
                        <TableCell className="py-3.5 text-right font-bold text-xs text-sky-800 dark:text-sky-400">
                          {formatIDR(net)}
                        </TableCell>
                        <TableCell className="py-3.5 text-right font-headline font-black text-xs">
                          <span className="inline-block bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800 px-2 py-0.5 rounded-md font-mono">
                            +{formatIDR(estFee)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!merchants || merchants.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-xs font-bold text-black/60 dark:text-zinc-400">
                        Belum ada merchant terdaftar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
