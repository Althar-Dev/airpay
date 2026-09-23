'use client';

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Server, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans pb-24">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 bg-[#FFFDF5] border-b-2 sm:border-b-4 border-black p-4 sm:p-5 shadow-neo-sm">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-headline font-black text-lg sm:text-xl">
            <div className="w-8 h-8 bg-neo-green border-2 border-black rounded-xl shadow-neo-sm flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-black stroke-[3]" />
            </div>
            AirPay
          </Link>
          <Button asChild variant="outline" size="sm" className="border-2 border-black bg-white hover:bg-neo-yellow shadow-neo-sm font-headline font-black text-xs rounded-xl">
            <Link href="/" className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4 stroke-[3]" /> Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 pt-8 sm:pt-12 space-y-8">
        {/* Banner Header */}
        <div className="bg-neo-green border-2 sm:border-4 border-black p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-neo-md space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1 rounded-full text-xs font-black shadow-neo-sm">
            <Lock className="w-4 h-4 text-black stroke-[3]" /> KEBIJAKAN PRIVASI & PERLINDUNGAN DATA
          </div>
          <h1 className="font-headline font-black text-2xl sm:text-4xl text-black tracking-tight">
            Kebijakan Privasi AirPay
          </h1>
          <p className="text-xs sm:text-sm font-bold text-black/80">
            Terakhir diperbarui: 8 Agustus 2026. Komitmen kami dalam melindungi privasi dan data pribadi merchant.
          </p>
        </div>

        {/* Content Body Cards */}
        <div className="bg-white border-2 sm:border-4 border-black p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-neo-md space-y-8 text-xs sm:text-sm font-bold leading-relaxed text-black/90">

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-headline font-black text-base sm:text-xl text-black flex items-center gap-2 border-b-2 border-black pb-2">
              <Eye className="w-5 h-5 text-black stroke-[2.5]" /> 1. Informasi Yang Kami Kumpulkan
            </h2>
            <p>
              Dalam memberikan layanan gateway pembayaran QRIS dan payout otomatis, AirPay mengumpulkan data berikut:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Data Identitas Merchant</strong>: Nama toko/usaha, alamat email, dan kredensial login (Firebase Auth).</li>
              <li><strong>Data Rekening / E-Wallet Pencairan</strong>: Nama bank, nomor rekening/HP, dan nama pemilik akun untuk tujuan settlement dana.</li>
              <li><strong>Data Log Transaksi</strong>: Nominal pembayaran, ID transaksi, alamat IP, dan waktu transaksi.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-headline font-black text-base sm:text-xl text-black flex items-center gap-2 border-b-2 border-black pb-2">
              <Server className="w-5 h-5 text-black stroke-[2.5]" /> 2. Penggunaan Informasi
            </h2>
            <p>
              Data yang dikumpulkan hanya digunakan untuk keperluan operasional platform:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Memproses pembayaran QRIS dan verifikasi mutasi secara otomatis.</li>
              <li>Mengeksekusi penarikan saldo (Payout H2H) ke rekening bank atau e-wallet pilihan Merchant.</li>
              <li>Mengirimkan notifikasi status transaksi dan webhook callback ke server Merchant.</li>
              <li>Mencegah aktivitas penipuan, transaksi bodong, atau penyalahgunaan API Key.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-headline font-black text-base sm:text-xl text-black flex items-center gap-2 border-b-2 border-black pb-2">
              <Lock className="w-5 h-5 text-black stroke-[2.5]" /> 3. Keamanan & Kerahasiaan Data
            </h2>
            <p>
              AirPay menggunakan standar enkripsi modern dan infrastruktur Firebase Cloud Security untuk memastikan seluruh data transaksi dan kredensial merchant tersimpan aman. Kami tidak pernah menjual atau menyewakan data pribadi merchant kepada pihak ketiga untuk keperluan pemasaran.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-headline font-black text-base sm:text-xl text-black flex items-center gap-2 border-b-2 border-black pb-2">
              <UserCheck className="w-5 h-5 text-black stroke-[2.5]" /> 4. Pembagian Data Pihak Ketiga
            </h2>
            <p>
              Informasi transaksi hanya dibagikan secara terbatas kepada penyedia infrastruktur pembayaran resmi (seperti penyedia API H2H Orderkuota / OkeConnect) semata-mata untuk memproses pengiriman saldo (Payout) ke rekening tujuan Merchant.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-4 border-t-2 border-black/10">
            <h2 className="font-headline font-black text-base sm:text-xl text-black">
              5. Kontak & Pertanyaan Privasi
            </h2>
            <p>
              Jika Anda memiliki pertanyaan seputar Kebijakan Privasi atau perlindungan data di AirPay, silakan hubungi tim privasi kami di <span className="font-mono font-black text-black">privacy@airpaygateway.site</span>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
