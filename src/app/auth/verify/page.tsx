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
import { Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { verifyCode, deleteVerificationCode, sendVerificationCode } from '../actions';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { NumberPad } from './number-pad';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

// State machine for the verification flow
type VerifyStep = 'verify-code' | 'set-password';

// Main content component
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
            router.replace('/auth?for=signup');
        }
    }, [email, merchantName, directorName, router]);
    

    if (!email || !merchantName || !directorName) {
        return <InvalidLink />;
    }

    const onAccountCreated = () => {
        toast({ title: "Account Created Successfully!", description: "You will be redirected to sign in." });
        router.push(`/auth?for=signin`);
    }

    return (
        <div className="w-full max-w-sm text-center">
            <AnimatePresence mode="wait">
                {step === 'verify-code' && (
                     <motion.div
                        key="verify-code"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
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
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
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

// Step 1: Verify Code Component
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
                toast({ title: "Code Resent", description: "A new verification code has been sent." });
                setResendCooldown(30); // Reset cooldown
            } else {
                toast({ variant: "destructive", title: "Failed to Resend", description: result.message });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
        } finally {
            setIsResending(false);
        }
    };
    
    const handleVerifyCode = useCallback(async () => {
        if(isVerifying) return;
        setIsVerifying(true);
        const result = await verifyCode(email, value);
        if (result.success) {
            toast({ title: "Code Verified!", description: "Please set your password." });
            onCodeVerified();
        } else {
            toast({ variant: "destructive", title: "Verification Failed", description: result.message });
            setValue(""); // Clear input on failure
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
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-2">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Enter Verification Code</h1>
                <p className="text-muted-foreground">
                    A 6-digit code was sent to <span className="font-medium text-foreground">{email}</span>.
                </p>
            </div>
            
            <div className="flex flex-col items-center gap-8">
                <InputOTP maxLength={6} value={value} onChange={setValue}>
                    <InputOTPGroup className="gap-3">
                        {[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} />)}
                    </InputOTPGroup>
                </InputOTP>
                
                {isVerifying && <Loader2 className="h-8 w-8 animate-spin" />}

                <div className="w-full max-w-[280px]">
                  <NumberPad onInput={handleInput} onDelete={handleDelete} />
                </div>
            </div>
            
            <div className='mt-2 space-y-2'>
                 {resendCooldown > 0 ? (
                    <p className="text-muted-foreground text-sm">
                        Resend code in {resendCooldown}s
                    </p>
                ) : (
                    <Button variant="link" size="sm" onClick={handleResendCode} disabled={isResending}>
                        {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Didn't receive a code? Resend
                    </Button>
                )}
                 <Button variant="link" size="sm" asChild className="mx-auto flex">
                    <Link href="/auth?for=signup">Back to sign up</Link>
                </Button>
            </div>
        </div>
    );
}

// Step 2: Set Password Component
const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
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
            };
            await setDocumentNonBlocking(merchantRef, merchantData);
            
            await deleteVerificationCode(email);

            onAccountCreated();

        } catch (error: any) {
            console.error("Error creating user:", error);
            toast({
                variant: "destructive",
                title: "Sign up failed",
                description: error.code === 'auth/email-already-in-use' ? 'This email is already registered.' : (error.message || "An unknown error occurred."),
            });
        } finally {
            setIsCreating(false);
        }
    };
  
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-2">
                    <KeyRound className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Set Your Password</h1>
                <p className="text-muted-foreground">
                    Your email has been verified. Now, create a secure password.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-left">
                    <div className="grid gap-4">
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                            <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isCreating}>
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                </form>
            </Form>
        </div>
    );
}

// Helper for invalid link
function InvalidLink() {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Invalid Link</h1>
            <p className="text-muted-foreground mt-2">The verification link is missing required information.</p>
            <p className="text-sm text-muted-foreground mt-4">Please return to the sign-up page and try again.</p>
            <div className="mt-6">
                <Button asChild className="w-full">
                    <Link href="/auth?for=signup">Back to Sign Up</Link>
                </Button>
            </div>
        </div>
    );
}


// Main exported component with Suspense
export default function VerifyPage() {
  return (
      <Suspense fallback={null}>
          <VerifyPageContent />
      </Suspense>
  )
}
