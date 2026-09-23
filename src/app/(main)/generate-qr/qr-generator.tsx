'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, QrCode, Sparkles, CheckCircle2, Download, Copy, Check, ShieldCheck, Clock, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useDoc, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { generateDynamicQrisString } from '@/lib/payment/dinamis';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  amount: z.coerce.number().positive({
    message: 'Nominal harus angka positif.',
  }),
});

type QrDetails = z.infer<typeof formSchema>;

export function QrGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQr, setGeneratedQr] = useState<{
    details: QrDetails;
    image: string;
    string: string;
    transactionId: string;
    baseAmount: number;
    uniqueCode: number;
    finalAmount: number;
    feeAmount: number;
    netAmount: number;
    mdrRate: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Success' | 'Expired'>('Pending');
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 Menit (900 Detik)
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);

  const { toast } = useToast();
  const { user, firestore } = useFirebase();

  // Ambil profil merchant (untuk data desain)
  const merchantDocRef = useMemoFirebase(() => user ? doc(firestore, 'merchants', user.uid) : null, [user, firestore]);
  const { data: merchantData, isLoading: isMerchantLoading } = useDoc<any>(merchantDocRef);

  // Ambil konfigurasi sistem (untuk base QRIS)
  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settings, isLoading: isSettingsLoading } = useDoc<any>(settingsRef);

  const form = useForm<QrDetails>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  });

  // Countdown timer 15 menit
  useEffect(() => {
    if (!generatedQr || paymentStatus !== 'Pending' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus('Expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [generatedQr, paymentStatus, timeLeft]);

  // Fungsi pemeriksa status transaksi & polling otomatis
  const checkPaymentStatus = useCallback(async (isManual = false) => {
    if (!generatedQr?.transactionId || !user) return;

    if (isManual) setIsCheckingStatus(true);

    try {
      const res = await fetch(`/api/qris/status?transaction_id=${generatedQr.transactionId}&merchant_id=${user.uid}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (data.success && data.data?.status) {
        const st = data.data.status;
        if (st === 'Success' || st === 'Paid' || st === 'Successful') {
          setPaymentStatus('Success');
          toast({
            variant: "success",
            title: "Pembayaran Berhasil Diterima! 🎉",
            description: `Nominal Rp ${generatedQr.details.amount.toLocaleString('id-ID')} telah lunas.`,
          });
        } else if (st === 'Expired' || st === 'Failed') {
          setPaymentStatus('Expired');
          if (isManual) {
            toast({
              variant: "destructive",
              title: "QRIS Kadaluarsa",
              description: "Masa berlaku pembayaran 15 menit telah habis.",
            });
          }
        } else if (isManual) {
          toast({
            title: "Status: Menunggu Pembayaran (Pending)",
            description: "Pelanggan belum melakukan scan/transfer ke kode QRIS.",
          });
        }
      }
    } catch (error) {
      console.error("Failed to check status:", error);
    } finally {
      if (isManual) setIsCheckingStatus(false);
    }
  }, [generatedQr, user, toast]);

  // Polling otomatis setiap 4 detik saat status Pending
  useEffect(() => {
    if (!generatedQr || paymentStatus !== 'Pending') return;

    const interval = setInterval(() => {
      checkPaymentStatus(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [generatedQr, paymentStatus, checkPaymentStatus]);

  async function onSubmit(values: QrDetails) {
    if (!user || !settings) {
      toast({ variant: "destructive", title: "Sistem Belum Siap", description: "Menunggu data konfigurasi dimuat." });
      return;
    }

    setIsGenerating(true);
    setGeneratedQr(null);

    try {
      const payments = settings.payments || {};
      let qrisBase = '';
      if (payments.orderkuota?.enabled) qrisBase = payments.orderkuota.qrisString;
      else if (payments.gopay?.enabled) qrisBase = payments.gopay.qrisString;
      else if (payments.shopeepay?.enabled) qrisBase = payments.shopeepay.qrisString;

      if (!qrisBase) {
        toast({ variant: "destructive", title: "Channel Tidak Aktif", description: "Admin belum mengaktifkan saluran pembayaran (Orderkuota/Gopay/Shopee)." });
        setIsGenerating(false);
        return;
      }

      const backgroundColor = merchantData?.qrDesign?.backgroundColor || '#FFFFFF';
      const rawLogoUrl = merchantData?.qrDesign?.logoUrl?.trim() || '';
      const moduleStyle = merchantData?.qrDesign?.moduleStyle || 'square';
      const cornerStyle = merchantData?.qrDesign?.cornerStyle || 'square';

      let effectiveLogoUrl = rawLogoUrl || '/img/rp.png';
      if (rawLogoUrl) {
        try {
          await new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(true);
            img.onerror = () => {
              effectiveLogoUrl = '/img/rp.png';
              resolve(false);
            };
            img.src = rawLogoUrl;
          });
        } catch (e) {
          effectiveLogoUrl = '/img/rp.png';
        }
      }

      // Hitung Kode Unik & Total Tagihan
      const baseAmount = values.amount;
      let uniqueCode = 0;
      if (baseAmount <= 50000) {
        uniqueCode = Math.floor(Math.random() * 99) + 1; // 1-99
      } else {
        uniqueCode = Math.floor(Math.random() * 900) + 100; // 100-999
      }

      const finalAmount = baseAmount + uniqueCode;
      const dynamicQrisString = generateDynamicQrisString(finalAmount.toString(), qrisBase);

      const QRCodeStyling = (await import('qr-code-styling')).default;
      const qrCode = new QRCodeStyling({
        width: 1000,
        height: 1000,
        data: dynamicQrisString,
        margin: 40,
        qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' },
        imageOptions: { hideBackgroundDots: false, imageSize: 0.35, margin: 0 },
        dotsOptions: { color: "#000000", type: moduleStyle },
        backgroundOptions: { color: backgroundColor },
        cornersSquareOptions: { color: "#000000", type: cornerStyle },
        cornersDotOptions: { color: "#000000", type: cornerStyle },
        image: effectiveLogoUrl
      });

      const blob = await qrCode.getRawData('png');
      if (!blob) throw new Error("Gagal mengolah data gambar QR.");

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        const now = new Date();
        const transactionId = `INV-${Date.now()}`;
        const mdrFeePercent = settings?.mdrFee ?? 0.7;
        const feeAmount = Math.round(finalAmount * (mdrFeePercent / 100));
        const netAmount = Math.max(0, finalAmount - feeAmount);
        const EXPIRED_MINUTES = 15;
        const expiryDate = new Date(now.getTime() + EXPIRED_MINUTES * 60 * 1000);

        const trxRef = doc(firestore, 'merchants', user.uid, 'transactions', transactionId);
        await setDocumentNonBlocking(trxRef, {
          id: transactionId,
          externalId: transactionId,
          baseAmount: baseAmount,
          uniqueCode: uniqueCode,
          amount: finalAmount,
          feeAmount: feeAmount,
          netAmount: netAmount,
          mdrRate: mdrFeePercent,
          status: 'Pending',
          transactionDate: now.toISOString(),
          expiryDate: expiryDate.toISOString(),
          paymentMethod: 'Web QRIS Generator',
          customer: merchantData?.businessName || merchantData?.name || 'Pelanggan Toko',
          qrisString: dynamicQrisString,
          updatedAt: now.toISOString()
        });

        const qrCodesCollection = collection(firestore, 'merchants', user.uid, 'qrCodes');
        addDocumentNonBlocking(qrCodesCollection, {
          transactionId: transactionId,
          baseAmount: baseAmount,
          uniqueCode: uniqueCode,
          amount: finalAmount,
          qrisString: dynamicQrisString,
          generatedAt: now.toISOString(),
          status: 'active',
          type: 'dynamic_amount',
          productName: 'Pembayaran QRIS'
        });

        setGeneratedQr({
          details: values,
          image: base64data,
          string: dynamicQrisString,
          transactionId: transactionId,
          baseAmount: baseAmount,
          uniqueCode: uniqueCode,
          finalAmount: finalAmount,
          feeAmount: feeAmount,
          netAmount: netAmount,
          mdrRate: mdrFeePercent
        });
        setPaymentStatus('Pending');
        setTimeLeft(900);
        toast({ variant: "success", title: "QRIS Berhasil Dibuat! ⚡", description: "Transaksi tersimpan di Riwayat & QRIS siap discan pelanggan." });
        setIsGenerating(false);
      };

    } catch (err: any) {
      console.error("Generator Error: ", err);
      toast({ variant: "destructive", title: "Error Sistem", description: err.message || "Terjadi gangguan saat perenderan QR." });
      setIsGenerating(false);
    }
  }

  const handleCopyString = () => {
    if (!generatedQr) return;
    navigator.clipboard.writeText(generatedQr.string);
    setCopied(true);
    toast({ variant: "success", title: "String QRIS Disalin!", description: "Gunakan untuk integrasi manual ke sistem lain." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!generatedQr) return;
    const link = document.createElement('a');
    link.href = generatedQr.image;
    link.download = `qris-${merchantData?.businessName || 'merchant'}-${generatedQr.details.amount}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isMerchantLoading || isSettingsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className='space-y-6'>
          <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-4 rounded-xl shadow-neo-sm space-y-4">
            <Skeleton className='h-4 w-1/3 bg-black/10 dark:bg-zinc-800' />
            <Skeleton className='h-12 w-full rounded-xl bg-black/10 dark:bg-zinc-800' />
            <Skeleton className='h-12 w-full rounded-xl bg-black/10 dark:bg-zinc-800' />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Skeleton className='h-80 w-full max-w-sm rounded-2xl bg-black/10 dark:bg-zinc-800 shadow-neo-sm' />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Nominal Pembayaran (IDR)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Contoh: 50000"
                      {...field}
                      className="h-12 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-headline font-black text-lg rounded-xl shadow-neo-sm transition-all"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-rose-600" />
                </FormItem>
              )}
            />
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isGenerating}
                className="h-12 border-2 sm:border-3 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-sm shadow-neo-md hover:shadow-neo-lg rounded-xl transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm w-full flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin text-black" /> : <Sparkles className="h-5 w-5 stroke-[3]" />}
                Generate QRIS
              </Button>
            </div>
          </form>
        </Form>

        <div className="p-4 bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-2xl shadow-neo-sm mt-6">
          <h4 className="text-[10px] font-headline font-black uppercase tracking-widest text-black dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-black dark:text-white stroke-[3]" /> Info Branding
          </h4>
          <p className="text-[11px] font-bold text-black/70 dark:text-zinc-300 leading-relaxed">
            Mesin generator akan otomatis menerapkan warna latar belakang, logo, dan gaya modul (Dots/Rounded) sesuai pengaturan profil Anda.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[380px]">
        <AnimatePresence mode="wait">
          {isGenerating && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center gap-4 text-black dark:text-white w-full max-w-sm h-[400px] border-4 border-dashed border-black dark:border-zinc-700 bg-[#FFFDF5] dark:bg-zinc-900 rounded-3xl shadow-neo-sm p-6 text-center"
            >
              <div className="p-4 bg-neo-yellow border-2 border-black rounded-2xl shadow-neo-sm animate-bounce">
                <Loader2 className="h-10 w-10 animate-spin text-black stroke-[3]" />
              </div>
              <div>
                <p className="font-headline font-black text-base text-black dark:text-white">Menggambar QRIS...</p>
                <p className="text-xs font-bold text-black/60 dark:text-zinc-400 mt-1">Menerapkan gaya visual per pixel dan menempelkan identitas merchant.</p>
              </div>
            </motion.div>
          )}

          {!isGenerating && generatedQr && (
            <motion.div
              key="qr-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm"
            >
              <Card className="w-full border-3 border-black dark:border-zinc-700 bg-[#FFFDF5] dark:bg-zinc-900 shadow-neo-lg rounded-3xl overflow-hidden text-center text-black dark:text-white">
                <CardHeader className="bg-white dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700 p-5 space-y-1.5">
                  {paymentStatus === 'Pending' && (
                    <div className="inline-flex items-center justify-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-3.5 py-1 rounded-full shadow-neo-sm text-[10px] font-black uppercase mx-auto">
                      <Clock className="w-3.5 h-3.5 stroke-[3] animate-pulse" /> PENDING • EXPIRED ({Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')})
                    </div>
                  )}

                  {paymentStatus === 'Success' && (
                    <div className="inline-flex items-center justify-center gap-1.5 bg-neo-green text-black border-2 border-black px-4 py-1 rounded-full shadow-neo-sm text-[10px] font-black uppercase mx-auto animate-bounce">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> PEMBAYARAN LUNAS 🎉
                    </div>
                  )}

                  {paymentStatus === 'Expired' && (
                    <div className="inline-flex items-center justify-center gap-1.5 bg-rose-400 text-white border-2 border-black px-4 py-1 rounded-full shadow-neo-sm text-[10px] font-black uppercase mx-auto">
                      <XCircle className="w-3.5 h-3.5 stroke-[3]" /> QRIS KADALUARSA ❌
                    </div>
                  )}

                  <CardTitle className="font-headline font-black text-lg text-black dark:text-white">Total Harus Dibayar</CardTitle>
                  <p className="text-3xl font-headline font-black text-black dark:text-white">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(generatedQr.finalAmount)}
                  </p>

                  {/* Rincian Biaya Kode Unik, MDR & Saldo Masuk Net */}
                  <div className="mt-3 p-3 bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl space-y-1.5 text-left text-xs shadow-neo-sm">
                    <div className="flex justify-between items-center text-black/70 dark:text-zinc-300 font-bold">
                      <span>Nominal Tagihan Dasar</span>
                      <span className="font-mono">Rp {generatedQr.baseAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-700 dark:text-amber-400 font-bold">
                      <span>Kode Unik Verifikasi</span>
                      <span className="font-mono">+ Rp {generatedQr.uniqueCode.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-bold">
                      <span>Potongan MDR ({generatedQr.mdrRate}%)</span>
                      <span className="font-mono">- Rp {generatedQr.feeAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 pt-1.5 border-t-2 border-black/10 dark:border-zinc-700 font-headline font-black">
                      <span>Est. Saldo Bersih Masuk</span>
                      <span className="font-mono text-sm">Rp {generatedQr.netAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 p-6">
                  <div className="relative p-1 bg-black dark:bg-zinc-800 rounded-[2.5rem] shadow-neo-md group">
                    <div className="overflow-hidden rounded-[2.2rem] border-2 border-black dark:border-zinc-700">
                      <Image
                        src={generatedQr.image}
                        alt="Branded QRIS Code"
                        width={320}
                        height={320}
                        className={cn("w-full h-auto transition-all", paymentStatus === 'Expired' && "opacity-40 grayscale")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 w-full pt-2">
                    <Button
                      onClick={() => checkPaymentStatus(true)}
                      disabled={isCheckingStatus || paymentStatus !== 'Pending'}
                      className="w-full h-11 border-2 border-black dark:border-zinc-700 bg-neo-yellow hover:bg-yellow-400 text-black font-headline font-black text-xs shadow-neo-sm hover:shadow-neo rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={cn("w-4 h-4 stroke-[3]", isCheckingStatus && "animate-spin")} />
                      {isCheckingStatus ? 'Memeriksa Mutasi...' : (paymentStatus === 'Success' ? 'Status: LUNAS 🎉' : (paymentStatus === 'Expired' ? 'Status: KADALUARSA ❌' : 'Cek Status Pembayaran'))}
                    </Button>

                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button
                        onClick={handleDownloadImage}
                        className="flex-1 h-11 border-2 border-black dark:border-zinc-700 bg-neo-yellow hover:bg-yellow-400 text-black font-headline font-black text-xs shadow-neo-sm hover:shadow-neo rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-4 h-4 stroke-[2.5]" /> Unduh QR PNG
                      </Button>
                      <Button
                        onClick={handleCopyString}
                        variant="outline"
                        className="flex-1 h-11 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-sky text-black dark:text-white font-headline font-black text-xs shadow-neo-sm hover:shadow-neo rounded-xl flex items-center justify-center gap-1.5"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
                        {copied ? 'Tersalin!' : 'Salin String'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!isGenerating && !generatedQr && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-3 text-black/60 w-full max-w-sm h-[380px] border-3 border-dashed border-black bg-[#FFFDF5] dark:bg-zinc-900 rounded-3xl p-6 text-center text-black dark:text-white"
            >
              <div className="p-4 bg-neo-yellow border-2 border-black rounded-2xl shadow-neo-sm text-black">
                <QrCode className="h-8 w-8 stroke-[2.5]" />
              </div>
              <p className="font-headline font-black text-sm text-black dark:text-white">Siap Membuat Air</p>
              <p className="text-xs font-bold text-black/60 dark:text-zinc-400 max-w-xs leading-relaxed">
                Masukan nominal transaksi untuk menggenerasi kode QR dinamis dengan branding visual toko Anda.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
