'use client';

import { Star, CheckCircle, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Budi Santoso",
    role: "Pemilik Kopi Kita, Jakarta",
    comment: "Proses pembuatan QRIS dinamisnya cepet banget! Pelanggan tinggal scan dari HP dan notifikasi pembayaran langsung muncul tanpa delay.",
    rating: 5,
    bgColor: "bg-neo-yellow",
    rotate: "rotate-0 sm:rotate-[-1.5deg]",
  },
  {
    name: "Siti Rahmawati",
    role: "Owner Thrift Studio, Bandung",
    comment: "Tampilan dasbornya juara banget! Fitur pencairan dan laporan keuangannya sangat membantu rekonsil harian toko saya.",
    rating: 5,
    bgColor: "bg-neo-pink",
    rotate: "rotate-0 sm:rotate-[1.5deg]",
  },
  {
    name: "Kevin Wijaya",
    role: "Founder TechParts ID, Surabaya",
    comment: "Integrasi API QRIS nya smooth abis, dokumentasinya jelas. Tim support AirPay juga sangat cepat merespons pas awal setup.",
    rating: 5,
    bgColor: "bg-neo-sky",
    rotate: "rotate-0 sm:rotate-[-1deg]",
  },
  {
    name: "Anita Dewi",
    role: "Owner Resto Dapur Ibu, Medan",
    comment: "Gak perlu khawatir pending pas jam sibuk makan siang. Sukses rate transaksi di resto kami naik drastis pakai AirPay!",
    rating: 5,
    bgColor: "bg-neo-mint",
    rotate: "rotate-0 sm:rotate-[2deg]",
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative w-full min-h-screen flex flex-col justify-center items-center bg-[#FFFDF5] dark:bg-[#0c0c0e] text-black dark:text-zinc-100 py-12 sm:py-16 border-t-4 border-black dark:border-zinc-800 overflow-hidden transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-neo-purple text-black border-2 border-black px-3 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-neo-sm">
            <MessageSquare className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            REVIU MERCHANT REAL
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-black dark:text-white leading-tight">
            Dicintai Ribuan <br />
            <span className="bg-neo-yellow text-black px-2.5 sm:px-3 py-0.5 border-2 sm:border-4 border-black shadow-neo rounded-xl inline-block mt-0.5 rotate-1">
              Pemilik Usaha Modern
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-black/80 dark:text-zinc-300 font-bold max-w-lg mx-auto leading-relaxed">
            Dengar langsung cerita sukses pengalaman merchant yang menggunakan AirPay setiap harinya.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className={`p-4 sm:p-5 border-2 sm:border-4 border-black rounded-2xl ${item.bgColor} ${item.rotate} shadow-neo-md sm:shadow-neo-lg hover:shadow-neo-xl hover:rotate-0 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-black text-black stroke-black" />
                  ))}
                </div>

                <p className="text-xs font-extrabold text-black leading-relaxed">
                  "{item.comment}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-black/20 flex items-center justify-between">
                <div>
                  <h4 className="font-headline font-black text-xs sm:text-sm text-black flex items-center gap-1">
                    {item.name} <CheckCircle className="w-3.5 h-3.5 text-black fill-white" />
                  </h4>
                  <p className="text-[10px] font-bold text-black/70">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
