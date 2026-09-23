'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, LogIn } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Logo } from "@/components/logo";

const signInSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, isUserLoading, user } = useFirebase();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    if (!auth) return;
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ variant: "success", title: "Berhasil Masuk", description: "Selamat datang kembali di dasbor AirPay." });
    } catch (error: any) {
      console.error(error);
      let description = "Terjadi kesalahan yang tidak diketahui.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Email atau password salah.";
      } else {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: "Gagal Masuk",
        description: description,
      });
    } finally {
      setIsSigningIn(false);
    }
  }

  if (isUserLoading || user) return null;

  return (
    <div className="w-full flex flex-col space-y-4 sm:space-y-5">
      {/* Header Row */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Logo imgClassName="w-10 h-10 sm:w-12 sm:h-12 shrink-0 group-hover:scale-105 transition-transform" hideText />
          <h1 className="font-headline font-black text-xl sm:text-2xl text-black dark:text-white tracking-tight flex items-center gap-1.5 flex-wrap">
            Masuk <span className="bg-neo-yellow text-black px-2 py-0.5 border-2 border-black shadow-neo-sm rounded-lg text-xs sm:text-sm font-headline font-black">Akun</span>
          </h1>
        </div>
        <p className="text-xs font-bold text-black/70 dark:text-zinc-300 leading-normal pt-1">
          Masukkan kredensial akun Anda untuk mengakses dasbor transaksi.
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 pt-1">
          <div className="space-y-3">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="font-headline font-black text-[11px] sm:text-xs uppercase tracking-wider text-black dark:text-zinc-200">
                  Email Bisnis
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nama@tokomu.com"
                    {...field}
                    className="h-10 sm:h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs sm:text-sm rounded-xl shadow-neo-sm"
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold text-rose-600" />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <FormLabel className="font-headline font-black text-[11px] sm:text-xs uppercase tracking-wider text-black dark:text-zinc-200">
                    Password
                  </FormLabel>
                  <Link href="#" className="text-[10px] sm:text-[11px] font-bold text-black dark:text-zinc-300 hover:underline decoration-2 shrink-0">
                    Lupa password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    className="h-10 sm:h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs sm:text-sm rounded-xl shadow-neo-sm"
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold text-rose-600" />
              </FormItem>
            )} />
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              disabled={isSigningIn}
              className="w-full h-11 sm:h-12 font-headline font-black text-xs sm:text-sm border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black shadow-neo-sm hover:shadow-neo rounded-xl transition-all active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2"
            >
              {isSigningIn ? (
                <Loader2 className="h-4 w-4 animate-spin text-black" />
              ) : (
                <>
                  Masuk Ke Dasbor <LogIn className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-xs font-bold text-black dark:text-zinc-300 pt-3 border-t-2 border-black/10 dark:border-zinc-800">
            Belum memiliki akun merchant?{' '}
            <Link href="/register" className="font-headline font-black underline decoration-2 text-black dark:text-white hover:bg-neo-yellow hover:text-black px-1 py-0.5 rounded transition-colors inline-flex items-center gap-1">
              Daftar Sekarang <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
