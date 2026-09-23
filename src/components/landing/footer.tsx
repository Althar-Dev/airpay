'use client';

import { Logo } from "@/components/logo";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  {
    title: "PRODUK",
    links: [
      { name: "Fitur Utama", href: "#features" },
      { name: "Kalkulator MDR", href: "#pricing" },
      { name: "Dasbor Merchant", href: "/login" },
      { name: "Dokumentasi API", href: "/docs" },
    ]
  },
  {
    title: "PERUSAHAAN",
    links: [
      { name: "Tentang Kami", href: "#" },
      { name: "Karir Usaha", href: "#" },
      { name: "Blog Merchant", href: "#" },
      { name: "Kontak Sales", href: "#" },
    ]
  },
  {
    title: "LEGAL & SECURITY",
    links: [
      { name: "Syarat & Ketentuan", href: "/terms" },
      { name: "Kebijakan Privasi", href: "/privacy" },
      { name: "Standar Keamanan", href: "/terms" },
    ]
  }
];

export function Footer() {
  return (
    <footer className="border-t-4 border-black dark:border-zinc-800 bg-[#FFFDF5] dark:bg-zinc-950 pt-10 sm:pt-16 pb-8 sm:pb-12 text-black dark:text-zinc-200 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 pb-8 sm:pb-12 border-b-2 sm:border-b-3 border-black dark:border-zinc-800">

          {/* Column 1: Brand & Socials */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 group">
                <Logo imgClassName="w-12 h-12 sm:w-14 sm:h-14 group-hover:scale-105 transition-transform" hideText />
                <span className="font-headline font-black text-lg sm:text-xl tracking-tight text-black dark:text-white">
                  Air<span className="bg-neo-yellow px-1.5 py-0.5 border-2 border-black shadow-neo-sm rounded-lg ml-0.5 text-black">Pay</span>
                </span>
              </Link>
            </div>

            <p className="text-black/80 dark:text-zinc-400 text-xs sm:text-sm font-bold leading-relaxed max-w-sm">
              Gerbang pembayaran QRIS tercanggih untuk bisnis modern di Indonesia. Terdaftar dan diawasi sesuai regulasi keuangan nasional.
            </p>

            {/* Social Icons Neo Brutalism */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Link href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-neo-yellow border-2 border-black rounded-xl flex items-center justify-center shadow-neo-sm hover:translate-y-[-2px] transition-transform text-black">
                <Facebook className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </Link>
              <Link href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-neo-sky border-2 border-black rounded-xl flex items-center justify-center shadow-neo-sm hover:translate-y-[-2px] transition-transform text-black">
                <Twitter className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </Link>
              <Link href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-neo-pink border-2 border-black rounded-xl flex items-center justify-center shadow-neo-sm hover:translate-y-[-2px] transition-transform text-black">
                <Instagram className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </Link>
              <Link href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-neo-mint border-2 border-black rounded-xl flex items-center justify-center shadow-neo-sm hover:translate-y-[-2px] transition-transform text-black">
                <Linkedin className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </Link>
            </div>
          </div>

          {/* Columns 2-4: Links */}
          {footerLinks.map((group, index) => (
            <div key={index} className="space-y-3 sm:space-y-4">
              <h4 className="font-headline font-black text-[11px] sm:text-xs tracking-widest text-black bg-neo-yellow inline-block px-2 py-0.5 border-2 border-black rounded-lg shadow-neo-sm">
                {group.title}
              </h4>
              <nav className="flex flex-col gap-2">
                {group.links.map((link, i) => (
                  <Link
                    key={i}
                    href={link.href}
                    className="text-black/80 dark:text-zinc-400 font-extrabold text-xs sm:text-sm hover:text-black dark:hover:text-white hover:underline decoration-2 transition-all"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom copyright & Status */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-[11px] sm:text-xs font-extrabold text-black/80 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} AirPay. PT AirPay Teknologi Indonesia. All rights reserved.
          </p>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-black">
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 px-2.5 py-1 rounded-full shadow-neo-sm text-black dark:text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black dark:border-zinc-900" />
              Sistem Normal 99.98%
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
