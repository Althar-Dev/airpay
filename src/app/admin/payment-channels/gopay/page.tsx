'use client';

import { useState, useEffect, useCallback } from "react";
import { doc } from "firebase/firestore";
import { 
  Wallet, 
  Smartphone, 
  MessageSquareText, 
  Loader2, 
  CheckCircle2, 
  History,
  ArrowDownLeft, 
  ArrowUpRight,
  RefreshCw,
  XCircle,
  Settings,
  Plus
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { goBizLogin, goBizVerify, goBizMutations } from "@/lib/payment/gopay";
import { updateSystemSettingsAction, getSystemSettingsAction } from "@/app/admin/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function GopayConfigPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settings } = useDoc<{ 
    payments?: {
        gopay: { 
            enabled: boolean, 
            merchantId: string,
            accessToken?: string,
            refreshToken?: string,
            xUniqueId?: string,
            apiKey?: string,
            phoneNumber?: string,
            merchantName?: string,
            qrisString?: string
        }
    }
  }>(settingsRef);

  const [serverSettings, setServerSettings] = useState<any>(null);

  const loadServerSettings = useCallback(async () => {
    const res = await getSystemSettingsAction();
    if (res.success && res.data) {
      setServerSettings(res.data);
    }
  }, []);

  useEffect(() => {
    loadServerSettings();
  }, [loadServerSettings]);

  const activeSettings = settings || serverSettings;

  const [mutations, setMutations] = useState<any[] | null>(null);
  const [isFetchingMutations, setIsFetchingMutations] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState<'init' | 'otp' | 'settings'>('init');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [form, setForm] = useState({
      apiKey: 'GoMerchant_Single',
      phoneNumber: '',
      otpCode: '',
      otpToken: '',
      xUniqueId: '',
      qrisString: '',
      enabled: true
  });

  const isConnected = !!activeSettings?.payments?.gopay?.accessToken;

  useEffect(() => {
    if (activeSettings?.payments?.gopay) {
      const g = activeSettings.payments.gopay;
      setForm(prev => ({
        ...prev,
        phoneNumber: g.phoneNumber || '',
        qrisString: g.qrisString || '',
        enabled: g.enabled ?? true
      }));
    }
  }, [activeSettings]);

  const fetchMutations = useCallback(async () => {
    if (!isConnected || !activeSettings?.payments?.gopay) return;
    
    setIsFetchingMutations(true);
    const gopay = activeSettings.payments.gopay;
    
    try {
        const res = await goBizMutations({
            apiKey: gopay.apiKey || 'GoMerchant_Single',
            accessToken: gopay.accessToken || '',
            refreshToken: gopay.refreshToken || '',
            xUniqueId: gopay.xUniqueId || '',
            merchantId: gopay.merchantId,
            limit: 20
        });

        if (res.status === 'success' && res.data) {
            setMutations(res.data.mutations || []);
            
            if (res.data.token_refreshed && res.data.access_token) {
                updateSystemSettingsAction({
                    'payments.gopay.accessToken': res.data.access_token,
                    'payments.gopay.refreshToken': res.data.refresh_token || ''
                });
            }
        }
    } catch (error) {
        console.error("Failed to fetch mutations:", error);
    } finally {
        setIsFetchingMutations(false);
    }
  }, [isConnected, settings, settingsRef]);

  useEffect(() => {
    if (isConnected && mutations === null) {
        fetchMutations();
    }
  }, [isConnected, mutations, fetchMutations]);

  const handleRequestOtp = async () => {
      if (!form.phoneNumber) {
          toast({ variant: "destructive", title: "Input Error", description: "Nomor HP wajib diisi." });
          return;
      }
      setIsProcessing(true);
      try {
          const res = await goBizLogin(form.apiKey, form.phoneNumber);
          if (res.status === 'success' && res.data) {
              setForm(prev => ({ 
                  ...prev, 
                  otpToken: res.data!.otp_token, 
                  xUniqueId: res.data!.x_uniqueid,
                  otpCode: ''
              }));
              setStep('otp');
              toast({ title: "OTP Terkirim! 📲", description: "Cek SMS/WA di nomor hp Anda." });
          } else {
              toast({ variant: "destructive", title: "Gagal", description: res.message || "Gagal meminta OTP." });
          }
      } catch (err: any) {
          toast({ variant: "destructive", title: "Error", description: err.message });
      } finally {
          setIsProcessing(false);
      }
  };

  const handleVerifyOtp = async () => {
      if (!form.otpCode || form.otpCode.length < 4) return;
      setIsProcessing(true);
      try {
          const res = await goBizVerify(form.apiKey, form.otpCode, form.otpToken, form.xUniqueId);
          if (res.status === 'success' && res.data) {
              const merchant = res.data.merchants?.[0] || { id: 'ALL', name: 'Gopay Account' };
              
              const newData = {
                  enabled: true,
                  merchantId: merchant.id,
                  merchantName: merchant.name,
                  accessToken: res.data.access_token || '',
                  refreshToken: res.data.refresh_token || '',
                  xUniqueId: res.data.x_uniqueid || form.xUniqueId,
                  apiKey: form.apiKey,
                  phoneNumber: form.phoneNumber,
                  qrisString: form.qrisString || ''
              };
              
              const updates: any = { 
                  'payments.gopay': newData 
              };
              
              if (newData.enabled) {
                  updates['payments.orderkuota.enabled'] = false;
                  updates['payments.shopeepay.enabled'] = false;
              }

              const resAction = await updateSystemSettingsAction(updates);
              if (!resAction.success) {
                  throw new Error(resAction.message || "Gagal menyimpan ke Firestore via Admin SDK.");
              }

              await loadServerSettings();
              
              setIsDialogOpen(false);
              setStep('settings');
              setMutations(null);
              toast({ title: "Berhasil Terhubung! 🎉", description: `Akun ${merchant.name} siap digunakan.` });
          } else {
              toast({ variant: "destructive", title: "Gagal Verifikasi", description: res.message || "Kode OTP salah." });
          }
      } catch (err: any) {
          toast({ variant: "destructive", title: "Error", description: err.message });
      } finally {
          setIsProcessing(false);
      }
  };

  const handleSaveSettings = async () => {
    setIsProcessing(true);
    try {
        const updates: any = {
            'payments.gopay.qrisString': form.qrisString,
            'payments.gopay.enabled': form.enabled,
        };

        if (form.enabled) {
            updates['payments.orderkuota.enabled'] = false;
            updates['payments.shopeepay.enabled'] = false;
        }

        const resAction = await updateSystemSettingsAction(updates);
        if (!resAction.success) {
            throw new Error(resAction.message || "Gagal menyimpan pengaturan.");
        }
        await loadServerSettings();
        toast({ title: "Tersimpan ✨", description: "Pengaturan QRIS GoBiz telah diperbarui." });
        setIsDialogOpen(false);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Gagal", description: error.message || "Gagal menyimpan pengaturan." });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDisconnect = async () => {
    setIsProcessing(true);
    try {
        const resAction = await updateSystemSettingsAction({
            'payments.gopay': null
        });
        if (!resAction.success) {
            throw new Error(resAction.message || "Gagal memutuskan koneksi.");
        }
        await loadServerSettings();
        setMutations([]);
        toast({ title: "Terputus", description: "Koneksi akun Gopay Merchant telah dihapus." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Gagal", description: error.message || "Gagal memutuskan koneksi." });
    } finally {
        setIsProcessing(false);
    }
  };

  const formatIDR = (val: any) => {
    const cleanVal = String(val).replace(/[^0-9]/g, '');
    const amount = parseInt(cleanVal) || 0;
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0 
    }).format(amount);
  };

  const openSettings = () => {
      if (isConnected) {
          setStep('settings');
      } else {
          setStep('init');
      }
      setIsDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden pb-32">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 sm:border-3 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md text-black dark:text-white transition-colors w-full">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-sky text-black border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
            <Wallet className="w-3.5 h-3.5 text-black stroke-[3]" /> CHANNEL GOPAY GOBIZ
          </div>
          <h1 className="font-headline font-black text-xl sm:text-3xl text-black dark:text-white tracking-tight">
            GoPay Merchant Integration
          </h1>
          <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
            Monitoring mutasi pembayaran real-time melalui integrasi GoBiz Bridge API.
          </p>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
               <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchMutations} 
                  disabled={isFetchingMutations}
                  className="h-9 sm:h-10 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-yellow text-black dark:text-white shadow-neo-sm gap-1.5"
              >
                  <RefreshCw className={cn("h-3.5 w-3.5 stroke-[3]", isFetchingMutations && "animate-spin")} />
                  Refresh
              </Button>
              <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openSettings}
                  className="h-9 sm:h-10 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-sky text-black dark:text-white shadow-neo-sm gap-1.5"
              >
                  <Settings className="h-3.5 w-3.5 stroke-[3]" />
                  Pengaturan
              </Button>
              <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={isProcessing}
                  onClick={handleDisconnect}
                  className="h-9 sm:h-10 rounded-xl border-2 border-black dark:border-zinc-700 bg-neo-coral text-white hover:bg-rose-600 font-headline font-black text-xs shadow-neo-sm gap-1.5"
              >
                  <XCircle className="h-3.5 w-3.5 stroke-[3]" />
                  Putuskan
              </Button>
          </div>
        )}
      </div>

      {isConnected ? (
        <div className="space-y-6 w-full max-w-full overflow-hidden">
            <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white w-full">
                <CardHeader className="p-4 sm:p-5 flex flex-row items-center gap-4 space-y-0 bg-[#FFFDF5] dark:bg-zinc-800">
                    <div className="h-10 w-10 rounded-xl bg-neo-green text-black border-2 border-black shadow-neo-sm flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5 stroke-[3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-xs sm:text-sm font-headline font-black text-black dark:text-white truncate">Koneksi Aktif GoBiz</CardTitle>
                        <CardDescription className="text-[11px] font-bold text-black/70 dark:text-zinc-300 truncate">Merchant: <strong className="text-black bg-neo-yellow px-1.5 py-0.5 border border-black rounded">{settings?.payments?.gopay?.merchantName}</strong></CardDescription>
                    </div>
                    {!settings?.payments?.gopay?.enabled && <span className="bg-neo-coral text-white border border-black px-2 py-0.5 rounded font-black text-[10px] uppercase shrink-0">NONAKTIF</span>}
                </CardHeader>
            </Card>

            <div className="space-y-3 w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-2 px-1">
                    <History className="h-4 w-4 text-black dark:text-white stroke-[3]" />
                    <h3 className="font-headline font-black text-sm sm:text-base text-black dark:text-white">Riwayat Transaksi GoPay</h3>
                </div>
                
                <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white w-full max-w-full">
                    <CardContent className="p-0 w-full max-w-full overflow-x-auto">
                        {isFetchingMutations || mutations === null ? (
                            <div className="p-4 space-y-3">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl bg-black/10 dark:bg-zinc-800" />)}
                            </div>
                        ) : mutations.length > 0 ? (
                            <Table className="w-full text-xs">
                                <TableHeader className="bg-neo-cream dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="py-3 px-3 sm:px-4 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200 hidden sm:table-cell">Waktu</TableHead>
                                        <TableHead className="py-3 px-3 sm:px-4 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Pelanggan / Detail</TableHead>
                                        <TableHead className="py-3 px-3 sm:px-4 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Nominal</TableHead>
                                        <TableHead className="py-3 px-3 sm:px-4 text-center font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mutations.map((item, index) => {
                                        const type = (item.type || 'IN').toUpperCase();
                                        const isIncoming = type === 'IN' || type === 'KREDIT' || type === 'CR';
                                        return (
                                            <TableRow key={item.trx_id || index} className="border-b-2 border-black/10 dark:border-zinc-800 last:border-none hover:bg-[#FFFDF5] dark:hover:bg-zinc-800/60 transition-colors">
                                                <TableCell className="py-3 px-3 sm:px-4 text-[11px] font-bold text-black/70 dark:text-zinc-300 whitespace-nowrap hidden sm:table-cell">
                                                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' • ' + new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </TableCell>
                                                <TableCell className="py-3 px-3 sm:px-4">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className={cn(
                                                            "p-1 rounded-lg border border-black shadow-neo-sm shrink-0",
                                                            isIncoming ? "bg-neo-green text-black" : "bg-neo-coral text-white"
                                                        )}>
                                                            {isIncoming ? <ArrowDownLeft className="h-3.5 w-3.5 stroke-[3]" /> : <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" />}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-xs font-bold text-black dark:text-white truncate max-w-[110px] xs:max-w-[160px] sm:max-w-xs">{item.customer_name || 'Transaksi GoPay'}</span>
                                                            <span className="text-[9px] text-black/60 dark:text-zinc-400 font-mono truncate">{item.trx_id || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className={cn(
                                                    "py-3 px-3 sm:px-4 text-right font-headline font-black text-xs sm:text-sm whitespace-nowrap",
                                                    isIncoming ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                                )}>
                                                    {isIncoming ? '+' : '-'}{formatIDR(item.amount)}
                                                </TableCell>
                                                <TableCell className="py-3 px-3 sm:px-4 text-center">
                                                    <span className={cn(
                                                        "text-[9px] sm:text-[10px] font-headline font-black px-2 py-0.5 rounded-lg border border-black shadow-neo-sm uppercase tracking-wider inline-block whitespace-nowrap",
                                                        item.status === 'paid' || item.status === 'SUCCESS' ? "bg-neo-green text-black" : "bg-neo-yellow text-black"
                                                    )}>
                                                        {item.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-16 text-center flex flex-col items-center gap-2 bg-[#FFFDF5] dark:bg-zinc-900">
                                <div className="p-3 bg-neo-yellow text-black border-2 border-black rounded-2xl shadow-neo-sm">
                                    <Wallet className="h-6 w-6 stroke-[2.5]" />
                                </div>
                                <div>
                                    <p className="font-headline font-black text-xs text-black dark:text-white">Tidak Ada Mutasi Transaksi</p>
                                    <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400 mt-0.5">Gunakan tombol Refresh untuk memeriksa transaksi terbaru.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center border-2 border-dashed border-black dark:border-zinc-700 rounded-3xl bg-[#FFFDF5] dark:bg-zinc-900 p-5 sm:p-6 space-y-4 w-full">
            <div className="h-14 w-14 rounded-2xl bg-neo-sky border-2 border-black shadow-neo-sm flex items-center justify-center text-black">
                <Wallet className="h-7 w-7 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-headline font-black text-black dark:text-white">Hubungkan Gopay GoBiz Merchant</h3>
              <p className="text-xs font-bold text-black/70 dark:text-zinc-300 mt-1 max-w-sm leading-relaxed">
                  Login dengan nomor telepon GoBiz Anda untuk mengaktifkan pemantauan mutasi QRIS otomatis.
              </p>
            </div>
            
            <div className="pt-2">
                <Button onClick={openSettings} className="h-11 sm:h-12 border-2 sm:border-3 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs sm:text-sm shadow-neo-md hover:shadow-neo-lg rounded-xl px-8 transition-all flex items-center gap-2">
                    <Plus className="h-4 w-4 stroke-[3]" />
                    Hubungkan Akun GoBiz
                </Button>
            </div>
        </div>
      )}

      {/* Login / Settings Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[calc(100vw-32px)] max-w-[420px] max-h-[85vh] p-0 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-neo-lg flex flex-col overflow-hidden">
              {/* Fixed Header */}
              <DialogHeader className="p-4 sm:p-5 pb-3 bg-[#FFFDF5] dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700 space-y-1 shrink-0">
                  <DialogTitle className="text-base font-headline font-black text-black dark:text-white">
                      {step === 'settings' ? 'Pengaturan Engine GoBiz' : 'Otentikasi GoBiz Merchant'}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">
                      {step === 'settings' ? 'Atur status aktif dan QRIS string.' : 'Masukan nomor HP terdaftar di aplikasi GoBiz.'}
                  </DialogDescription>
              </DialogHeader>

              {/* Scrollable Content Body */}
              <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto min-h-0">
                  {step === 'init' && (
                      <div className="space-y-4">
                          <div className="space-y-1">
                              <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Nomor Handphone GoBiz</Label>
                              <div className="relative">
                                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-black dark:text-zinc-400 stroke-[2.5]" />
                                  <Input 
                                      placeholder="08xxxxxxxxxx" 
                                      value={form.phoneNumber}
                                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                      className="h-10 pl-9 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs rounded-xl shadow-neo-sm"
                                  />
                              </div>
                          </div>
                          <Button onClick={handleRequestOtp} disabled={isProcessing} className="w-full h-11 border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs shadow-neo-sm hover:shadow-neo rounded-xl flex items-center justify-center gap-2">
                              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : 'Kirim Kode OTP'}
                          </Button>
                      </div>
                  )}

                  {step === 'otp' && (
                      <div className="space-y-4">
                          <div className="p-3 bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl text-center shadow-neo-sm">
                              <p className="text-xs font-headline font-black text-black dark:text-white">OTP dikirim ke {form.phoneNumber}</p>
                          </div>
                          <div className="space-y-1">
                              <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Kode OTP (4 Digits)</Label>
                              <div className="relative">
                                  <MessageSquareText className="absolute left-3 top-3 h-4 w-4 text-black dark:text-zinc-400 stroke-[2.5]" />
                                  <Input 
                                      placeholder="1234" 
                                      maxLength={6}
                                      value={form.otpCode}
                                      onChange={(e) => setForm({ ...form, otpCode: e.target.value })}
                                      className="h-10 pl-9 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs rounded-xl shadow-neo-sm"
                                  />
                              </div>
                          </div>
                          <Button onClick={handleVerifyOtp} disabled={isProcessing} className="w-full h-11 border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs shadow-neo-sm hover:shadow-neo rounded-xl flex items-center justify-center gap-2">
                              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : 'Verifikasi OTP & Hubungkan'}
                          </Button>
                      </div>
                  )}

                  {step === 'settings' && (
                      <div className="space-y-4">
                          <div className="flex items-center justify-between p-3.5 bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm">
                              <div className="space-y-0.5">
                                  <Label className="text-xs font-headline font-black text-black dark:text-white">Layanan Aktif</Label>
                                  <p className="text-[10px] font-bold text-black/70 dark:text-zinc-300">Aktifkan integrasi mutasi GoBiz.</p>
                              </div>
                              <Switch 
                                  checked={form.enabled} 
                                  onCheckedChange={(val) => setForm({ ...form, enabled: val })}
                                  className="data-[state=checked]:bg-neo-yellow border-2 border-black dark:border-zinc-700"
                              />
                          </div>

                          <div className="space-y-1">
                              <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">QRIS Static String (Optional)</Label>
                              <Textarea 
                                  placeholder="000201010211266..." 
                                  value={form.qrisString}
                                  onChange={(e) => setForm({ ...form, qrisString: e.target.value })}
                                  className="min-h-[80px] bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-mono text-xs rounded-xl shadow-neo-sm"
                              />
                          </div>

                          <Button onClick={handleSaveSettings} disabled={isProcessing} className="w-full h-11 border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs shadow-neo-sm hover:shadow-neo rounded-xl flex items-center justify-center gap-2">
                              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : 'Simpan Pengaturan'}
                          </Button>
                      </div>
                  )}
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
