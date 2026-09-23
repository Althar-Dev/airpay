'use client';

import { useState, useEffect, useCallback } from "react";
import { doc } from "firebase/firestore";
import { 
  ShoppingBag, 
  Settings, 
  RefreshCw, 
  History, 
  ArrowDownLeft, 
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Plus,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoc, useFirebase, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { getShopeeMutations, ShopeeMutationItem } from "@/lib/payment/shopeepay";
import { cn } from "@/lib/utils";

export default function ShopeePayConfigPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settings } = useDoc<{ 
    payments?: {
        shopeepay: { 
            enabled: boolean, 
            token: string,
            qrisString?: string,
            merchantName?: string
        }
    }
  }>(settingsRef);

  const [localConfig, setLocalConfig] = useState({
    enabled: false,
    token: '',
    qrisString: ''
  });

  const [mutations, setMutations] = useState<ShopeeMutationItem[]>([]);
  const [isFetchingMutations, setIsFetchingMutations] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.payments?.shopeepay) {
      setLocalConfig({
        enabled: settings.payments.shopeepay.enabled || false,
        token: settings.payments.shopeepay.token || '',
        qrisString: settings.payments.shopeepay.qrisString || ''
      });
    }
  }, [settings]);

  const isConnected = !!localConfig.token;

  const fetchMutations = useCallback(async (forcedToken?: string) => {
    const targetToken = forcedToken || localConfig.token;
    if (!targetToken) return;
    
    setIsFetchingMutations(true);
    try {
        const res = await getShopeeMutations(targetToken);
        if (res.success && res.data) {
            setMutations(res.data);
        } else if (!res.success && res.statusHttp === 401) {
            toast({ variant: "destructive", title: "Sesi Berakhir", description: "Token ShopeePay telah kadaluarsa." });
        }
    } catch (error: any) {
        console.error("Failed to fetch ShopeePay mutations:", error);
    } finally {
        setIsFetchingMutations(false);
    }
  }, [localConfig.token, toast]);

  useEffect(() => {
    if (settings?.payments?.shopeepay?.token && mutations.length === 0 && !isFetchingMutations) {
        fetchMutations(settings.payments.shopeepay.token);
    }
  }, [settings, mutations.length, isFetchingMutations, fetchMutations]);

  const handleSave = async () => {
    if (!settingsRef) return;
    setIsSaving(true);
    try {
        const updates: any = { 
          'payments.shopeepay': localConfig
        };

        if (localConfig.enabled) {
            updates['payments.gopay.enabled'] = false;
            updates['payments.orderkuota.enabled'] = false;
        }

        await updateDocumentNonBlocking(settingsRef, updates);
        toast({ title: "Berhasil Disimpan! ✨", description: "Konfigurasi ShopeePay telah diperbarui." });
        setIsDialogOpen(false);
        fetchMutations();
    } catch (error) {
        toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan saat menyimpan." });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!settingsRef) return;
    try {
        await updateDocumentNonBlocking(settingsRef, { 'payments.shopeepay': null });
        setMutations([]);
        setLocalConfig({ enabled: false, token: '', qrisString: '' });
        toast({ title: "Terputus", description: "Koneksi ShopeePay telah dihapus." });
    } catch (error) {
        toast({ variant: "destructive", title: "Gagal", description: "Gagal memutuskan koneksi." });
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
  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden pb-32">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 sm:border-3 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md text-black dark:text-white transition-colors w-full">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-coral text-white border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5 text-white stroke-[3]" /> CHANNEL SHOPEEPAY
          </div>
          <h1 className="font-headline font-black text-xl sm:text-3xl text-black dark:text-white tracking-tight">
            ShopeePay Engine Integration
          </h1>
          <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
            Monitoring mutasi dan transaksi AirPay ShopeePay secara real-time.
          </p>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
               <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchMutations()} 
                  disabled={isFetchingMutations}
                  className="h-9 sm:h-10 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-yellow text-black dark:text-white shadow-neo-sm gap-1.5"
              >
                  <RefreshCw className={cn("h-3.5 w-3.5 stroke-[3]", isFetchingMutations && "animate-spin")} />
                  Refresh
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 sm:h-10 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-sky text-black dark:text-white shadow-neo-sm gap-1.5">
                          <Settings className="h-3.5 w-3.5 stroke-[3]" />
                          Pengaturan
                      </Button>
                  </DialogTrigger>
                  <ConfigDialogContent 
                      config={localConfig} 
                      onChange={setLocalConfig} 
                      onSave={handleSave} 
                      isSaving={isSaving} 
                  />
              </Dialog>
              <Button 
                  variant="ghost" 
                  size="sm" 
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
                    <div className="h-10 w-10 rounded-xl bg-neo-coral text-white border-2 border-black shadow-neo-sm flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5 stroke-[3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-xs sm:text-sm font-headline font-black text-black dark:text-white truncate">Status Koneksi ShopeePay Engine</CardTitle>
                        <CardDescription className="text-[11px] font-bold text-black/70 dark:text-zinc-300 truncate">Merchant: <strong className="text-black bg-neo-yellow px-1.5 py-0.5 border border-black rounded">{mutations[0]?.merchant_name || 'ShopeePay Merchant'}</strong></CardDescription>
                    </div>
                    {!localConfig.enabled && <span className="bg-neo-coral text-white border border-black px-2 py-0.5 rounded font-black text-[10px] uppercase shrink-0">NONAKTIF</span>}
                </CardHeader>
            </Card>

            <div className="space-y-3 w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-2 px-1">
                    <History className="h-4 w-4 text-black dark:text-white stroke-[3]" />
                    <h3 className="font-headline font-black text-sm sm:text-base text-black dark:text-white">Riwayat Mutasi ShopeePay</h3>
                </div>

                <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white w-full max-w-full">
                    <CardContent className="p-0 w-full max-w-full overflow-x-auto">
                        {isFetchingMutations ? (
                            <div className="p-4 space-y-3">
                                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl bg-black/10 dark:bg-zinc-800" />)}
                            </div>
                        ) : mutations.length > 0 ? (
                            <Table className="w-full text-xs">
                                <TableHeader className="bg-neo-cream dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="py-3 px-3 sm:px-4 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200 hidden sm:table-cell">Waktu</TableHead>
                                        <TableHead className="py-3 px-3 sm:px-4 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Detail Transaksi</TableHead>
                                        <TableHead className="py-3 px-3 sm:px-4 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Nominal</TableHead>
                                        <TableHead className="py-3 px-3 sm:px-4 text-center font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Tipe</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mutations.map((item, index) => {
                                        const dir = item.direction?.trim().toUpperCase();
                                        const type = item.type?.trim().toUpperCase();
                                        const isOutgoing = dir === 'OUT' || dir === 'DEBIT' || type === 'DB' || type === 'DEBIT';
                                        const isIncoming = !isOutgoing;
                                        return (
                                            <TableRow key={item.transaction_id || index} className="border-b-2 border-black/10 dark:border-zinc-800 last:border-none hover:bg-[#FFFDF5] dark:hover:bg-zinc-800/60 transition-colors">
                                                <TableCell className="py-3 px-3 sm:px-4 text-[11px] font-bold text-black/70 dark:text-zinc-300 whitespace-nowrap hidden sm:table-cell">
                                                    {item.created_at || '-'}
                                                </TableCell>
                                                <TableCell className="py-3 px-3 sm:px-4">
                                                    <span className="text-xs font-bold text-black dark:text-white truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs block">{item.reference_id || item.transaction_id || 'ShopeePay Transaction'}</span>
                                                </TableCell>
                                                <TableCell className={cn(
                                                    "py-3 px-3 sm:px-4 text-right font-headline font-black text-xs sm:text-sm whitespace-nowrap",
                                                    isIncoming ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                                )}>
                                                    {isIncoming ? '+' : '-'}{formatIDR(item.amount)}
                                                </TableCell>
                                                <TableCell className="py-3 px-3 sm:px-4 text-center">
                                                     <div className={cn(
                                                        "inline-flex p-1 rounded-lg border border-black shadow-neo-sm",
                                                        isIncoming ? "bg-neo-green text-black" : "bg-neo-coral text-white"
                                                     )}>
                                                        {isIncoming ? <ArrowDownLeft className="h-3.5 w-3.5 stroke-[3]" /> : <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" />}
                                                     </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-16 text-center flex flex-col items-center gap-2 bg-[#FFFDF5] dark:bg-zinc-900">
                                <div className="p-3 bg-neo-coral text-white border-2 border-black rounded-2xl shadow-neo-sm">
                                    <ShoppingBag className="h-6 w-6 stroke-[2.5]" />
                                </div>
                                <div>
                                    <p className="font-headline font-black text-xs text-black dark:text-white">Tidak Ada Mutasi Ditemukan</p>
                                    <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400 mt-0.5">Gunakan tombol Refresh untuk menarik data mutasi terbaru.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center border-2 border-dashed border-black dark:border-zinc-700 rounded-3xl bg-[#FFFDF5] dark:bg-zinc-900 p-5 sm:p-6 space-y-4 w-full">
            <div className="h-14 w-14 rounded-2xl bg-neo-coral text-white border-2 border-black shadow-neo-sm flex items-center justify-center">
                <ShoppingBag className="h-7 w-7 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-headline font-black text-black dark:text-white">Hubungkan ShopeePay Engine</h3>
              <p className="text-xs font-bold text-black/70 dark:text-zinc-300 mt-1 max-w-sm leading-relaxed">
                  Lengkapi token sesi ShopeePay AirPay Anda untuk mengaktifkan pemantauan mutasi QRIS otomatis.
              </p>
            </div>
            
            <div className="pt-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 sm:h-12 border-2 sm:border-3 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs sm:text-sm shadow-neo-md hover:shadow-neo-lg rounded-xl px-8 transition-all flex items-center gap-2">
                            <Plus className="h-4 w-4 stroke-[3]" />
                            Hubungkan Token ShopeePay
                        </Button>
                    </DialogTrigger>
                    <ConfigDialogContent 
                        config={localConfig} 
                        onChange={setLocalConfig} 
                        onSave={handleSave} 
                        isSaving={isSaving} 
                    />
                </Dialog>
            </div>
        </div>
      )}
    </div>
  );
}

function ConfigDialogContent({ config, onChange, onSave, isSaving }: { 
    config: any, 
    onChange: (val: any) => void, 
    onSave: () => void,
    isSaving: boolean
}) {
    const [showToken, setShowToken] = useState(false);

    return (
        <DialogContent className="w-[calc(100vw-32px)] max-w-[420px] max-h-[85vh] p-0 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-neo-lg flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <DialogHeader className="p-4 sm:p-5 pb-3 bg-[#FFFDF5] dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700 space-y-1 shrink-0">
                <DialogTitle className="text-base font-headline font-black text-black dark:text-white">Pengaturan Engine ShopeePay</DialogTitle>
                <DialogDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Lengkapi token otentikasi AirPay ShopeePay Anda.</DialogDescription>
            </DialogHeader>
            
            {/* Scrollable Content Body */}
            <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto min-h-0">
                <div className="flex items-center justify-between p-3.5 bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm">
                    <div className="space-y-0.5">
                        <Label className="text-xs font-headline font-black text-black dark:text-white">Layanan Aktif</Label>
                        <p className="text-[10px] font-bold text-black/70 dark:text-zinc-300">Aktifkan sinkronisasi mutasi ShopeePay.</p>
                    </div>
                    <Switch 
                        checked={config.enabled} 
                        onCheckedChange={(val) => onChange({ ...config, enabled: val })}
                        className="data-[state=checked]:bg-neo-yellow border-2 border-black dark:border-zinc-700"
                    />
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">AirPay Session Token</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowToken(!showToken)}
                                className="h-6 px-2 text-[10px] font-bold text-black/70 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center gap-1"
                            >
                                {showToken ? <EyeOff className="w-3 h-3 stroke-[2.5]" /> : <Eye className="w-3 h-3 stroke-[2.5]" />}
                                {showToken ? 'Sembunyikan' : 'Tampilkan'}
                            </Button>
                        </div>
                        <Textarea 
                            placeholder="Tempel token AirPay ShopeePay di sini..." 
                            value={showToken ? config.token : (config.token ? '•'.repeat(Math.min(config.token.length, 36)) : '')}
                            onChange={(e) => {
                                if (showToken) {
                                    onChange({ ...config, token: e.target.value });
                                }
                            }}
                            readOnly={!showToken && !!config.token}
                            onClick={() => {
                                if (!showToken && config.token) setShowToken(true);
                            }}
                            className={cn(
                                "min-h-[80px] bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-mono text-xs rounded-xl shadow-neo-sm transition-all",
                                !showToken && config.token && "tracking-widest cursor-pointer opacity-80"
                            )}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">QRIS Static String (Optional)</Label>
                        <Textarea 
                            placeholder="000201010211266..." 
                            value={config.qrisString}
                            onChange={(e) => onChange({ ...config, qrisString: e.target.value })}
                            className="min-h-[80px] bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-mono text-xs rounded-xl shadow-neo-sm"
                        />
                    </div>
                </div>

                <div className="p-3 bg-neo-coral/10 dark:bg-rose-950/40 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm">
                    <p className="text-[10px] font-bold text-black/80 dark:text-zinc-300 leading-relaxed flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-black dark:text-white shrink-0 stroke-[2.5]" />
                        <strong>Keamanan:</strong> Token disimpan dengan enkripsi aman di database Firebase Firestore.
                    </p>
                </div>
            </div>

            {/* Fixed Footer */}
            <DialogFooter className="p-4 sm:p-5 bg-[#FFFDF5] dark:bg-zinc-800 border-t-2 border-black dark:border-zinc-700 shrink-0">
                <Button onClick={onSave} disabled={isSaving} className="w-full h-11 border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs shadow-neo-sm hover:shadow-neo rounded-xl flex items-center justify-center gap-2">
                    {isSaving && <RefreshCw className="h-4 w-4 animate-spin stroke-[3]" />}
                    Simpan Konfigurasi
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
