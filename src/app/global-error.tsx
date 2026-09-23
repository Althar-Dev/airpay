'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { RefreshCw, ServerCrash } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from "@/components/theme-provider";
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <title>AirPay - Application Error</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-[#FFFDF5]">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <main className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="flex flex-col items-center justify-center gap-6 max-w-lg w-full">
              <div className="flex items-center gap-2 group">
                <Logo imgClassName="w-16 h-16 group-hover:scale-105 transition-transform" hideText />
                <span className="font-headline font-black text-3xl tracking-tight text-black">
                  Air<span className="bg-neo-yellow px-2 py-0.5 border-2 border-black shadow-neo-sm rounded-xl ml-1">Pay</span>
                </span>
              </div>

              <div className="w-full bg-white border-2 sm:border-3 border-black shadow-neo-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-5">
                <div className="h-16 w-16 bg-neo-coral text-white border-2 border-black rounded-2xl shadow-neo-sm flex items-center justify-center mx-auto">
                  <ServerCrash className="h-8 w-8 stroke-[2.5]" />
                </div>

                <h1 className="font-headline font-black text-2xl sm:text-3xl text-black">
                  Kesalahan Kritis Aplikasi
                </h1>

                <p className="text-xs sm:text-sm font-bold text-black/70 leading-relaxed">
                  Terjadi kesalahan aplikasi tingkat tinggi. Tim sistem telah diberitahu mengenai kendala ini.
                </p>

                <Button
                  onClick={() => reset()}
                  className="h-12 border-2 border-black bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs sm:text-sm shadow-neo-sm hover:shadow-neo rounded-xl w-full flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4 stroke-[3]" />
                  Muat Ulang Aplikasi
                </Button>
              </div>
            </div>
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
