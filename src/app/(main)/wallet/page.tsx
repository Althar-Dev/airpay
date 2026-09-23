'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, ArrowDownLeft, PlusCircle, Wallet, TrendingUp, History, CreditCard, ShieldCheck, Zap, Landmark } from "lucide-react";
import { useCollection, useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BankAccountModal } from "@/components/wallet/bank-account-modal";
import { WithdrawModal } from "@/components/wallet/withdraw-modal";

const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    switch (s) {
        case 'success':
        case 'successful':
        case 'paid':
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

export default function WalletPage() {
    const { user, firestore } = useFirebase();
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    const merchantRef = useMemoFirebase(() => user ? doc(firestore, 'merchants', user.uid) : null, [user, firestore]);
    const { data: merchantData } = useDoc(merchantRef);

    const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
    const { data: settingsData } = useDoc(settingsRef);

    const bankFeeVal = settingsData?.bankFee ?? 3500;
    const ewalletFeeVal = settingsData?.ewalletFee ?? 2000;

    const transactionsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'merchants', user.uid, 'transactions'), orderBy('transactionDate', 'desc'));
    }, [user, firestore]);

    const { data: walletHistory, isLoading } = useCollection(transactionsQuery);

    const stats = useMemo(() => {
        if (!walletHistory) return { balance: 0, todayRevenue: 0, successCount: 0 };
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return walletHistory.reduce((acc, tx: any) => {
            if (tx.status === 'Success' || tx.status === 'Successful' || tx.status === 'Paid') {
                const netAmount = typeof tx.netAmount === 'number'
                    ? tx.netAmount
                    : (tx.amount < 0 ? tx.amount : Math.max(0, (tx.amount || tx.total_amount || 0) - (tx.feeAmount || 0)));

                if (tx.amount < 0) {
                    acc.balance += tx.amount; // Penarikan saldo mengurangi balance
                } else {
                    acc.balance += netAmount;
                    acc.successCount += 1;
                    if (new Date(tx.transactionDate) >= startOfToday) {
                        acc.todayRevenue += netAmount;
                    }
                }
            }
            return acc;
        }, { balance: 0, todayRevenue: 0, successCount: 0 });
    }, [walletHistory]);

    // Firestore merchant.balance fallback
    const displayBalance = merchantData?.balance !== undefined ? merchantData.balance : stats.balance;

    const formatIDR = (amount: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);

    return (
        <div className="w-full space-y-6 md:space-y-8 pb-32">
            {/* Top Section: Balance Card & Action Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

                {/* Main Balance Card (Neo Brutalism Yellow) */}
                <div className="lg:col-span-7 xl:col-span-8 flex">
                    <div className="relative overflow-hidden w-full rounded-2xl sm:rounded-3xl bg-neo-yellow border-2 sm:border-3 border-black p-5 sm:p-8 shadow-neo-md text-black flex flex-col justify-between gap-6">
                        {/* Top Badge Row */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-1 bg-white border-2 border-black px-2.5 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
                                    <Zap className="w-3 h-3 text-black stroke-[3]" /> SALDO MERCHANT TERSEDIA
                                </div>
                                {isLoading ? (
                                    <Skeleton className="h-10 w-48 bg-black/10 rounded-xl" />
                                ) : (
                                    <h2 className="font-headline text-3xl sm:text-5xl font-black tracking-tight text-black pt-1">
                                        {formatIDR(displayBalance)}
                                    </h2>
                                )}
                            </div>
                            <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-neo-sm text-black hidden sm:block">
                                <Wallet className="h-6 w-6 stroke-[2.5]" />
                            </div>
                        </div>

                        {/* Bottom Stats Breakdown Cards */}
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-black">
                            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-3 rounded-xl shadow-neo-sm space-y-0.5 text-black dark:text-white">
                                <p className="text-[10px] font-black uppercase tracking-wider text-black/70 dark:text-zinc-300">Pendapatan Hari Ini (Net)</p>
                                <p className="font-headline font-black text-sm sm:text-lg text-black dark:text-white">{formatIDR(stats.todayRevenue)}</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-3 rounded-xl shadow-neo-sm space-y-0.5 text-black dark:text-white">
                                <p className="text-[10px] font-black uppercase tracking-wider text-black/70 dark:text-zinc-300">Transaksi Berhasil</p>
                                <p className="font-headline font-black text-sm sm:text-lg text-emerald-600 dark:text-emerald-400">{stats.successCount} Transaksi</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Sidebar */}
                <div className="lg:col-span-5 xl:col-span-4 flex">
                    <Card className="w-full rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md bg-white dark:bg-zinc-900 text-black dark:text-white p-4 sm:p-6 flex flex-col justify-between space-y-4 transition-colors">
                        <CardHeader className="p-0 space-y-1">
                            <div className="inline-flex items-center gap-1.5 bg-neo-mint text-black border-2 border-black px-2.5 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase">
                                <TrendingUp className="h-3.5 w-3.5 text-black stroke-[3]" /> KEUANGAN
                            </div>
                            <CardTitle className="text-base sm:text-lg font-headline font-black text-black dark:text-white">
                                Kelola Saldo & Payout
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-0 space-y-2.5">
                            <Button
                                onClick={() => setIsWithdrawModalOpen(true)}
                                className="w-full h-11 sm:h-12 rounded-xl font-headline font-black bg-neo-yellow-bold hover:bg-yellow-400 text-black border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-sm hover:shadow-neo transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                            >
                                <PlusCircle className="h-4 w-4 stroke-[3]" />
                                Tarik Saldo Ke Rekening
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsBankModalOpen(true)}
                                className="w-full h-11 sm:h-12 rounded-xl font-headline font-black border-2 sm:border-3 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-sky dark:hover:bg-zinc-700 text-black dark:text-white shadow-neo-sm transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                            >
                                <Landmark className="h-4 w-4 stroke-[2.5]" />
                                {merchantData?.bankName ? `Rekening: ${merchantData.bankName}` : 'Atur Rekening Bank / E-Wallet'}
                            </Button>
                        </CardContent>

                        <CardFooter className="p-0 pt-2 border-t-2 border-black/10 dark:border-zinc-800">
                            <p className="text-[10px] text-center w-full text-black/70 dark:text-zinc-400 font-extrabold flex items-center justify-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-zinc-400" /> Bank Fee: {formatIDR(bankFeeVal)} • E-Wallet Fee: {formatIDR(ewalletFeeVal)}
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Transactions History Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-headline font-black text-lg sm:text-xl text-black dark:text-white flex items-center gap-2">
                        <div className="p-1.5 bg-neo-yellow border-2 border-black rounded-lg shadow-neo-sm text-black">
                            <History className="h-4 w-4 stroke-[3]" />
                        </div>
                        Riwayat Aktivitas Saldo (Net)
                    </h3>
                </div>

                <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-4 space-y-3">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl bg-black/10 dark:bg-zinc-800" />)}
                            </div>
                        ) : (
                            <>
                                {/* Desktop View (Table) */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader className="bg-neo-cream dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="py-3 px-6 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Tanggal</TableHead>
                                                <TableHead className="py-3 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Aktivitas Metode</TableHead>
                                                <TableHead className="py-3 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Nominal Bersih (Net)</TableHead>
                                                <TableHead className="py-3 text-center font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {walletHistory?.map((item: any) => {
                                                const isSuccess = item.status === 'Success' || item.status === 'Successful' || item.status === 'Paid';
                                                const isWithdrawal = item.type === 'WITHDRAWAL' || item.amount < 0;
                                                const grossAmt = Math.abs(item.amount || item.total_amount || 0);
                                                const feeVal = item.feeAmount ?? (isWithdrawal ? (item.payoutFee || 3500) : Math.round(grossAmt * 0.007));
                                                const netAmt = isWithdrawal ? item.amount : (typeof item.netAmount === 'number' ? item.netAmount : Math.max(0, grossAmt - feeVal));

                                                return (
                                                    <TableRow key={item.id} className="border-b-2 border-black/10 dark:border-zinc-800 last:border-none hover:bg-[#FFFDF5] dark:hover:bg-zinc-800/60 transition-colors">
                                                        <TableCell className="py-3.5 px-6 font-extrabold text-xs text-black/80 dark:text-zinc-300">
                                                            {item.transactionDate ? new Date(item.transactionDate).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            }) : '-'}
                                                        </TableCell>
                                                        <TableCell className="py-3.5 font-headline font-black text-xs text-black dark:text-white">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "p-1.5 rounded-lg border-2 border-black shadow-neo-sm",
                                                                    netAmt > 0 ? "bg-neo-green text-black" : "bg-neo-coral text-white"
                                                                )}>
                                                                    {netAmt > 0 ? <ArrowDownLeft className="h-3.5 w-3.5 stroke-[3]" /> : <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" />}
                                                                </div>
                                                                <span className="capitalize text-black dark:text-white">{item.paymentMethod || (item.customer ? `Pembayaran: ${item.customer}` : 'Transaksi QRIS')}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-3.5 text-right">
                                                            <div className={cn(
                                                                "font-headline font-black text-sm",
                                                                netAmt > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                                            )}>
                                                                {netAmt > 0 ? '+' : ''}{formatIDR(netAmt)}
                                                            </div>
                                                            {isSuccess && !isWithdrawal && feeVal > 0 && (
                                                                <div className="text-[10px] font-bold text-black/50 dark:text-zinc-400">
                                                                    Bruto: {formatIDR(grossAmt)} (Fee: -{formatIDR(feeVal)})
                                                                </div>
                                                            )}
                                                            {isWithdrawal && (
                                                                <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                                                    Biaya Payout: -{formatIDR(feeVal)}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-3.5 text-center">
                                                            {getStatusBadge(item.status)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile View (Neo Brutalism Cards) */}
                                <div className="md:hidden p-3 space-y-3 bg-[#FFFDF5] dark:bg-zinc-950">
                                    {walletHistory?.map((item: any) => {
                                        const isSuccess = item.status === 'Success' || item.status === 'Successful' || item.status === 'Paid';
                                        const isWithdrawal = item.type === 'WITHDRAWAL' || item.amount < 0;
                                        const grossAmt = Math.abs(item.amount || item.total_amount || 0);
                                        const feeVal = item.feeAmount ?? (isWithdrawal ? (item.payoutFee || 3500) : Math.round(grossAmt * 0.007));
                                        const netAmt = isWithdrawal ? item.amount : (typeof item.netAmount === 'number' ? item.netAmount : Math.max(0, grossAmt - feeVal));

                                        return (
                                            <div key={item.id} className="p-3.5 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl shadow-neo-sm flex items-center justify-between gap-3 text-black dark:text-white">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={cn(
                                                        "h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border-2 border-black shadow-neo-sm",
                                                        netAmt > 0 ? "bg-neo-green text-black" : "bg-neo-coral text-white"
                                                    )}>
                                                        {netAmt > 0 ? <ArrowDownLeft className="h-4 w-4 stroke-[3]" /> : <ArrowUpRight className="h-4 w-4 stroke-[3]" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-headline font-black text-xs text-black dark:text-white truncate capitalize">
                                                            {item.paymentMethod || (item.customer ? item.customer : 'Transaksi QRIS')}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400">
                                                            {item.transactionDate ? new Date(item.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className={cn(
                                                        "font-headline font-black text-xs",
                                                        netAmt > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                                    )}>
                                                        {netAmt > 0 ? '+' : ''}{formatIDR(netAmt)}
                                                    </p>
                                                    {isSuccess && !isWithdrawal && feeVal > 0 && (
                                                        <p className="text-[9px] font-extrabold text-black/50 dark:text-zinc-400">
                                                            Gross: {formatIDR(grossAmt)}
                                                        </p>
                                                    )}
                                                    <div className="mt-1">
                                                        {getStatusBadge(item.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {(!walletHistory || walletHistory.length === 0) && (
                                    <div className="py-12 text-center flex flex-col items-center gap-2 bg-[#FFFDF5] dark:bg-zinc-900 text-black dark:text-white">
                                        <div className="p-3 bg-neo-yellow border-2 border-black rounded-2xl shadow-neo-sm text-black">
                                            <History className="h-6 w-6 stroke-[2.5]" />
                                        </div>
                                        <div>
                                            <p className="font-headline font-black text-xs text-black dark:text-white">Belum Ada Riwayat Transaksi</p>
                                            <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400">Aktivitas pembayaran Anda akan muncul otomatis di sini.</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modals */}
            <BankAccountModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} />
            <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} onOpenBankModal={() => setIsBankModalOpen(true)} />
        </div>
    );
}