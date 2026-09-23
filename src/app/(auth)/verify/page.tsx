'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, KeyRound, ArrowRight, Lock } from 'lucide-react';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { verifyCode, deleteVerificationCode, sendVerificationCode } from '../actions';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { NumberPad } from './number-pad';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';

type VerifyStep = 'verify-code' | 'set-password';

function VerifyPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState<VerifyStep>('verify-code');

    const email = searchParams.get('email');
    const merchantName = searchParams.get('merchantName');
    const directorName = searchParams.get('directorName');

    useEffect(() => {
        if (!email || !merchantName || !directorName) {
            router.replace('/register');
        }
    }, [email, merchantName, directorName, router]);


    if (!email || !merchantName || !directorName) {
        return <InvalidLink />;
    }

    const onAccountCreated = () => {
        toast({ title: "Akun Berhasil Dibuat!", description: "Silakan masuk dengan password Anda." });
        router.push(`/login`);
    }

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {step === 'verify-code' && (
                    <motion.div
                        key="verify-code"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <VerifyCodeStep
                            email={email}
                            onCodeVerified={() => setStep('set-password')}
                        />
                    </motion.div>
                )}
                {step === 'set-password' && (
                    <motion.div
                        key="set-password"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <SetPasswordStep
                            email={email}
                            merchantName={merchantName}
                            directorName={directorName}
                            onAccountCreated={onAccountCreated}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function VerifyCodeStep({ email, onCodeVerified }: { email: string, onCodeVerified: () => void }) {
    const [value, setValue] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const { toast } = useToast();

    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(30);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        setIsResending(true);
        try {
            const result = await sendVerificationCode(email);
            if (result.success) {
                toast({ title: "Kode Terkirim Ulang", description: "Periksa kembali email Anda." });
                setResendCooldown(30);
            } else {
                toast({ variant: "destructive", title: "Gagal Kirim", description: result.message });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Terjadi kesalahan." });
        } finally {
            setIsResending(false);
        }
    };

    const handleVerifyCode = useCallback(async () => {
        if (isVerifying) return;
        setIsVerifying(true);
        const result = await verifyCode(email, value);
        if (result.success) {
            onCodeVerified();
        } else {
            toast({ variant: "destructive", title: "Verifikasi Gagal", description: result.message });
            setValue("");
        }
        setIsVerifying(false);
    }, [email, value, onCodeVerified, toast, isVerifying]);

    useEffect(() => {
        if (value.length === 6) {
            handleVerifyCode();
        }
    }, [value, handleVerifyCode]);

    const handleInput = (digit: string) => {
        if (value.length < 6) {
            setValue(prev => prev + digit);
        }
    };

    const handleDelete = () => {
        setValue(prev => prev.slice(0, -1));
    };

    return (
        <div className="flex flex-col items-center text-center space-y-4">
            {/* Header Badge & Title */}
            <div className="space-y-1.5 flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 bg-neo-yellow border-2 border-black px-3 py-1 rounded-full shadow-neo-sm">
                    <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
                    <span className="text-xs font-headline font-black text-black">VERIFIKASI OTP</span>
                </div>

                <h1 className="font-headline font-black text-xl sm:text-2xl text-black dark:text-white tracking-tight pt-1">
                    Masukkan Kode Verifikasi
                </h1>

                <p className="text-xs font-bold text-black/70 dark:text-zinc-300 max-w-xs">
                    Kode 6-digit telah dikirimkan ke email:
                </p>

                <div className="bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 px-3 py-1 rounded-xl shadow-neo-sm font-headline font-black text-xs text-black dark:text-zinc-200 break-all max-w-full">
                    {email}
                </div>
            </div>

            {/* OTP Slots with Dynamic Fill Background */}
            <div className="flex flex-col items-center gap-3 w-full py-1">
                <InputOTP maxLength={6} value={value} onChange={setValue}>
                    <InputOTPGroup className="gap-1.5 sm:gap-2 justify-center">
                        {[...Array(6)].map((_, i) => (
                            <InputOTPSlot 
                                key={i} 
                                index={i} 
                                className={`w-9 h-11 sm:w-11 sm:h-13 text-base sm:text-lg font-headline font-black border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm transition-all ${value.length > i ? 'bg-neo-yellow text-black' : 'bg-white dark:bg-zinc-800 dark:text-white'}`}
                            />
                        ))}
                    </InputOTPGroup>
                </InputOTP>

                <div className="w-full pt-1">
                    <NumberPad onInput={handleInput} onDelete={handleDelete} />
                </div>
            </div>

            {/* Bottom Resend Actions */}
            <div className="text-center space-y-2 pt-3 border-t-2 border-black/10 dark:border-zinc-800 w-full">
                {resendCooldown > 0 ? (
                    <p className="text-xs font-black text-black/60 dark:text-zinc-400">
                        Kirim ulang kode dalam <span className="bg-neo-yellow text-black px-2 py-0.5 border border-black rounded-md">{resendCooldown}s</span>
                    </p>
                ) : (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleResendCode} 
                        disabled={isResending} 
                        className="font-black text-xs border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-yellow dark:hover:bg-neo-yellow text-black dark:text-white dark:hover:text-black shadow-neo-sm rounded-xl px-4 h-9"
                    >
                        {isResending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                        Kirim Ulang Kode OTP
                    </Button>
                )}
                <div>
                    <Link href="/register" className="inline-flex items-center gap-1 font-black text-xs text-black/70 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:underline pt-1">
                        ← Kembali ke pendaftaran
                    </Link>
                </div>
            </div>
        </div>
    );
}

const passwordSchema = z.object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
});

