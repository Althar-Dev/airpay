'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#FFFDF5]">
      <div className="flex flex-col items-center justify-center gap-6 max-w-lg w-full">
        <div className="flex items-center gap-2 group">
          <Logo imgClassName="w-14 h-14 sm:w-16 sm:h-16 group-hover:scale-105 transition-transform" hideText />
          <span className="font-headline font-black text-2xl sm:text-3xl tracking-tight text-black">
            Air<span className="bg-neo-yellow px-2 py-0.5 border-2 border-black shadow-neo-sm rounded-xl ml-1">Pay</span>
          </span>
        </div>

        <div className="w-full bg-white border-2 sm:border-3 border-black shadow-neo-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-5">
          <div className="h-16 w-16 bg-neo-coral text-white border-2 border-black rounded-2xl shadow-neo-sm flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <span className="text-5xl sm:text-7xl font-headline font-black tracking-tighter text-black block drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
              500
            </span>
            <h1 className="font-headline font-black text-xl sm:text-2xl text-black">
              Terjadi Kesalahan Sistem
            </h1>
          </div>

          <p className="text-xs sm:text-sm font-bold text-black/70 leading-relaxed">
            Mohon maaf atas ketidaknyamanannya. Terjadi kesalahan tak terduga saat memproses permintaan Anda di aplikasi AirPay.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => reset()}
              className="h-11 sm:h-12 border-2 border-black bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs sm:text-sm shadow-neo-sm hover:shadow-neo rounded-xl flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4 stroke-[3]" />
              Coba Lagi
            </Button>
            <Button asChild className="h-11 sm:h-12 border-2 border-black bg-white hover:bg-neo-sky text-black font-headline font-black text-xs sm:text-sm shadow-neo-sm hover:shadow-neo rounded-xl flex-1 flex items-center justify-center gap-2">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 stroke-[3]" />
                Ke Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
