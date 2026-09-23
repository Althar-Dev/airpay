'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Play, CheckCircle2, ShieldCheck, Zap, Search, User, Mail, Settings,
  ChevronDown, Check, Sparkles, Download, Heart, QrCode, TrendingUp, BarChart2,
  Wallet, CreditCard, LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function Hero() {
  const { firestore } = useFirebase();
  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settings } = useDoc<{ mdrFee?: number }>(settingsRef);

  const currentMdr = settings?.mdrFee ?? 0.7;

  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2' | 'tab3'>('tab1');
  const [toggleActive, setToggleActive] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [qrisAmount, setQrisAmount] = useState<number>(150000);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center items-center bg-[#FFFDF5] dark:bg-[#0c0c0e] text-black dark:text-zinc-100 pt-14 sm:pt-16 pb-6 overflow-hidden transition-colors">
      {/* Background Retro Grid & Floating Shapes */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-30 dark:opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] sm:[background-size:24px_24px]" />

      {/* Decorative Neo Brutalist floating shapes */}
      <div className="absolute top-20 left-10 w-7 h-7 bg-neo-yellow border-2 border-black rotate-12 shadow-neo-sm hidden lg:block" />
      <div className="absolute top-1/3 left-6 w-5 h-5 bg-neo-pink rounded-full border-2 border-black shadow-neo-sm hidden lg:block" />
      <div className="absolute bottom-16 left-16 w-7 h-7 bg-neo-green border-2 border-black -rotate-45 shadow-neo-sm hidden lg:block" />
      <div className="absolute top-24 right-12 w-7 h-7 bg-neo-purple border-2 border-black rotate-45 shadow-neo-sm hidden lg:block" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex items-center py-2 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full">

          {/* Left Column: Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-3.5 sm:space-y-4 text-center lg:text-left"
          >
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-neo-yellow border-2 border-black px-3 py-1 rounded-full text-[10px] sm:text-xs font-black text-black shadow-neo-sm max-w-full">
              <Zap className="w-3.5 h-3.5 text-black stroke-[3]" />
              <span className="truncate">PLATFORM PEMBAYARAN QRIS INSTAN</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="font-headline font-black text-2xl sm:text-4xl lg:text-5xl text-black dark:text-white tracking-tight leading-[1.12]">
                Terima Pembayaran <br />
                <span className="relative inline-block my-0.5">
                  <span className="bg-neo-pink text-black px-2.5 sm:px-3 py-0.5 border-2 sm:border-4 border-black shadow-neo rounded-xl rotate-[-1deg] inline-block">
                    Lebih Cepat.
                  </span>
                </span>
                <br />
                Serba Otomatis!
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-black/80 dark:text-zinc-300 font-bold max-w-xl mx-auto lg:mx-0 leading-relaxed px-1 sm:px-0">
                Platform QRIS statis & dinamis tercanggih di Indonesia dengan tingkat keberhasilan <span className="bg-neo-mint text-black px-1.5 py-0.5 border border-black font-black">99.98%</span>. Tanpa pending!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto h-10 sm:h-12 px-5 sm:px-6 text-xs sm:text-sm font-extrabold border-2 sm:border-4 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black shadow-neo-md hover:shadow-neo-lg hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo transition-all rounded-xl"
              >
                <Link href="/register" className="flex items-center justify-center gap-2">
                  Daftar Sekarang <ArrowRight className="h-4 w-4 stroke-[3]" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto h-10 sm:h-12 px-4 sm:px-5 text-xs sm:text-sm font-extrabold border-2 sm:border-4 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-neo-sky dark:hover:bg-zinc-800 text-black dark:text-white shadow-neo-sm hover:shadow-neo-md hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm transition-all rounded-xl"
              >
                <Link href="#features" className="flex items-center justify-center gap-2">
                  <Play className="h-3.5 w-3.5 fill-black dark:fill-white stroke-black dark:stroke-white" /> Lihat Fitur
                </Link>
              </Button>
            </div>

            {/* Key Value Badges */}
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-black text-black dark:text-white">
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 px-2 py-0.5 rounded-lg shadow-neo-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> Instan Settlement
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 px-2 py-0.5 rounded-lg shadow-neo-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 stroke-[3]" /> Biaya MDR {currentMdr}%
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 px-2 py-0.5 rounded-lg shadow-neo-sm">
                <Zap className="w-3.5 h-3.5 text-amber-500 stroke-[3]" /> All Payment
              </div>
            </div>

          </motion.div>

          {/* Right Column: Neo Brutalism Showcase Board (Desktop Only) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="hidden lg:block lg:col-span-6 relative w-full"
          >
            {/* The Main Neo-Brutalist Frame */}
            <div className="relative bg-[#FFFBF0] dark:bg-zinc-900 border-2 sm:border-4 border-black dark:border-zinc-700 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-neo-md sm:shadow-neo-lg space-y-2.5 sm:size-y-3 min-h-[340px] flex flex-col justify-between text-black dark:text-white transition-colors">

              {/* Top Header Row with Color Dots and Tab Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 sm:border-b-4 border-black pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-neo-coral border border-black" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neo-violet border border-black" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neo-green border border-black" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neo-blue border border-black" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neo-yellow border border-black" />
                </div>

                {/* Tabs Switcher */}
                <div className="flex border-2 border-black rounded-lg overflow-hidden bg-white shadow-neo-sm">
                  <button
                    onClick={() => setActiveTab('tab1')}
                    className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-black transition-all flex items-center gap-1 border-r-2 border-black ${activeTab === 'tab1' ? 'bg-neo-yellow text-black' : 'bg-white hover:bg-neo-cream text-black/70'}`}
                  >
                    <LayoutDashboard className="w-3 h-3" /> Dasbor
                  </button>
                  <button
                    onClick={() => setActiveTab('tab2')}
                    className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-black transition-all flex items-center gap-1 border-r-2 border-black ${activeTab === 'tab2' ? 'bg-neo-pink text-black' : 'bg-white hover:bg-neo-cream text-black/70'}`}
                  >
                    <QrCode className="w-3 h-3" /> QRIS Code
                  </button>
                  <button
                    onClick={() => setActiveTab('tab3')}
                    className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-black transition-all flex items-center gap-1 ${activeTab === 'tab3' ? 'bg-neo-mint text-black' : 'bg-white hover:bg-neo-cream text-black/70'}`}
                  >
                    <TrendingUp className="w-3 h-3" /> Analitik
                  </button>
                </div>
              </div>

              {/* Dynamic Content Views depending on activeTab */}
              <AnimatePresence mode="wait">
                {activeTab === 'tab1' && (
                  <motion.div
                    key="tab1"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2.5 flex-grow"
                  >
                    {/* Showcase Layout for Tab 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-2.5">

                      {/* Left Stack: Color Cards & Status */}
                      <div className="sm:col-span-5 space-y-1.5">
                        <div className="bg-neo-coral border-2 border-black p-1.5 rounded-lg shadow-neo-sm font-black text-[10px] text-black flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full border border-black bg-white" /> Primary (QRIS)
                        </div>
                        <div className="bg-neo-violet border-2 border-black p-1.5 rounded-lg shadow-neo-sm font-black text-[10px] text-black flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full border border-black bg-white" /> Secondary (Wallet)
                        </div>
                        <div className="bg-neo-mint border-2 border-black p-1.5 rounded-lg shadow-neo-sm font-black text-[10px] text-black flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full border border-black bg-white" /> Accent (Bank)
                        </div>

                        {/* Card Title Box */}
                        <div className="bg-white border-2 border-black p-1.5 rounded-lg shadow-neo-sm space-y-1">
                          <div className="flex items-center gap-1 font-extrabold text-[9px] text-black">
                            <Zap className="w-3 h-3 text-amber-500 stroke-[3]" />
                            Status Transaksi
                          </div>
                          <div className="h-1.5 w-full bg-neo-cream border border-black rounded-full overflow-hidden">
                            <div className="h-full bg-neo-green w-4/5 border-r border-black" />
                          </div>
                          <p className="text-[8px] font-black text-black/70 text-right">99.98% Sukses</p>
                        </div>
                      </div>

                      {/* Center / Right Stack: Center Banner & Controls */}
                      <div className="sm:col-span-7 space-y-1.5">
                        {/* Central Highlight Banner */}
                        <div className="bg-white border-2 border-black p-2 rounded-xl shadow-neo-sm text-center space-y-0.5 relative overflow-hidden">
                          <div className="inline-block bg-neo-yellow p-1 rounded-lg border border-black shadow-neo-sm">
                            <Sparkles className="w-3.5 h-3.5 text-black" />
                          </div>
                          <h3 className="font-headline font-black text-sm sm:text-lg text-black">Air<span className="bg-neo-yellow px-1 py-0.2 border border-black rounded ml-0.5">Pay</span> Engine</h3>
                          <p className="font-bold text-[8px] sm:text-[9px] text-black/70">Platform Gerbang Pembayaran Air</p>

                          {/* Badge Chips Row */}
                          <div className="flex flex-wrap items-center justify-center gap-1 pt-0.5">
                            <span className="bg-white border border-black px-1.5 py-0.2 rounded-full text-[8px] font-black shadow-neo-sm">Instan Settlement</span>
                            <span className="bg-neo-violet text-black border border-black px-1.5 py-0.2 rounded-full text-[8px] font-black shadow-neo-sm">MDR {currentMdr}%</span>
                            <span className="bg-neo-mint border border-black px-1.5 py-0.2 rounded-full text-[8px] font-black shadow-neo-sm">Multi E-Wallet</span>
                          </div>
                        </div>

                        {/* Interactive Toggle & Search Box */}
                        <div className="grid grid-cols-2 gap-1.5">
                          {/* Toggles & Checkbox Widget */}
                          <div className="bg-neo-yellow border-2 border-black p-1.5 rounded-lg shadow-neo-sm space-y-1">
                            <div
                              onClick={() => setToggleActive(!toggleActive)}
                              className="flex items-center justify-between cursor-pointer select-none"
                            >
                              <span className="text-[9px] font-black">Active</span>
                              <div className={`w-6.5 h-3 border border-black rounded-full flex items-center p-0.5 transition-colors ${toggleActive ? 'bg-neo-green justify-end' : 'bg-white justify-start'}`}>
                                <div className="w-2 h-2 bg-white border border-black rounded-full" />
                              </div>
                            </div>

                            <div
                              onClick={() => setCheckboxChecked(!checkboxChecked)}
                              className="flex items-center gap-1 cursor-pointer select-none text-[9px] font-black"
                            >
                              <div className={`w-3 h-3 border border-black rounded flex items-center justify-center ${checkboxChecked ? 'bg-neo-coral' : 'bg-white'}`}>
                                {checkboxChecked && <Check className="w-2 h-2 text-black stroke-[3]" />}
                              </div>
                              <span>Checked</span>
                            </div>
                          </div>

                          {/* Retro Menu Dropdown */}
                          <div className="bg-white border-2 border-black rounded-lg shadow-neo-sm overflow-hidden text-[9px] font-black">
                            <div className="bg-neo-yellow border-b border-black p-1 flex items-center justify-between">
                              <span className="flex items-center gap-1 text-[8px]"><Settings className="w-2.5 h-2.5" /> Menu</span>
                              <ChevronDown className="w-2.5 h-2.5" />
                            </div>
                            <div className="p-0.5 space-y-0.5 text-[8px]">
                              <div className="flex items-center gap-1 text-black hover:bg-neo-cream p-0.5 rounded"><User className="w-2 h-2" /> Profile</div>
                              <div className="flex items-center gap-1 text-black hover:bg-neo-cream p-0.5 rounded"><Mail className="w-2 h-2" /> Messages</div>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Bottom Interactive Bar & Search */}
                    <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-1.5 border-t-2 border-black pt-2">
                      {/* Search Bar */}
                      <div className="flex items-center gap-1 bg-white border-2 border-black px-2 py-0.5 rounded-lg shadow-neo-sm flex-grow">
                        <Search className="w-3 h-3 text-black shrink-0" />
                        <input
                          type="text"
                          placeholder="Search transaction..."
                          className="w-full bg-transparent text-[9px] sm:text-[10px] font-bold focus:outline-none"
                          readOnly
                          value="QRIS Statis Toko A"
                        />
                      </div>

                      {/* Floating Icon Action Pills */}
                      <div className="flex items-center justify-center gap-1">
                        <button className="w-5.5 h-5.5 sm:w-6 sm:h-6 bg-neo-yellow border-2 border-black rounded-lg flex items-center justify-center shadow-neo-sm font-black text-[9px]">
                          <Play className="w-2.5 h-2.5 fill-black text-black" />
                        </button>
                        <button className="w-5.5 h-5.5 sm:w-6 sm:h-6 bg-neo-blue border-2 border-black rounded-lg flex items-center justify-center shadow-neo-sm font-black text-[9px]">
                          <Download className="w-2.5 h-2.5 text-black stroke-[2.5]" />
                        </button>
                        <button className="w-5.5 h-5.5 sm:w-6 sm:h-6 bg-neo-coral border-2 border-black rounded-lg flex items-center justify-center shadow-neo-sm font-black text-[9px] text-white">
                          <Heart className="w-2.5 h-2.5 fill-white text-white" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'tab2' && (
                  <motion.div
                    key="tab2"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2.5 flex-grow"
                  >
                    {/* Tab 2 Content: QRIS Interactive Code Generator */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-2.5">

                      {/* Left: QR Code Display Card */}
                      <div className="sm:col-span-5 bg-white border-2 border-black p-2.5 rounded-xl shadow-neo-sm text-center flex flex-col items-center justify-center space-y-1.5">
                        <div className="relative p-2 bg-neo-yellow border-2 border-black rounded-xl shadow-neo-sm">
                          <QrCode className="w-20 h-20 text-black stroke-[1.8]" />
                          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-neo-coral border-y border-black animate-pulse" />
                        </div>
                        <div>
                          <p className="font-headline font-black text-[10px] text-black">NMID: ID10200388421</p>
                          <span className="bg-neo-mint border border-black px-1.5 py-0.2 rounded-full text-[8px] font-black">QRIS DINAMIS</span>
                        </div>
                      </div>

                      {/* Right: Payment Simulation & Methods */}
                      <div className="sm:col-span-7 space-y-2">
                        {/* Live Amount Box */}
                        <div className="bg-neo-pink border-2 border-black p-2.5 rounded-xl shadow-neo-sm space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-black">Nominal Tagihan:</span>
                            <span className="animate-pulse bg-emerald-400 border border-black px-1.5 py-0.2 rounded text-[8px] font-black text-black">MENUNGGU SCAN</span>
                          </div>
                          <p className="text-xl sm:text-2xl font-headline font-black text-black">
                            Rp {qrisAmount.toLocaleString('id-ID')}
                          </p>
                        </div>

                        {/* Supported Payment Logos / Chips */}
                        <div className="bg-white border-2 border-black p-2 rounded-xl shadow-neo-sm space-y-1">
                          <p className="text-[9px] font-black text-black/70">Dukungan Aplikasi Pembayaran:</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="bg-neo-sky border border-black px-1.5 py-0.5 rounded text-[8px] font-black">GoPay</span>
                            <span className="bg-neo-purple border border-black px-1.5 py-0.5 rounded text-[8px] font-black">OVO</span>
                            <span className="bg-neo-coral text-white border border-black px-1.5 py-0.5 rounded text-[8px] font-black">ShopeePay</span>
                            <span className="bg-neo-green border border-black px-1.5 py-0.5 rounded text-[8px] font-black">DANA</span>
                            <span className="bg-neo-yellow border border-black px-1.5 py-0.5 rounded text-[8px] font-black">BCA / Bank</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Quick Nominal Selector & Generate Button */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 border-t-2 border-black pt-2">
                      <div className="flex items-center gap-1 text-[9px] font-black">
                        <span>Pilih Nominal:</span>
                        <button
                          onClick={() => setQrisAmount(50000)}
                          className={`px-1.5 py-0.5 rounded border border-black transition-colors ${qrisAmount === 50000 ? 'bg-neo-yellow' : 'bg-white'}`}
                        >
                          50rb
                        </button>
                        <button
                          onClick={() => setQrisAmount(150000)}
                          className={`px-1.5 py-0.5 rounded border border-black transition-colors ${qrisAmount === 150000 ? 'bg-neo-yellow' : 'bg-white'}`}
                        >
                          150rb
                        </button>
                        <button
                          onClick={() => setQrisAmount(300000)}
                          className={`px-1.5 py-0.5 rounded border border-black transition-colors ${qrisAmount === 300000 ? 'bg-neo-yellow' : 'bg-white'}`}
                        >
                          300rb
                        </button>
                      </div>

                      <button className="bg-neo-yellow border-2 border-black px-2.5 py-1 rounded-lg shadow-neo-sm font-black text-[9px] flex items-center gap-1 hover:bg-yellow-400">
                        <Zap className="w-3 h-3 text-black stroke-[3]" /> Buat Kode QRIS Baru
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'tab3' && (
                  <motion.div
                    key="tab3"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2.5 flex-grow"
                  >
                    {/* Tab 3 Content: Real-time Analytics & Revenue Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-2.5">

                      {/* Left: Total Omset & AI Insight */}
                      <div className="sm:col-span-5 space-y-1.5">
                        <div className="bg-neo-mint border-2 border-black p-2.5 rounded-xl shadow-neo-sm space-y-0.5">
                          <div className="flex items-center justify-between text-[9px] font-black text-black">
                            <span>Total Omset Bulan Ini</span>
                            <span className="bg-white border border-black px-1.5 py-0.2 rounded-full text-emerald-700 font-black">+28.4%</span>
                          </div>
                          <p className="text-xl sm:text-2xl font-headline font-black text-black">
                            Rp 48.250.000
                          </p>
                        </div>

                        <div className="bg-white border-2 border-black p-2 rounded-xl shadow-neo-sm space-y-1">
                          <div className="flex items-center gap-1 text-[9px] font-black text-black">
                            <Zap className="w-3 h-3 text-amber-500 stroke-[3]" /> Settlement Rekening
                          </div>
                          <p className="text-[8px] font-extrabold text-black/80 leading-tight">
                            Pencairan: <span className="bg-neo-yellow px-1 py-0.2 border border-black rounded">Transfer Otomatis H+0</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Weekly Revenue Bar Chart Graphic */}
                      <div className="sm:col-span-7 bg-white border-2 border-black p-2.5 rounded-xl shadow-neo-sm space-y-1.5 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[9px] font-black">
                          <span className="flex items-center gap-1"><BarChart2 className="w-3 h-3 text-black" /> Grafik Transaksi Mingguan</span>
                          <span className="text-[8px] text-black/60">7 Hari Terakhir</span>
                        </div>

                        {/* Bar Graphic Visualizer */}
                        <div className="flex items-end justify-between gap-1.5 h-16 pt-2 px-1">
                          {[
                            { day: 'Sen', height: 'h-8', color: 'bg-neo-yellow' },
                            { day: 'Sel', height: 'h-11', color: 'bg-neo-pink' },
                            { day: 'Rab', height: 'h-7', color: 'bg-neo-sky' },
                            { day: 'Kam', height: 'h-14', color: 'bg-neo-mint' },
                            { day: 'Jum', height: 'h-16', color: 'bg-neo-coral' },
                          ].map((bar, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                              <div className={`w-full ${bar.height} ${bar.color} border border-black rounded-t-md shadow-neo-sm`} />
                              <span className="text-[8px] font-black text-black">{bar.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Bottom Bar: Payout Status & Report Button */}
                    <div className="flex items-center justify-between gap-1.5 border-t-2 border-black pt-2">
                      <div className="flex items-center gap-1 text-[9px] font-black text-black">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black" />
                        <span>Payout H+0 Transfer Otomatis</span>
                      </div>

                      <button className="bg-neo-mint border-2 border-black px-2.5 py-1 rounded-lg shadow-neo-sm font-black text-[9px] flex items-center gap-1 hover:bg-emerald-300">
                        <Download className="w-3 h-3 text-black stroke-[2.5]" /> Unduh Laporan Laporan .CSV
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
