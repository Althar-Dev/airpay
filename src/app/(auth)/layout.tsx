'use client';

import { FirebaseClientProvider } from "@/firebase";
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseClientProvider>
      <div className="flex h-screen h-[100dvh] w-full bg-[#FFFDF5] dark:bg-[#0c0c0e] text-black dark:text-zinc-100 overflow-hidden selection:bg-neo-yellow selection:text-black transition-colors">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Sisi Kiri: Area Formulir Auth Neo-Brutalist */}
        <main className="flex-1 h-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FFFDF5] dark:bg-[#0c0c0e] overflow-y-auto z-10">
          <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-zinc-900 border-2 sm:border-3 border-black dark:border-zinc-700 p-4 sm:p-7 rounded-2xl sm:rounded-3xl shadow-neo-md sm:shadow-neo-lg dark:shadow-[6px_6px_0px_0px_#27272a] relative my-auto">
            {/* Top Corner Floating Badge (Desktop) */}
            <div className="absolute -top-3.5 right-6 bg-neo-yellow text-black border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm font-black text-[10px] uppercase tracking-wider hidden sm:block">
              ⚡ Secure Merchant Portal
            </div>

            {children}
          </div>

          <p className="mt-3 text-[10px] sm:text-[11px] font-bold text-black/70 dark:text-zinc-400 text-center flex items-center justify-center gap-1.5 shrink-0">
            <Lock className="w-3 h-3 text-black dark:text-zinc-400 shrink-0 stroke-[2.5]" /> Terdaftar & Diawasi Regulasi Keuangan Nasional
          </p>
        </main>

        {/* Sisi Kanan: Neo-Brutalist Showcase Panel (Desktop Only) */}
        <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] h-full relative overflow-hidden bg-neo-yellow border-l-3 border-black shrink-0 flex-col justify-between p-8 xl:p-12 z-10">
          {/* Top Row: Brand & Status */}
          <div className="flex items-center justify-between z-10">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo imgClassName="w-12 h-12 sm:w-14 sm:h-14 group-hover:scale-105 transition-transform" hideText />
              <span className="font-headline font-black text-2xl tracking-tight text-black">
                Air<span className="bg-white px-2 py-0.5 border-2 border-black shadow-neo-sm rounded-lg ml-0.5">Pay</span>
              </span>
            </Link>

            <div className="flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1 rounded-full shadow-neo-sm text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black" />
              Operational 99.98%
            </div>
          </div>

          {/* Center Showcase Hero */}
          <div className="space-y-6 my-auto z-10 max-w-md">
            <div className="inline-block bg-neo-coral text-white border-2 border-black px-3 py-1 rounded-xl shadow-neo font-black text-xs rotate-[-2deg]">
              🚀 Merchant Growth Engine
            </div>

            <h2 className="font-headline text-3xl xl:text-4xl font-black text-black leading-tight">
              Kelola Bisnis & <br />
              <span className="bg-white px-3 py-1 border-3 border-black shadow-neo rounded-xl inline-block mt-1 rotate-1">
                Terima QRIS
              </span> <br />
              Tanpa Ribet!
            </h2>

            <p className="text-sm font-extrabold text-black/85 leading-relaxed">
              Bergabunglah dengan 10.000+ merchant modern di seluruh Indonesia. Payout otomatis H+0 langsung masuk ke rekening bank Anda.
            </p>

            {/* Feature Highlights Card */}
            <div className="space-y-2.5 bg-white border-3 border-black p-4 rounded-2xl shadow-neo-md">
              <div className="flex items-center gap-2.5 font-black text-xs text-black">
                <div className="w-6 h-6 rounded-lg bg-neo-mint border-2 border-black flex items-center justify-center shrink-0 shadow-neo-sm">
                  <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />
                </div>
                <span>Pencairan Dana (Settlement) Instant H+0</span>
              </div>

              <div className="flex items-center gap-2.5 font-black text-xs text-black">
                <div className="w-6 h-6 rounded-lg bg-neo-pink border-2 border-black flex items-center justify-center shrink-0 shadow-neo-sm">
                  <ShieldCheck className="w-4 h-4 text-black stroke-[3]" />
                </div>
                <span>Potongan MDR Paling Murah Hanya 0.7%</span>
              </div>

              <div className="flex items-center gap-2.5 font-black text-xs text-black">
                <div className="w-6 h-6 rounded-lg bg-neo-sky border-2 border-black flex items-center justify-center shrink-0 shadow-neo-sm">
                  <Zap className="w-4 h-4 text-black stroke-[3]" />
                </div>
                <span>Dukungan Semua Aplikasi E-Wallet & Bank Air</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Row */}
          <div className="pt-6 border-t-3 border-black flex items-center justify-between text-xs font-black text-black z-10">
            <span>© {new Date().getFullYear()} AirPay. All rights reserved.</span>
            <Link href="/" className="hover:underline flex items-center gap-1">
              Beranda <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          </div>

          {/* Decorative Neo Brutalist floating element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neo-pink rounded-full border-4 border-black opacity-40 pointer-events-none" />
        </div>
      </div>
    </FirebaseClientProvider>
  );
}
