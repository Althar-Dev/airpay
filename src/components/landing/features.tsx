'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BarChart3, ShieldCheck, Smartphone, Globe2, Code2, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "QRIS Instan",
    description: "Buat kode QRIS statis atau dinamis dalam hitungan detik dengan dasbor interaktif yang sangat mudah.",
    icon: Zap,
    bgColor: "bg-[#FFF9E6]",
    badgeBg: "bg-neo-yellow",
    badgeText: "Cepat & Praktis",
  },
  {
    title: "Analitik Real-Time",
    description: "Pantau setiap rupiah transaksi masuk secara langsung dengan grafik mendetail dan laporan otomatis.",
    icon: BarChart3,
    bgColor: "bg-[#F3E8FF]",
    badgeBg: "bg-neo-purple",
    badgeText: "Live Tracker",
  },
  {
    title: "Keamanan Tinggi",
    description: "Enkripsi end-to-end dengan standar keamanan tinggi untuk melindungi setiap data usaha Anda.",
    icon: ShieldCheck,
    bgColor: "bg-[#E6F4FE]",
    badgeBg: "bg-neo-blue",
    badgeText: "100% Aman",
  },
  {
    title: "Mobile First",
    description: "Kelola toko & transaksi Anda kapan saja dan di mana saja melalui tampilan web app yang responsif.",
    icon: Smartphone,
    bgColor: "bg-[#FFE8E8]",
    badgeBg: "bg-neo-pink",
    badgeText: "Akses HP",
  },
  {
    title: "Integrasi Payment",
    description: "Terima pembayaran dari OVO, GoPay, ShopeePay, DANA, BCA, Mandiri, BRI, dan semua QRIS merchant.",
    icon: Globe2,
    bgColor: "bg-[#E6FAF0]",
    badgeBg: "bg-neo-green",
    badgeText: "Banyak Pilihan",
  },
  {
    title: "Webhook & Developer API",
    description: "Hubungkan sistem kasir POS atau website toko Anda dengan Instant Webhook callback & REST API canggih.",
    icon: Code2,
    bgColor: "bg-[#FFF0E6]",
    badgeBg: "bg-neo-orange",
    badgeText: "Developer Ready",
  }
];

export function Features() {
  return (
    <section id="features" className="relative w-full min-h-screen flex flex-col justify-center items-center bg-[#FFFDF5] dark:bg-[#0c0c0e] text-black dark:text-zinc-100 py-12 sm:py-16 border-t-4 border-b-4 border-black dark:border-zinc-800 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <div className="inline-block bg-neo-mint text-black border-2 border-black px-3 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-neo-sm">
            PRO-LEVEL FEATURES
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-black dark:text-white leading-tight">
            Fitur Canggih untuk <br />
            <span className="bg-neo-yellow text-black px-2.5 sm:px-3 py-0.5 border-2 sm:border-4 border-black shadow-neo rounded-xl inline-block mt-0.5 rotate-1">
              Skalabilitas Bisnis
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-black/80 dark:text-zinc-300 font-bold max-w-lg mx-auto leading-relaxed">
            Semua yang Anda butuhkan untuk memproses transaksi dengan gaya modern, aman, dan tanpa hambatan.
          </p>
        </div>
        
        {/* Feature Cards Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className={`h-full border-2 sm:border-4 border-black dark:border-zinc-700 ${feature.bgColor} dark:bg-zinc-900 shadow-neo-md dark:shadow-[4px_4px_0px_0px_#27272a] hover:shadow-neo-lg dark:hover:shadow-[6px_6px_0px_0px_#3f3f46] hover:-translate-y-0.5 transition-all duration-200 rounded-2xl p-1.5 sm:p-2 relative group overflow-hidden`}>
                
                {/* Top Corner Badge */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <span className={`${feature.badgeBg} text-black border-2 border-black px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black shadow-neo-sm`}>
                    {feature.badgeText}
                  </span>
                </div>

                <CardHeader className="p-3.5 sm:p-5 pb-2">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${feature.badgeBg} border-2 border-black flex items-center justify-center shadow-neo-sm mb-2.5 sm:mb-3 group-hover:rotate-6 transition-transform`}>
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-black stroke-[2.5]" />
                  </div>
                  <CardTitle className="font-headline text-base sm:text-lg lg:text-xl font-black text-black dark:text-white flex items-center justify-between">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-3.5 sm:p-5 pt-0 pb-3.5 sm:pb-5">
                  <p className="text-black/80 dark:text-zinc-300 text-xs font-extrabold leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="mt-2.5 sm:mt-3 pt-2 border-t-2 border-black/10 dark:border-zinc-700 flex items-center justify-between text-[10px] sm:text-xs font-black text-black dark:text-zinc-200">
                    <span>Pelajari Selengkapnya</span>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
