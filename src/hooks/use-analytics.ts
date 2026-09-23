'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import { startOfMonth, endOfMonth, format, getMonth, startOfDay, getDay, getHours } from 'date-fns';

function getTxNetAmount(tx: any): number {
    if (typeof tx.netAmount === 'number') return tx.netAmount;
    const amount = tx.amount || tx.total_amount || 0;
    const fee = tx.feeAmount || 0;
    return Math.max(0, amount - fee);
}

export function useAnalytics() {
    const { user, firestore } = useFirebase();

    const transactionsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'merchants', user.uid, 'transactions'), orderBy('transactionDate', 'desc'));
    }, [user, firestore]);

    const { data: transactions, isLoading } = useCollection(transactionsQuery);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const allTimeStats = useMemo(() => {
        if (!transactions) return null;

        let totalRevenue = 0;
        let totalTransactions = 0;
        let successfulTransactions = 0;
        const uniqueCustomers = new Set<string>();
        const revenueByStatus: {[key: string]: number} = { Success: 0, Pending: 0, Expired: 0 };

        transactions.forEach(tx => {
            totalTransactions++;
            if (tx.email) uniqueCustomers.add(tx.email);
            
            const status = tx.status || 'Unknown';
            const net = getTxNetAmount(tx);

            if (status in revenueByStatus) {
                revenueByStatus[status] += net;
            } else {
                revenueByStatus[status] = net;
            }

            if (tx.status === 'Success') {
                totalRevenue += net;
                successfulTransactions++;
            }
        });
        
        return {
            totalRevenue,
            totalTransactions,
            successfulTransactions,
            revenueByStatus,
            totalUniqueCustomers: uniqueCustomers.size,
            avgTransactionValue: successfulTransactions > 0 ? totalRevenue / successfulTransactions : 0,
            successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0,
        };
    }, [transactions]);


    const monthlyStats = useMemo(() => {
        if (!transactions) return null;

        const now = new Date();
        const startOfThisMonth = startOfMonth(now);
        const startOfLastMonth = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        const endOfLastMonth = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));

        let revenueThisMonth = 0;
        let revenueLastMonth = 0;
        let transactionsThisMonth = 0;
        let transactionsLastMonth = 0;
        const newCustomersThisMonth = new Set<string>();

        transactions.forEach(tx => {
            const txDate = new Date(tx.transactionDate);

            if (txDate >= startOfThisMonth) {
                transactionsThisMonth++;
            }
            if (txDate >= startOfLastMonth && txDate <= endOfLastMonth) {
                transactionsLastMonth++;
            }

            if (tx.status !== 'Success') return;

            const net = getTxNetAmount(tx);

            if (txDate >= startOfThisMonth) {
                revenueThisMonth += net;
                if (tx.email) newCustomersThisMonth.add(tx.email);
            }
            if (txDate >= startOfLastMonth && txDate <= endOfLastMonth) {
                revenueLastMonth += net;
            }
        });

        const revenuePercentageChange = revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : revenueThisMonth > 0 ? 100 : 0;
        const transactionPercentageChange = transactionsLastMonth > 0 ? ((transactionsThisMonth - transactionsLastMonth) / transactionsLastMonth) * 100 : transactionsThisMonth > 0 ? 100 : 0;
        const newCustomerCount = newCustomersThisMonth.size;

        return { revenueThisMonth, revenueLastMonth, revenuePercentageChange, newCustomerCount, transactionPercentageChange, transactionsThisMonth, transactionsLastMonth };
    }, [transactions]);

    
    const todayStats = useMemo(() => {
        if (!transactions) return null;
        
        const now = new Date();
        const startOfToday = startOfDay(new Date());
        const startOfYesterday = startOfDay(new Date(now.setDate(now.getDate() - 1)));
        
        let revenueToday = 0;
        let revenueYesterday = 0;

        transactions.forEach(tx => {
            if (tx.status !== 'Success') return;
            const txDate = new Date(tx.transactionDate);
            const net = getTxNetAmount(tx);

            if (txDate >= startOfToday) {
                revenueToday += net;
            }
            if (txDate >= startOfYesterday && txDate < startOfToday) {
                revenueYesterday += net;
            }
        });
        const revenueTodayPercentageChange = revenueYesterday > 0 ? ((revenueToday - revenueYesterday) / revenueYesterday) * 100 : revenueToday > 0 ? 100 : 0;

        return { revenueToday, revenueTodayPercentageChange };
    }, [transactions]);


    const monthlyRevenueChartData = useMemo(() => {
        const data = Array.from({ length: 12 }, (_, i) => ({
            month: format(new Date(0, i), 'MMM'),
            revenue: 0,
        }));
        if (!transactions) return data;
        transactions.forEach(tx => {
            if (tx.status === 'Success') {
                const monthIndex = getMonth(new Date(tx.transactionDate));
                data[monthIndex].revenue += getTxNetAmount(tx);
            }
        });
        return data;
    }, [transactions]);

    const monthlyTransactionChartData = useMemo(() => {
        const data = Array.from({ length: 12 }, (_, i) => ({
            month: format(new Date(0, i), 'MMM'),
            transactions: 0,
        }));
        if (!transactions) return data;
        transactions.forEach(tx => {
            const monthIndex = getMonth(new Date(tx.transactionDate));
            data[monthIndex].transactions++;
        });
        return data;
    }, [transactions]);
    
    const salesByDayChartData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = days.map(day => ({ day, sales: 0, transactions: 0 }));

        if (!transactions) return data;

        transactions.forEach(tx => {
            const dayIndex = getDay(new Date(tx.transactionDate));
            data[dayIndex].transactions++;
            if (tx.status === 'Success') {
                data[dayIndex].sales += getTxNetAmount(tx);
            }
        });
        return data;
    }, [transactions]);

    const salesByHourChartData = useMemo(() => {
        const data = Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2, '0')}:00`, sales: 0 }));

        if (!transactions) return data;

        transactions.forEach(tx => {
            if (tx.status === 'Success') {
                const hourIndex = getHours(new Date(tx.transactionDate));
                data[hourIndex].sales += getTxNetAmount(tx);
            }
        });
        return data.slice(6, 23);
    }, [transactions]);


    return {
        transactions,
        isLoading,
        allTimeStats,
        monthlyStats,
        todayStats,
        monthlyRevenueChartData,
        monthlyTransactionChartData,
        salesByDayChartData,
        salesByHourChartData,
        formatCurrency
    };
}