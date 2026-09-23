'use client';

import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2, Lock, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans pb-24">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 bg-[#FFFDF5] border-b-2 sm:border-b-4 border-black p-4 sm:p-5 shadow-neo-sm">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-headline font-black text-lg sm:text-xl">
            <div className="w-8 h-8 bg-neo-yellow border-2 border-black rounded-xl shadow-neo-sm flex items-center justify-center">
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
        <div className="bg-neo-yellow border-2 sm:border-4 border-black p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-neo-md space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1 rounded-full text-xs font-black shadow-neo-sm">
            <FileText className="w-4 h-4 text-black stroke-[3]" /> SYARAT & KETENTUAN LAYANAN
          </div>
          <h1 className="font-headline font-black text-2xl sm:text-4xl text-black tracking-tight">
            Syarat & Ketentuan Penggunaan AirPay
          </h1>
          <p className="text-xs sm:text-sm font-bold text-black/80">
            Terakhir diperbarui: 8 Agustus 2026. Harap baca syarat & ketentuan ini dengan saksama sebelum menggunakan platform AirPay.
          </p>
        </div>

        {/* Content Body Cards */}
        <div className="bg-white border-2 sm:border-4 border-black p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-neo-md space-y-8 text-xs sm:text-sm font-bold leading-relaxed text-black/90">

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-headline font-black text-base sm:text-xl text-black flex items-center gap-2 border-b-2 border-black pb-2">
              <Scale className="w-5 h-5 text-black stroke-[2.5]" /> 1. Penerimaan Ketentuan
            </h2>
            <p>
              Dengan mendaftar, mengakses, atau menggunakan platform <strong>AirPay</strong> (termasuk Dasbor Merchant, API Gateway, dan Layanan Payout), Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh seluruh Syarat & Ketentuan ini. Jika Anda tidak menyetujui bagian mana pun dari ketentuan ini, Anda dilarang menggunakan layanan kami.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-headline font-black text-base sm:text-xl text-black flex items-center gap-2 border-b-2 border-black pb-2">
              <CheckCircle2 className="w-5 h-5 text-black stroke-[2.5]" /> 2. Pendaftaran Akun & Kerahasiaan API Key
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Merchant wajib memberikan informasi akun, alamat email, dan data rekening bank/e-wallet yang sah dan valid.</li>
              <li>Merchant bertanggung jawab penuh atas kerahasiaan kredensial Login dan <strong>Merchant Secret API Key</strong> (`x-api-key`).</li>
              <li>Segala bentuk transaksi atau penarikan saldo yang diproses menggunakan API Key milik merchant dianggap sah dan merupakan tanggung jawab penuh pemilik akun.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-headline font-black text-base sm:text-xl text-black flex items-center gap-2 border-b-2 border-black pb-2">
              <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" /> 3. Layanan QRIS & Biaya MDR
            </h2>
            <p>
              AirPay menyediakan layanan pembuatan kode QRIS Dinamis dan Statis untuk memfasilitasi pembayaran transaksi usaha Merchant.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Setiap pembayaran yang berhasil masuk akan dikenakan biaya MDR (Merchant Discount Rate) standar sesuai tarif platform (contoh: 0.7%).</li>
              <li>Sistem pencocokan mutasi otomatis bekerja dengan memverifikasi tanggal & jam pembuatan transaksi (*Creation Timestamp Matching*) untuk mencegah klaim mutasi palsu.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-headline font-black text-base sm:text-xl text-black flex items-center gap-2 border-b-2 border-black pb-2">
              <Lock className="w-5 h-5 text-black stroke-[2.5]" /> 4. Ketentuan Penarikan Saldo (Payout) & Refund
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Merchant dapat menarik saldo dompet toko ke rekening Bank (Mandiri, BCA, BRI, BNI, CIMB, Permata) atau E-Wallet (GoPay, DANA, OVO, ShopeePay, LinkAja).</li>
              <li><strong>Biaya Admin Pencairan Flat</strong>: Penarikan dikenakan biaya admin flat (Bank: Rp 3.500 / trx, E-Wallet: Rp 2.000 / trx) yang dipotong dari dompet merchant bersama nominal penarikan.</li>
              <li><strong>Otomatis Refund</strong>: Jika transaksi Payout H2H ditolak oleh provider (misal nomor tidak ditemukan / gangguan), saldo total yang dipotong akan **100% dikembalikan secara otomatis** ke dompet merchant.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-headline font-black text-base sm:text-xl text-black flex items-center gap-2 border-b-2 border-black pb-2">
              ⚖️ 5. Larangan Penggunaan & Pembekuan Akun
            </h2>
            <p>
              AirPay secara tegas melarang penggunaan platform untuk kegiatan ilegal seperti perjudian online, penipuan, skema ponzi, tindak pidana pencucian uang, atau transaksi ilegal lainnya. AirPay berhak membekukan atau menutup akun merchant yang melanggar aturan hukum berlaku.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t-2 border-black/10">
            <h2 className="font-headline font-black text-base sm:text-xl text-black">
              6. Hubungi Kami
            </h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi tim dukungan kami melalui email di <span className="font-mono font-black text-black">support@airpaygateway.site</span>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
