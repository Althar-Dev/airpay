'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Clock, Gift } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center items-center bg-[#FFFDF5] dark:bg-[#0c0c0e] text-black dark:text-zinc-100 py-12 sm:py-16 border-t-4 border-black dark:border-zinc-800 overflow-hidden transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-neo-yellow border-2 sm:border-4 border-black rounded-2xl sm:rounded-3xl p-6 sm:p-12 lg:p-16 shadow-neo-md sm:shadow-neo-xl relative overflow-hidden text-center"
        >
          {/* Floating Neo Brutalism stickers (Desktop Only) */}
          <div className="absolute top-6 left-6 bg-white border-2 border-black px-3 py-1 rounded-xl shadow-neo-sm font-black text-xs -rotate-6 hidden lg:flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-black stroke-[2.5]" /> Kurang dari 2 Menit!
          </div>
          <div className="absolute bottom-6 right-6 bg-neo-coral text-white border-2 border-black px-3 py-1 rounded-xl shadow-neo-sm font-black text-xs rotate-6 hidden lg:flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-white stroke-[2.5]" /> Bonus Pembuatan QRIS
          </div>

          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5 relative z-10">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white border-2 border-black px-3 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-neo-sm">
              <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[2.5]" />
              10.000+ MERCHANT MODERN TELAH BERGABUNG
            </div>

            <h2 className="font-headline text-2xl sm:text-4xl lg:text-5xl font-black text-black leading-tight tracking-tight">
              Siap Menumbuhkan Bisnis <br />
              <span className="bg-neo-pink text-black px-2.5 sm:px-3 py-0.5 border-2 sm:border-4 border-black shadow-neo rounded-xl inline-block mt-1 rotate-[-1deg]">
                Lebih Cepat & Otomatis?
              </span>
            </h2>

            <p className="text-xs sm:text-base text-black/80 font-bold max-w-xl mx-auto leading-relaxed">
              Mulai terima pembayaran QRIS statis & dinamis sekarang. Tanpa biaya pendaftaran, tanpa ribet!
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 sm:pt-3">
              <Button 
                size="lg" 
                asChild 
                className="w-full sm:w-auto h-11 sm:h-13 px-6 sm:px-8 text-xs sm:text-base font-extrabold border-2 sm:border-4 border-black bg-black text-white hover:bg-neutral-800 shadow-neo-md sm:shadow-neo-lg hover:shadow-neo-xl hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo transition-all rounded-xl"
              >
                <Link href="/register" className="flex items-center justify-center gap-2">
                  Daftar Gratis Sekarang <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 stroke-[3]" />
                </Link>
              </Button>

              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="w-full sm:w-auto h-11 sm:h-13 px-5 sm:px-6 text-xs sm:text-sm font-extrabold border-2 sm:border-4 border-black bg-white hover:bg-neo-cream text-black shadow-neo-sm sm:shadow-neo-md hover:shadow-neo-lg hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm transition-all rounded-xl"
              >
                <Link href="#features">
                  Pelajari Fitur
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
