'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ShieldCheck, Zap, KeyRound, ArrowRight } from "lucide-react";
import Link from 'next/link';

export default function DocsOverviewPage() {
  return (
    <div className="space-y-8 pb-32 max-w-4xl">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 sm:border-3 border-black p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-neo-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-neo-yellow border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider text-black">
            <BookOpen className="w-3.5 h-3.5 text-black stroke-[3]" /> PANDUAN PENGEMBANG REST API
          </div>
          <h1 className="font-headline font-black text-2xl sm:text-4xl text-black tracking-tight">
            Pengenalan & Autentikasi
          </h1>
          <p className="text-xs sm:text-sm font-bold text-black/70 max-w-2xl leading-relaxed">
            Selamat datang di dokumentasi resmi AirPay API. Pelajari cara menghubungkan aplikasi web, kasir (POS), dan bot toko Anda secara otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild className="h-11 px-5 border-2 border-black bg-neo-sky text-black font-headline font-black text-xs shadow-neo-sm rounded-xl hover:bg-sky-300">
            <Link href="/developers/api-keys">
              <KeyRound className="w-4 h-4 mr-1.5 stroke-[2.5]" /> Dapatkan API Key
            </Link>
          </Button>
        </div>
      </div>

      {/* Authentication Section */}
      <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black shadow-neo-md bg-white overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b-2 border-black bg-neo-pink">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-black text-white rounded-xl">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <CardTitle className="font-headline font-black text-lg sm:text-xl text-black">Autentikasi Header API Key</CardTitle>
              <CardDescription className="text-xs font-bold text-black/80">Semua request API memerlukan header otentikasi X-API-KEY.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed">
            Setiap permintaan ke API AirPay wajib menyertakan Kunci Rahasia (*Secret API Key*) pada HTTP Request Header <code className="bg-neo-yellow px-2 py-0.5 border border-black rounded font-mono font-black text-black">X-API-KEY</code>.
          </p>

          <div className="bg-[#FFFDF5] border-2 border-black rounded-2xl p-4 font-mono text-xs font-bold space-y-2 shadow-neo-sm">
            <div className="flex items-center justify-between text-rose-600 font-black">
              <span>X-API-KEY: QP-Key-YOUR_SECRET_KEY</span>
              <span className="font-sans text-[10px] bg-black text-white px-2 py-0.5 rounded">Wajib</span>
            </div>
            <p className="text-black/60 text-[11px] font-sans">Sertakan header ini pada permintaan POST /api/qris/create dan POST /api/qris/status.</p>
          </div>
        </CardContent>
      </Card>

      {/* Unique Codes System */}
      <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black shadow-neo-md bg-white overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b-2 border-black bg-neo-yellow">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-black text-white rounded-xl">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <CardTitle className="font-headline font-black text-lg sm:text-xl text-black">Sistem Kode Unik Nomimal Transaksi</CardTitle>
              <CardDescription className="text-xs font-bold text-black/80">Pencegahan kolisi antrian pembayaran secara cerdas.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-3">
          <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed">
            Untuk mengidentifikasi pembayaran yang masuk di mutasi bank secara otomatis, AirPay menggenerasi kode unik acak yang ditambahkan pada nominal dasar (<code className="bg-black/5 px-1.5 py-0.5 border border-black/20 rounded font-mono font-bold">base_amount + unique_code = total_amount</code>):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border-2 border-black bg-[#FFFDF5] shadow-neo-sm space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-neo-green px-2 py-0.5 border border-black rounded">Nominal &lt;= Rp 50.000</span>
              <p className="font-headline font-black text-sm text-black pt-1">Kode Unik 2 Digit (0 - 99)</p>
              <p className="text-[11px] font-bold text-black/70">Contoh: Rp 25.000 + 43 = <span className="font-mono text-black font-black">Rp 25.043</span></p>
            </div>

            <div className="p-4 rounded-xl border-2 border-black bg-[#FFFDF5] shadow-neo-sm space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-neo-sky px-2 py-0.5 border border-black rounded">Nominal &gt; Rp 50.000</span>
              <p className="font-headline font-black text-sm text-black pt-1">Kode Unik 3 Digit (100 - 999)</p>
              <p className="text-[11px] font-bold text-black/70">Contoh: Rp 150.000 + 705 = <span className="font-mono text-black font-black">Rp 150.705</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Step Link */}
      <div className="flex justify-end pt-4">
        <Button asChild className="h-12 px-6 border-2 border-black bg-neo-yellow text-black font-headline font-black text-xs shadow-neo-md hover:bg-yellow-400 rounded-xl">
          <Link href="/docs/create" className="flex items-center gap-2">
            Lanjut ke POST /api/qris/create <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
