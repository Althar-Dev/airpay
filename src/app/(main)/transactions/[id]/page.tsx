'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  CreditCard, 
  QrCode, 
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { generateDynamicQrisString } from '@/lib/payment/dinamis';

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || '';
  switch (s) {
    case 'success':
    case 'successful':
    case 'paid':
      return (
        <span className="bg-neo-green text-black border-2 border-black shadow-neo-sm text-xs font-headline font-black px-3 py-1 rounded-xl inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> PEMBAYARAN LUNAS
        </span>
      );
    case 'pending':
      return (
        <span className="bg-neo-yellow text-black border-2 border-black shadow-neo-sm text-xs font-headline font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 animate-pulse">
          <Clock className="w-3.5 h-3.5 stroke-[3]" /> PENDING • MENUNGGU BAYAR
        </span>
      );
    case 'expired':
    case 'failed':
      return (
        <span className="bg-neo-coral text-white border-2 border-black shadow-neo-sm text-xs font-headline font-black px-3 py-1 rounded-xl inline-flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 stroke-[3]" /> KADALUARSA / GAGAL
        </span>
      );
    default:
      return <span className="bg-white text-black border-2 border-black text-xs font-bold px-3 py-1 rounded-xl inline-block">{status}</span>;
  }
};

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, firestore } = useFirebase();
  const { toast } = useToast();

  const [copiedId, setCopiedId] = useState(false);
  const [copiedQris, setCopiedQris] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [qrImage, setQrImage] = useState<string>('');

  // Ambil data transaksi dari Firestore
  const txRef = useMemoFirebase(() => {
    if (!user || !firestore || !id) return null;
    return doc(firestore, 'merchants', user.uid, 'transactions', id);
  }, [user, firestore, id]);

  const { data: txData, isLoading: isTxLoading } = useDoc<any>(txRef);

  // Ambil profil merchant (untuk desain QRIS jika ada)
  const merchantDocRef = useMemoFirebase(() => user ? doc(firestore, 'merchants', user.uid) : null, [user, firestore]);
  const { data: merchantData } = useDoc<any>(merchantDocRef);

  // Ambil konfigurasi sistem
  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settings } = useDoc<any>(settingsRef);

  // Render QR image jika data transaksi ada
  useEffect(() => {
    if (!txData) return;

    let isMounted = true;
    const renderQr = async () => {
      try {
        const payments = settings?.payments || {};
        let qrisBase = txData.qrisString || '';
        if (!qrisBase) {
          if (payments.gopay?.enabled) qrisBase = payments.gopay.qrisString;
          else if (payments.gopay?.qrisString) qrisBase = payments.gopay.qrisString;
          if (qrisBase && txData.amount) {
            qrisBase = generateDynamicQrisString(txData.amount.toString(), qrisBase);
          }
        }

        if (!qrisBase) return;

        const backgroundColor = merchantData?.qrDesign?.backgroundColor || '#FFFFFF';
        const rawLogoUrl = merchantData?.qrDesign?.logoUrl?.trim() || '';
        const moduleStyle = merchantData?.qrDesign?.moduleStyle || 'square';
        const cornerStyle = merchantData?.qrDesign?.cornerStyle || 'square';

        let effectiveLogoUrl = rawLogoUrl || '/img/rp.png';

        const QRCodeStyling = (await import('qr-code-styling')).default;
        const qrCode = new QRCodeStyling({
          width: 800,
          height: 800,
          data: qrisBase,
          margin: 30,
          qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' },
          imageOptions: { hideBackgroundDots: false, imageSize: 0.35, margin: 0 },
          dotsOptions: { color: "#000000", type: moduleStyle },
          backgroundOptions: { color: backgroundColor },
          cornersSquareOptions: { color: "#000000", type: cornerStyle },
          cornersDotOptions: { color: "#000000", type: cornerStyle },
          image: effectiveLogoUrl
        });

        const blob = await qrCode.getRawData('png');
        if (blob && isMounted) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            if (isMounted) setQrImage(reader.result as string);
          };
        }
      } catch (err) {
        console.error("QR render detail page error:", err);
      }
    };

    renderQr();

    return () => {
      isMounted = false;
    };
  }, [txData, settings, merchantData]);

  // Fungsi Cek Status Manual
  const handleCheckStatus = async () => {
    if (!user || !id) return;
    setIsCheckingStatus(true);

    try {
      const res = await fetch(`/api/qris/status?transaction_id=${id}&merchant_id=${user.uid}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (data.success && data.data?.status) {
        const st = data.data.status;
        if (st === 'Success' || st === 'Paid' || st === 'Successful') {
          toast({
            variant: "success",
            title: "Pembayaran Dikonfirmasi! 🎉",
            description: `Transaksi ${id} telah lunas dan saldo dikreditkan.`
          });
        } else if (st === 'Expired' || st === 'Failed') {
          toast({
            variant: "destructive",
            title: "Transaksi Kadaluarsa",
            description: "Waktu pembayaran untuk QRIS ini telah berakhir."
          });
        } else {
          toast({
            title: "Status: Menunggu Pembayaran (Pending)",
            description: "Belum ada mutasi masuk yang cocok untuk transaksi ini."
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Gagal Memeriksa",
          description: data.message || "Gagal menghubungi server pemeriksa mutasi."
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Terjadi kesalahan saat memeriksa mutasi."
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCopyId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast({ variant: "success", title: "ID Transaksi Disalin!" });
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyQrisString = () => {
    if (!txData?.qrisString) return;
    navigator.clipboard.writeText(txData.qrisString);
    setCopiedQris(true);
    toast({ variant: "success", title: "String QRIS Disalin!" });
    setTimeout(() => setCopiedQris(false), 2000);
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  if (isTxLoading) {
    return (
      <div className="w-full space-y-6 pb-32">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 rounded-xl bg-black/10 dark:bg-zinc-800" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl bg-black/10 dark:bg-zinc-800" />
      </div>
    );
  }

  if (!txData) {
    return (
      <div className="w-full space-y-6 pb-32">
        <Link href="/transactions">
          <Button variant="outline" className="h-10 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-xl shadow-neo-sm font-headline font-black text-xs gap-2">
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" /> Kembali
          </Button>
        </Link>
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border-2 sm:border-3 border-black dark:border-zinc-700 rounded-3xl shadow-neo-md text-black dark:text-white">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3 stroke-[2.5]" />
          <h2 className="font-headline font-black text-xl">Transaksi Tidak Ditemukan</h2>
          <p className="text-xs font-bold text-black/60 dark:text-zinc-400 mt-1">ID transaksi &apos;{id}&apos; tidak dapat ditemukan di Firestore Anda.</p>
        </div>
      </div>
    );
  }

  const feeVal = txData.feeAmount ?? Math.round((txData.amount || 0) * 0.007);
  const netVal = txData.netAmount ?? Math.max(0, (txData.amount || 0) - feeVal);
  const isPending = txData.status === 'Pending';

  return (
    <div className="w-full space-y-6 pb-32 text-black dark:text-white">
      {/* Header Info Banner */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/transactions">
          <Button variant="outline" className="h-10 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-xl shadow-neo-sm hover:shadow-neo font-headline font-black text-xs gap-2">
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" /> Kembali ke Riwayat
          </Button>
        </Link>

        {isPending && (
          <Button
            onClick={handleCheckStatus}
            disabled={isCheckingStatus}
            className="h-10 border-2 border-black dark:border-zinc-700 bg-neo-yellow hover:bg-yellow-400 text-black font-headline font-black text-xs shadow-neo-sm hover:shadow-neo rounded-xl flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4 stroke-[3]", isCheckingStatus && "animate-spin")} />
            {isCheckingStatus ? 'Checking...' : 'Cek Status Pembayaran'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Details Card (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
            <CardHeader className="p-5 sm:p-6 border-b-2 border-black dark:border-zinc-700 bg-[#FFFDF5] dark:bg-zinc-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {getStatusBadge(txData.status)}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-black/70 dark:text-zinc-300">ID: {id}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyId}
                    className="h-7 px-2 border border-black dark:border-zinc-700 rounded-lg text-[10px] font-bold"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" /> : <Copy className="w-3 h-3 stroke-[2.5]" />}
                  </Button>
                </div>
              </div>

              <div>
                <CardTitle className="font-headline font-black text-xl sm:text-2xl text-black dark:text-white">
                  Rincian Transaksi QRIS
                </CardTitle>
                <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300 mt-1">
                  Dibuat pada {txData.transactionDate ? new Date(txData.transactionDate).toLocaleString('id-ID') : '-'}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-6">
              {/* Financial Breakdown Card */}
              <div className="p-4 sm:p-5 bg-neo-cream dark:bg-zinc-800/80 border-2 border-black dark:border-zinc-700 rounded-2xl shadow-neo-sm space-y-3">
                <h3 className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">
                  Ringkasan Finansial
                </h3>
                <div className="space-y-2 text-sm font-bold">
                  {typeof txData.baseAmount === 'number' && typeof txData.uniqueCode === 'number' && (
                    <>
                      <div className="flex justify-between items-center text-black/80 dark:text-zinc-300">
                        <span>Nominal Tagihan Dasar</span>
                        <span className="font-mono">{formatIDR(txData.baseAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                        <span>Kode Unik Verifikasi</span>
                        <span className="font-mono">+{formatIDR(txData.uniqueCode)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center text-black/80 dark:text-zinc-300">
                    <span>Total Tagihan Pembeli (Gross)</span>
                    <span className="font-mono font-black text-base text-black dark:text-white">{formatIDR(txData.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                    <span>Potongan MDR ({txData.mdrRate ?? 0.7}%)</span>
                    <span className="font-mono font-bold">-{formatIDR(feeVal)}</span>
                  </div>
                  <div className="pt-2 border-t-2 border-black/10 dark:border-zinc-700 flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-headline font-black">
                    <span>Estimasi Saldo Masuk Dompet</span>
                    <span className="font-mono text-lg">{formatIDR(netVal)}</span>
                  </div>
                </div>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-2xl shadow-neo-sm space-y-1">
                  <p className="text-[10px] font-headline font-black uppercase text-black/60 dark:text-zinc-400 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 stroke-[2.5]" /> Saluran Pembayaran
                  </p>
                  <p className="font-headline font-black text-sm text-black dark:text-white">
                    {txData.paymentMethod || 'QRIS All Bank / E-Wallet'}
                  </p>
                </div>

                <div className="p-4 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-2xl shadow-neo-sm space-y-1">
                  <p className="text-[10px] font-headline font-black uppercase text-black/60 dark:text-zinc-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 stroke-[2.5]" /> Pembayar / Pelanggan
                  </p>
                  <p className="font-headline font-black text-sm text-black dark:text-white truncate">
                    {txData.customer || txData.payerReference || 'Pelanggan Umum'}
                  </p>
                </div>

                <div className="p-4 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-2xl shadow-neo-sm space-y-1">
                  <p className="text-[10px] font-headline font-black uppercase text-black/60 dark:text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 stroke-[2.5]" /> Tanggal Pembuatan
                  </p>
                  <p className="font-mono font-bold text-xs text-black dark:text-white">
                    {txData.transactionDate ? new Date(txData.transactionDate).toLocaleString('id-ID') : '-'}
                  </p>
                </div>

                <div className="p-4 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-2xl shadow-neo-sm space-y-1">
                  <p className="text-[10px] font-headline font-black uppercase text-black/60 dark:text-zinc-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 stroke-[2.5]" /> Batas Expired
                  </p>
                  <p className="font-mono font-bold text-xs text-black dark:text-white">
                    {txData.expiryDate ? new Date(txData.expiryDate).toLocaleString('id-ID') : '15 Menit'}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Pending State */}
              {isPending && (
                <div className="pt-2">
                  <Button
                    onClick={handleCheckStatus}
                    disabled={isCheckingStatus}
                    className="w-full h-12 border-2 sm:border-3 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-sm shadow-neo-md hover:shadow-neo-lg rounded-2xl flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={cn("w-5 h-5 stroke-[3]", isCheckingStatus && "animate-spin")} />
                    {isCheckingStatus ? 'Memeriksa Mutasi Real-Time...' : 'Cek Status Pembayaran Sekarang'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Code Preview & Quick Actions (Right 1 col) */}
        <div className="space-y-6">
          <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-[#FFFDF5] dark:bg-zinc-900 text-black dark:text-white text-center">
            <CardHeader className="p-5 border-b-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800">
              <div className="inline-flex items-center justify-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-3.5 py-1 rounded-full shadow-neo-sm text-[10px] font-headline font-black uppercase mx-auto">
                <QrCode className="w-3.5 h-3.5 stroke-[3]" /> KODE QRIS
              </div>
              <CardTitle className="font-headline font-black text-lg text-black dark:text-white mt-1">
                {isPending ? 'Scan QRIS Pembayaran' : 'Kode QRIS Transaksi'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center gap-4">
              {(() => {
                const effectiveQrSrc = qrImage || txData.qrUrl || (user ? `/api/qris/image?tid=${id}&mid=${user.uid}` : '');
                if (!effectiveQrSrc) {
                  return (
                    <div className="w-full h-48 border-2 border-dashed border-black dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 text-black/50 dark:text-zinc-400">
                      <QrCode className="w-8 h-8 stroke-[2]" />
                      <p className="text-xs font-bold">QRIS String Siap</p>
                    </div>
                  );
                }

                return (
                  <div className="relative p-1 bg-black dark:bg-zinc-800 rounded-[2rem] shadow-neo-md">
                    <div className="overflow-hidden rounded-[1.8rem] border-2 border-black dark:border-zinc-700 bg-white">
                      <Image
                        src={effectiveQrSrc}
                        alt="QRIS Code"
                        width={280}
                        height={280}
                        className={cn("w-full h-auto", !isPending && "opacity-40 grayscale")}
                        unoptimized
                      />
                    </div>
                  </div>
                );
              })()}

              {txData.qrisString && (
                <Button
                  onClick={handleCopyQrisString}
                  variant="outline"
                  className="w-full h-11 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-sky text-black dark:text-white font-headline font-black text-xs shadow-neo-sm hover:shadow-neo rounded-xl flex items-center justify-center gap-2"
                >
                  {copiedQris ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
                  {copiedQris ? 'String QRIS Tersalin!' : 'Salin String QRIS'}
                </Button>
              )}

              <div className="p-3 bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm text-left text-[11px] font-bold text-black/70 dark:text-zinc-300 leading-relaxed">
                <p className="flex items-center gap-1.5 mb-0.5 font-headline font-black uppercase text-[10px] text-black dark:text-white">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" /> Keamanan Mutasi
                </p>
                Status transaksi diperbarui secara real-time dari mutasi akun bank/e-wallet Anda.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
