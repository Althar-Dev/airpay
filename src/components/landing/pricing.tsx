'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Calculator, ArrowRight, Flame, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function Pricing() {
    const { firestore } = useFirebase();
    const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
    const { data: settings } = useDoc<{ mdrFee?: number }>(settingsRef);

    const currentMdr = settings?.mdrFee ?? 0.7;
    const [amount, setAmount] = useState<number>(500000);

    const mdrFeeValue = Math.round(amount * (currentMdr / 100));
    const netReceived = amount - mdrFeeValue;

    return (
        <section id="pricing" className="relative w-full min-h-screen flex flex-col justify-center items-center bg-[#FFFDF5] dark:bg-[#0c0c0e] text-black dark:text-zinc-100 py-12 sm:py-16 transition-colors">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
                    <div className="inline-flex items-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-3 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-neo-sm">
                        <ShieldCheck className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        TRANSPARAN & TANPA BIAYA TERSEMBUNYI
                    </div>
                    <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-black dark:text-white leading-tight">
                        Hitung Potongan <br />
                        <span className="bg-neo-coral text-white px-2.5 sm:px-3 py-0.5 border-2 sm:border-4 border-black shadow-neo rounded-xl inline-block mt-0.5 -rotate-1">
                            MDR Hanya {currentMdr}%
                        </span>
                    </h2>
                    <p className="text-xs sm:text-sm text-black/80 dark:text-zinc-300 font-bold max-w-lg mx-auto leading-relaxed">
                        Gunakan kalkulator interaktif di bawah ini untuk melihat transparansi biaya transaksi usaha Anda.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                    {/* Left Column: Interactive MDR Calculator Widget */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-6 bg-neo-yellow border-2 sm:border-4 border-black p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md sm:shadow-neo-lg flex flex-col justify-between"
                    >
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 sm:border-b-4 border-black pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-white border-2 border-black rounded-xl shadow-neo-sm">
                                        <Calculator className="w-4 h-4 text-black stroke-[3]" />
                                    </div>
                                    <span className="font-headline font-black text-base sm:text-lg text-black">Simulasi MDR Air</span>
                                </div>
                                <span className="bg-white border-2 border-black px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black shadow-neo-sm">
                                    Standar QRIS {currentMdr}%
                                </span>
                            </div>

                            {/* Slider Input */}
                            <div className="space-y-2.5 bg-white border-2 sm:border-4 border-black p-3 sm:p-4 rounded-xl shadow-neo-sm">
                                <div className="flex flex-wrap justify-between items-center gap-1 text-xs sm:text-sm font-black">
                                    <span>Nominal Transaksi:</span>
                                    <span className="text-sm sm:text-base font-headline font-black bg-neo-mint border-2 border-black px-2.5 py-0.5 rounded-lg shadow-neo-sm">
                                        Rp {amount.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <input
                                    type="range"
                                    min={50000}
                                    max={5000000}
                                    step={50000}
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full h-3 bg-neo-cream rounded-lg appearance-none cursor-pointer border-2 border-black accent-black"
                                />

                                <div className="flex justify-between text-[10px] font-black text-black/60 pt-0.5">
                                    <span>Rp 50rb</span>
                                    <span>Rp 2.5 Jt</span>
                                    <span>Rp 5 Jt</span>
                                </div>
                            </div>

                            {/* Breakdown Cards */}
                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
                                <div className="bg-white border-2 sm:border-4 border-black p-3 rounded-xl shadow-neo-sm space-y-0.5">
                                    <span className="text-[10px] sm:text-[11px] font-black text-black/70">Biaya MDR ({currentMdr}%):</span>
                                    <p className="text-base sm:text-lg font-headline font-black text-neo-coral">
                                        Rp {mdrFeeValue.toLocaleString('id-ID')}
                                    </p>
                                </div>

                                <div className="bg-white border-2 sm:border-4 border-black p-3 rounded-xl shadow-neo-sm space-y-0.5">
                                    <span className="text-[10px] sm:text-[11px] font-black text-black/70">Bersih Diterima:</span>
                                    <p className="text-base sm:text-lg font-headline font-black text-emerald-600">
                                        Rp {netReceived.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t-2 sm:border-t-4 border-black flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-black">
                            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-black stroke-[3]" /> Payout Otomatis Langsung Masuk Rekening</span>
                            <span className="bg-white border-2 border-black px-2 py-0.5 rounded-lg shadow-neo-sm">Settlement H+0</span>
                        </div>
                    </motion.div>

                    {/* Right Column: Pricing Plan Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-6 bg-white dark:bg-zinc-900 border-2 sm:border-4 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md sm:shadow-neo-lg space-y-4 relative overflow-hidden flex flex-col justify-between text-black dark:text-white transition-colors"
                    >
                        <div className="space-y-4">
                            {/* Popular Badge */}
                            <div className="self-start inline-flex items-center gap-1 bg-neo-pink text-black border-2 border-black px-2.5 py-0.5 rounded-lg shadow-neo font-black text-[10px] sm:text-xs">
                                <Flame className="w-3.5 h-3.5 text-black stroke-[2.5]" /> Rekomendasi Merchant
                            </div>

                            <div>
                                <span className="bg-neo-violet text-black border-2 border-black px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-neo-sm">
                                    AKUN MERCHANT PRO
                                </span>
                                <h3 className="font-headline font-black text-2xl sm:text-3xl text-black dark:text-white mt-1.5">Rp 0 / Bulan</h3>
                                <p className="text-xs font-bold text-black/70 dark:text-zinc-300">Tanpa biaya berlangganan, cukup bayar per transaksi.</p>
                            </div>

                            <div className="space-y-2 pt-1">
                                {[
                                    `Biaya MDR kompetitif ${currentMdr}%`,
                                    "Pembuatan Kode QRIS Statis & Dinamis",
                                    "Pencairan Dana (Settlement) Otomatis",
                                    "Akses Dasbor & Laporan Real-Time",
                                    "Notifikasi Transaksi Berhasil Instant",
                                    "Dukungan Integrasi API Payment",
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 font-extrabold text-xs text-black dark:text-zinc-100">
                                        <div className="w-4 h-4 bg-neo-green border-2 border-black rounded-md flex items-center justify-center shrink-0 shadow-neo-sm">
                                            <Check className="w-3 h-3 text-black stroke-[3]" />
                                        </div>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Biaya Pencairan / Payout Fee Info */}
                            <div className="p-3 bg-[#FFFDF5] dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm space-y-1 text-xs">
                                <div className="flex justify-between items-center font-headline font-black text-black dark:text-white">
                                    <span>Biaya Pencairan Bank:</span>
                                    <span className="font-mono text-sky-800 dark:text-sky-400">Rp 3.500 / trx</span>
                                </div>
                                <div className="flex justify-between items-center font-headline font-black text-black dark:text-white">
                                    <span>Biaya Pencairan E-Wallet:</span>
                                    <span className="font-mono text-emerald-800 dark:text-emerald-400">Rp 2.000 / trx</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            asChild
                            className="w-full h-11 sm:h-12 text-xs sm:text-sm font-extrabold border-2 sm:border-4 border-black bg-neo-yellow-bold hover:bg-yellow-400 text-black shadow-neo-md hover:shadow-neo-lg transition-all rounded-xl mt-4"
                        >
                            <Link href="/register" className="flex items-center justify-center gap-2">
                                Daftar Merchant Gratis <ArrowRight className="w-4 h-4 stroke-[3]" />
                            </Link>
                        </Button>
                    </motion.div>

                </div>

            </div>
        </section>
    );
}