function SetPasswordStep({ email, merchantName, directorName, onAccountCreated }: { email: string, merchantName: string, directorName: string, onAccountCreated: () => void }) {
    const { toast } = useToast();
    const { auth, firestore } = useFirebase();
    const [isCreating, setIsCreating] = useState(false);

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
        if (!auth || !firestore) return;
        setIsCreating(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, values.password);
            const newUser = userCredential.user;

            const merchantRef = doc(firestore, "merchants", newUser.uid);
            const generateRandomString = (length: number) => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let result = '';
                for (let i = 0; i < length; i++) {
                    result += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return result;
            };
            const merchantData = {
                id: newUser.uid,
                merchantId: `QP-${generateRandomString(8)}`,
                name: directorName,
                businessName: merchantName,
                email: email,
                registrationDate: new Date().toISOString(),
                isActive: true,
                emailVerified: true,
                admin: false,
            };
            await setDocumentNonBlocking(merchantRef, merchantData);
            await deleteVerificationCode(email);
            onAccountCreated();

        } catch (error: any) {
            console.error("Error creating user:", error);
            toast({
                variant: "destructive",
                title: "Gagal Membuat Akun",
                description: error.message,
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            <div className="space-y-1 text-center">
                <div className="inline-flex items-center gap-1.5 bg-neo-green border-2 border-black px-3 py-1 rounded-full shadow-neo-sm">
                    <KeyRound className="w-4 h-4 text-black stroke-[2.5]" />
                    <span className="text-xs font-headline font-black text-black">BUAT PASSWORD AKUN</span>
                </div>

                <h1 className="font-headline font-black text-xl sm:text-2xl text-black dark:text-white tracking-tight pt-1">
                    Buat Password Anda
                </h1>
                <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
                    Buat password aman untuk akun <span className="font-black text-black dark:text-white">{merchantName}</span>.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 pt-1">
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">
                                Password Baru
                            </FormLabel>
                            <FormControl>
                                <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...field} 
                                    className="h-11 sm:h-12 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs sm:text-sm rounded-xl transition-all shadow-neo-sm" 
                                />
                            </FormControl>
                            <FormMessage className="text-[10px] font-bold text-rose-600" />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">
                                Konfirmasi Password
                            </FormLabel>
                            <FormControl>
                                <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...field} 
                                    className="h-11 sm:h-12 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs sm:text-sm rounded-xl transition-all shadow-neo-sm" 
                                />
                            </FormControl>
                            <FormMessage className="text-[10px] font-bold text-rose-600" />
                        </FormItem>
                    )} />

                    <div className="pt-2">
                        <Button 
                            type="submit" 
                            disabled={isCreating}
                            className="w-full h-11 sm:h-12 font-headline font-black text-sm border-2 sm:border-4 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black shadow-neo-md hover:shadow-neo-lg rounded-xl transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm flex items-center justify-center gap-2"
                        >
                            {isCreating ? (
                                <Loader2 className="h-4 w-4 animate-spin text-black" />
                            ) : (
                                <>
                                    Selesaikan Pendaftaran <ShieldCheck className="w-4 h-4 stroke-[3]" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

function InvalidLink() {
    return (
        <div className="text-center space-y-3 py-3">
            <div className="inline-block p-2.5 bg-neo-coral border-2 border-black rounded-2xl shadow-neo-sm text-white font-black text-lg">
                ⚠️
            </div>
            <h2 className="font-headline font-black text-lg text-black dark:text-white">Tautan Tidak Valid</h2>
            <p className="text-xs font-bold text-black/70 dark:text-zinc-300 max-w-xs mx-auto">
                Silakan lakukan pendaftaran ulang untuk mendapatkan kode verifikasi baru.
            </p>
            <Button asChild className="border-2 border-black dark:border-zinc-700 bg-neo-yellow text-black font-black text-xs rounded-xl shadow-neo-sm">
                <Link href="/register">Ke Halaman Pendaftaran</Link>
            </Button>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white" />
            </div>
        }>
            <VerifyPageContent />
        </Suspense>
    );
}