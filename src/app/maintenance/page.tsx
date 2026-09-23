import { Wrench, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/logo";

export default function MaintenancePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#FFFDF5] p-4 text-center">
      <div className="flex flex-col items-center justify-center gap-6 max-w-lg w-full">
        <div className="flex items-center gap-2 group">
          <Logo imgClassName="w-16 h-16 sm:w-20 sm:h-20 group-hover:scale-105 transition-transform" hideText />
          <span className="font-headline font-black text-3xl sm:text-4xl tracking-tight text-black">
            Air<span className="bg-neo-yellow px-2 py-0.5 border-2 sm:border-3 border-black shadow-neo-sm rounded-xl ml-1">Pay</span>
          </span>
        </div>

        <div className="w-full bg-white border-2 sm:border-3 border-black shadow-neo-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-5">
          <div className="h-16 w-16 bg-neo-yellow border-2 border-black rounded-2xl shadow-neo-sm flex items-center justify-center text-black mx-auto">
            <Wrench className="h-8 w-8 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-neo-coral text-white border-2 border-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-neo-sm">
            <ShieldAlert className="w-4 h-4 stroke-[3]" /> SISTEM DALAM PEMELIHARAAN
          </div>

          <h1 className="font-headline font-black text-2xl sm:text-3xl text-black tracking-tight">
            Pemeliharaan Server Terjadwal
          </h1>

          <p className="text-xs sm:text-sm font-bold text-black/70 leading-relaxed">
            Kami sedang melakukan peningkatan sistem dan pemeliharaan server berkala. Engine pembayaran AirPay akan kembali online dalam beberapa saat.
          </p>

          <div className="p-3.5 bg-neo-cream border-2 border-black rounded-xl text-[11px] font-bold text-black/80 shadow-neo-sm">
            Terima kasih atas kesabaran Anda. Pengalihan halaman akan bekerja otomatis setelah server kembali normal.
          </div>
        </div>
      </div>
    </main>
  );
}
