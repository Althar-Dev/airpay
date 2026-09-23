'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, ArrowRight, Sparkles, Calculator, MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#FFFDF5] dark:bg-zinc-950 border-b-4 border-black dark:border-zinc-800 shadow-neo-sm dark:shadow-none transition-colors">
      <div className="container mx-auto flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo imgClassName="w-12 h-12 sm:w-14 sm:h-14 group-hover:scale-105 transition-transform" hideText />
            <span className="font-headline font-black text-lg sm:text-xl tracking-tight text-black dark:text-white">
              Air<span className="bg-neo-yellow px-1.5 py-0.5 border-2 border-black shadow-neo-sm rounded-lg ml-0.5 text-black">Pay</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-xs sm:text-sm font-extrabold text-black dark:text-zinc-200">
          <Link
            href="#features"
            className="px-3.5 py-1.5 rounded-xl border-2 border-transparent hover:border-black dark:hover:border-zinc-700 hover:bg-neo-sky dark:hover:bg-zinc-800 hover:shadow-neo-sm transition-all"
          >
            Fitur Utama
          </Link>
          <Link
            href="#pricing"
            className="px-3.5 py-1.5 rounded-xl border-2 border-transparent hover:border-black dark:hover:border-zinc-700 hover:bg-neo-yellow dark:hover:bg-zinc-800 dark:hover:text-white hover:shadow-neo-sm transition-all"
          >
            Kalkulator & Harga
          </Link>
          <Link
            href="#testimonials"
            className="px-3.5 py-1.5 rounded-xl border-2 border-transparent hover:border-black dark:hover:border-zinc-700 hover:bg-neo-pink dark:hover:bg-zinc-800 hover:shadow-neo-sm transition-all"
          >
            Kata Merchant
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center justify-end gap-2.5">
          <ThemeToggle />
          <Button
            asChild
            variant="outline"
            className="font-extrabold border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-neo-cream dark:hover:bg-zinc-800 text-black dark:text-white shadow-neo-sm hover:shadow-neo transition-all rounded-xl h-10 px-4 text-xs sm:text-sm"
          >
            <Link href="/login">Masuk</Link>
          </Button>
          <Button
            asChild
            className="font-extrabold border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm transition-all rounded-xl h-10 px-4 text-xs sm:text-sm"
          >
            <Link href="/register" className="flex items-center gap-1.5">
              Daftar Gratis <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>
          </Button>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            asChild
            size="sm"
            className="font-black text-xs border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold text-black shadow-neo-sm rounded-xl h-9 px-3.5"
          >
            <Link href="/register">Daftar</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 rounded-xl"
              >
                <Menu className="h-4.5 w-4.5 stroke-[3]" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-[320px] border-l-4 border-black dark:border-zinc-800 p-5 bg-[#FFFDF5] dark:bg-zinc-950 text-black dark:text-white">
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <div className="flex flex-col gap-6 mt-1">
                <div className="flex items-center justify-between">
                  <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 group">
                    <Logo imgClassName="w-12 h-12 sm:w-14 sm:h-14 group-hover:scale-105 transition-transform" hideText />
                    <span className="font-headline font-black text-lg tracking-tight text-black dark:text-white">
                      Air<span className="bg-neo-yellow px-1.5 py-0.5 border-2 border-black shadow-neo-sm rounded-lg ml-0.5 text-black">Pay</span>
                    </span>
                  </Link>
                </div>

                <nav className="flex flex-col gap-3 font-extrabold text-sm">
                  <Link
                    href="#features"
                    onClick={() => setOpen(false)}
                    className="p-3 border-2 border-black dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 shadow-neo-sm hover:bg-neo-sky flex items-center justify-between text-black dark:text-white"
                  >
                    <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 stroke-[2.5]" /> Fitur Utama</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </Link>
                  <Link
                    href="#pricing"
                    onClick={() => setOpen(false)}
                    className="p-3 border-2 border-black dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 shadow-neo-sm hover:bg-neo-yellow flex items-center justify-between text-black dark:text-white"
                  >
                    <span className="flex items-center gap-2"><Calculator className="w-4 h-4 stroke-[2.5]" /> Kalkulator & Harga</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </Link>
                  <Link
                    href="#testimonials"
                    onClick={() => setOpen(false)}
                    className="p-3 border-2 border-black dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 shadow-neo-sm hover:bg-neo-pink flex items-center justify-between text-black dark:text-white"
                  >
                    <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4 stroke-[2.5]" /> Kata Merchant</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </Link>
                </nav>

                <div className="flex flex-col gap-3 pt-4 border-t-2 border-black dark:border-zinc-800">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-11 font-extrabold border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-neo-cream dark:hover:bg-zinc-800 text-black dark:text-white shadow-neo rounded-xl text-xs"
                  >
                    <Link href="/login" onClick={() => setOpen(false)}>Masuk Ke Akun</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full h-11 font-extrabold border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black shadow-neo-lg rounded-xl text-xs"
                  >
                    <Link href="/register" onClick={() => setOpen(false)} className="flex items-center justify-center gap-1.5">
                      Daftar Sekarang <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
