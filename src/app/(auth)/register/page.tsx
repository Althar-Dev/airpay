'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, UserPlus } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { sendVerificationCode } from '../actions';
import { Logo } from "@/components/logo";

const signUpSchema = z.object({
  merchantName: z.string().min(2, "Nama bisnis minimal 2 karakter"),
  directorName: z.string().min(2, "Nama direktur minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  terms: z.boolean().refine(val => val === true, { message: "Anda harus menyetujui Syarat & Ketentuan" }),
});

export default function RegisterPage() {
  const router = useRouter();
  const [isSendingCode, setIsSendingCode] = useState(false);
  const { toast } = useToast();
  const { auth, user, isUserLoading } = useFirebase();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { merchantName: "", directorName: "", email: "", terms: false },
  });

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    if (!auth) return;
    setIsSendingCode(true);

    try {
      const methods = await fetchSignInMethodsForEmail(auth, values.email);
      if (methods.length > 0) {
        toast({ variant: "destructive", title: "Email Terdaftar", description: "Alamat email ini sudah digunakan." });
        setIsSendingCode(false);
        return;
      }

      const result = await sendVerificationCode(values.email);
      if (result.success) {
        toast({ variant: "success", title: "Kode Terkirim", description: "Silakan periksa email Anda untuk verifikasi." });
        const params = new URLSearchParams({
          email: values.email,
          merchantName: values.merchantName,
          directorName: values.directorName,
        });
        router.push(`/verify?${params.toString()}`);
      } else {
        toast({ variant: "destructive", title: "Gagal Mengirim Kode", description: result.message });
        setIsSendingCode(false);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({ variant: "destructive", title: "Kesalahan Sistem", description: "Gagal memproses pendaftaran. Coba lagi." });
      setIsSendingCode(false);
    }
  };

  if (isUserLoading || user) return null;

  return (
    <div className="w-full flex flex-col space-y-3.5 sm:space-y-4">
      {/* Header Row */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Logo imgClassName="w-10 h-10 sm:w-12 sm:h-12 shrink-0 group-hover:scale-105 transition-transform" hideText />
          <h1 className="font-headline font-black text-xl sm:text-2xl text-black dark:text-white tracking-tight flex items-center gap-1.5 flex-wrap">
            Daftar <span className="bg-neo-pink text-black px-2 py-0.5 border-2 border-black shadow-neo-sm rounded-lg text-xs sm:text-sm font-headline font-black">Merchant</span>
          </h1>
        </div>
        <p className="text-xs font-bold text-black/70 dark:text-zinc-300 leading-normal pt-1">
          Isi data usaha Anda untuk aktivasi akun QRIS instant.
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pt-1">
          <div className="space-y-2.5">
            <FormField control={form.control} name="merchantName" render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="font-headline font-black text-[11px] sm:text-xs uppercase tracking-wider text-black dark:text-zinc-200">
                  Nama Toko / Bisnis
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Kopi Kenangan Jaya"
                    {...field}
                    className="h-10 sm:h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs sm:text-sm rounded-xl shadow-neo-sm"
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold text-rose-600" />
              </FormItem>
            )} />

            <FormField control={form.control} name="directorName" render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="font-headline font-black text-[11px] sm:text-xs uppercase tracking-wider text-black dark:text-zinc-200">
                  Nama Pemilik / Direktur
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Budi Santoso"
                    {...field}
                    className="h-10 sm:h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs sm:text-sm rounded-xl shadow-neo-sm"
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold text-rose-600" />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="font-headline font-black text-[11px] sm:text-xs uppercase tracking-wider text-black dark:text-zinc-200">
                  Email Bisnis Aktif
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="budi@kopikenangan.id"
                    {...field}
                    className="h-10 sm:h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs sm:text-sm rounded-xl shadow-neo-sm"
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold text-rose-600" />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="terms" render={({ field }) => (
            <FormItem className="flex items-start space-x-2 space-y-0 pt-1">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5 border-2 border-black dark:border-zinc-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black rounded shrink-0"
                />
              </FormControl>
              <div className="grid gap-0.5 leading-tight">
                <Label htmlFor="terms" className="text-[11px] font-bold text-black dark:text-zinc-300 leading-normal cursor-pointer select-none">
                  Saya setuju dengan{' '}
                  <Link href="#" className="font-headline font-black underline decoration-2 text-black dark:text-white hover:bg-neo-yellow hover:text-black px-1 rounded">Syarat & Ketentuan</Link>.
                </Label>
                <FormMessage className="text-[10px] font-bold text-rose-600" />
              </div>
            </FormItem>
          )} />

          <div className="pt-1">
            <Button
              type="submit"
              disabled={isSendingCode}
              className="w-full h-11 sm:h-12 font-headline font-black text-xs sm:text-sm border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black shadow-neo-sm hover:shadow-neo rounded-xl transition-all active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2"
            >
              {isSendingCode ? (
                <Loader2 className="h-4 w-4 animate-spin text-black" />
              ) : (
                <>
                  Lanjut Ke Verifikasi <UserPlus className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-xs font-bold text-black dark:text-zinc-300 pt-2.5 border-t-2 border-black/10 dark:border-zinc-800">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-headline font-black underline decoration-2 text-black dark:text-white hover:bg-neo-yellow hover:text-black px-1 py-0.5 rounded transition-colors inline-flex items-center gap-1">
              Masuk Akun <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
