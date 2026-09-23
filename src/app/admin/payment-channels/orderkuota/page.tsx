'use client';

import { useState, useEffect, useCallback } from "react";
import { doc } from "firebase/firestore";
import {
    QrCode,
    Settings,
    RefreshCw,
    History,
    ArrowDownLeft,
    ArrowUpRight,
    CheckCircle2,
    XCircle,
    Plus,
    ShieldCheck
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getOrderkuotaMutations, OrderkuotaMutationResult } from "@/lib/payment/orderkuota";
import { cn } from "@/lib/utils";

export default function OrderkuotaConfigPage() {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
    const { data: settings } = useDoc<{
        payments?: {
            orderkuota: {
                enabled: boolean,
                username: string,
                memberID?: string,
                qrisString: string,
                token: string,
                pin?: string,
                password?: string,
            }
        }
    }>(settingsRef);

    const [localConfig, setLocalConfig] = useState({
        enabled: false,
        username: '',
        memberID: '',
        qrisString: '',
        token: '',
        pin: '',
        password: ''
    });

    const [mutations, setMutations] = useState<OrderkuotaMutationResult[]>([]);
    const [isFetchingMutations, setIsFetchingMutations] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (settings?.payments?.orderkuota) {
            setLocalConfig({
                enabled: settings.payments.orderkuota.enabled || false,
                username: settings.payments.orderkuota.username || '',
                memberID: (settings.payments.orderkuota as any).memberID || '',
                qrisString: settings.payments.orderkuota.qrisString || '',
                token: settings.payments.orderkuota.token || '',
                pin: (settings.payments.orderkuota as any).pin || '',
                password: (settings.payments.orderkuota as any).password || ''
            });
        }
    }, [settings]);

    const isConnected = !!localConfig.username && !!localConfig.token;

    const fetchMutations = useCallback(async (forcedUsername?: string, forcedToken?: string) => {
        const targetUsername = forcedUsername || localConfig.username;
        const targetToken = forcedToken || localConfig.token;

        if (!targetUsername || !targetToken) return;

        setIsFetchingMutations(true);
        try {
            const res = await getOrderkuotaMutations(targetUsername, targetToken);
            if (res.status && res.result) {
                setMutations(res.result);
            }
        } catch (error: any) {
            console.error("Failed to fetch Orderkuota mutations:", error);
        } finally {
            setIsFetchingMutations(false);
        }
    }, [localConfig.username, localConfig.token]);

    useEffect(() => {
        if (settings?.payments?.orderkuota?.username && settings?.payments?.orderkuota?.token && mutations.length === 0 && !isFetchingMutations) {
            fetchMutations(settings.payments.orderkuota.username, settings.payments.orderkuota.token);
        }
    }, [settings, mutations.length, isFetchingMutations, fetchMutations]);

    const handleSave = async () => {
        if (!settingsRef) return;
        setIsSaving(true);
        try {
            const updates: any = {
                'payments.orderkuota': localConfig
            };

            if (localConfig.enabled) {
                updates['payments.gopay.enabled'] = false;
                updates['payments.shopeepay.enabled'] = false;
            }

            await updateDocumentNonBlocking(settingsRef, updates);
            toast({
                title: "Berhasil Disimpan! ✨",
                description: "Konfigurasi engine Orderkuota telah diperbarui.",
            });
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
            await updateDocumentNonBlocking(settingsRef, {
                'payments.orderkuota': null
            });
            setMutations([]);
            setLocalConfig({ enabled: false, username: '', token: '', qrisString: '' });
            toast({ title: "Terputus", description: "Koneksi Orderkuota telah dihapus." });
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
                    <div className="inline-flex items-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
                        <QrCode className="w-3.5 h-3.5 text-black stroke-[3]" /> CHANNEL PAYMENT ORDERKUOTA
                    </div>
                    <h1 className="font-headline font-black text-xl sm:text-3xl text-black dark:text-white tracking-tight">
                        Orderkuota Engine Integration
                    </h1>
                    <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
                        Integrasi mutasi otomatis dan sinkronisasi QRIS dinamis via provider Orderkuota.
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
                            <div className="h-10 w-10 rounded-xl bg-neo-green text-black border-2 border-black shadow-neo-sm flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-5 w-5 stroke-[3]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-xs sm:text-sm font-headline font-black text-black dark:text-white truncate">Status Koneksi Orderkuota Engine</CardTitle>
                                <CardDescription className="text-[11px] font-bold text-black/70 dark:text-zinc-300 truncate">User: <strong className="text-black bg-neo-yellow px-1.5 py-0.5 border border-black rounded">{localConfig.username}</strong></CardDescription>
                            </div>
                            {!localConfig.enabled && <span className="bg-neo-coral text-white border border-black px-2 py-0.5 rounded font-black text-[10px] uppercase shrink-0">NONAKTIF</span>}
                        </CardHeader>
                    </Card>

                    <div className="space-y-3 w-full max-w-full overflow-hidden">
                        <div className="flex items-center gap-2 px-1">
                            <History className="h-4 w-4 text-black dark:text-white stroke-[3]" />
                            <h3 className="font-headline font-black text-sm sm:text-base text-black dark:text-white">Mutasi Real-time Orderkuota</h3>
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
                                                <TableHead className="py-3 px-3 sm:px-4 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Keterangan Mutasi</TableHead>
                                                <TableHead className="py-3 px-3 sm:px-4 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Nominal</TableHead>
                                                <TableHead className="py-3 px-3 sm:px-4 text-center font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Tipe</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mutations.map((item, index) => {
                                                const isIncoming = item.status?.trim().toUpperCase() === 'IN';
                                                return (
                                                    <TableRow key={`${item.id || index}-${item.tanggal}`} className="border-b-2 border-black/10 dark:border-zinc-800 last:border-none hover:bg-[#FFFDF5] dark:hover:bg-zinc-800/60 transition-colors">
                                                        <TableCell className="py-3 px-3 sm:px-4 text-[11px] font-bold text-black/70 dark:text-zinc-300 whitespace-nowrap hidden sm:table-cell">
                                                            {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' • ' + new Date(item.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                        </TableCell>
                                                        <TableCell className="py-3 px-3 sm:px-4">
                                                            <span className="text-xs font-bold text-black dark:text-white truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs block">{item.keterangan || 'Transaksi QRIS'}</span>
                                                        </TableCell>
                                                        <TableCell className={cn(
                                                            "py-3 px-3 sm:px-4 text-right font-headline font-black text-xs sm:text-sm whitespace-nowrap",
                                                            isIncoming ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                                        )}>
                                                            {isIncoming ? '+' : '-'}{formatIDR(isIncoming ? item.kredit : item.debet)}
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
                                        <div className="p-3 bg-neo-yellow text-black border-2 border-black rounded-2xl shadow-neo-sm">
                                            <QrCode className="h-6 w-6 stroke-[2.5]" />
                                        </div>
                                        <div>
                                            <p className="font-headline font-black text-xs text-black dark:text-white">Tidak Ada Mutasi Ditemukan</p>
                                            <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400 mt-0.5">Gunakan tombol Refresh Mutasi untuk menarik data terbaru.</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center border-2 border-dashed border-black dark:border-zinc-700 rounded-3xl bg-[#FFFDF5] dark:bg-zinc-900 p-5 sm:p-6 space-y-4 w-full">
                    <div className="h-14 w-14 rounded-2xl bg-neo-yellow border-2 border-black shadow-neo-sm flex items-center justify-center text-black">
                        <QrCode className="h-7 w-7 stroke-[2.5]" />
                    </div>
                    <div>
                        <h3 className="text-base font-headline font-black text-black dark:text-white">Hubungkan Engine Orderkuota</h3>
                        <p className="text-xs font-bold text-black/70 dark:text-zinc-300 mt-1 max-w-sm leading-relaxed">
                            Lengkapi username & token Orderkuota untuk mengaktifkan fitur mutasi otomatis QRIS.
                        </p>
                    </div>

                    <div className="pt-2">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-11 sm:h-12 border-2 sm:border-3 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs sm:text-sm shadow-neo-md hover:shadow-neo-lg rounded-xl px-8 transition-all flex items-center gap-2">
                                    <Plus className="h-4 w-4 stroke-[3]" />
                                    Hubungkan Akun Orderkuota
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
    return (
        <DialogContent className="w-[calc(100vw-32px)] max-w-[420px] max-h-[85vh] p-0 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-neo-lg flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <DialogHeader className="p-4 sm:p-5 pb-3 bg-[#FFFDF5] dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700 space-y-1 shrink-0">
                <DialogTitle className="text-base font-headline font-black text-black dark:text-white">Pengaturan Engine Orderkuota</DialogTitle>
                <DialogDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Lengkapi kredensial untuk sinkronisasi mutasi otomatis.</DialogDescription>
            </DialogHeader>

            {/* Scrollable Content Body */}
            <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto min-h-0">
                <div className="flex items-center justify-between p-3.5 bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm">
                    <div className="space-y-0.5">
                        <Label className="text-xs font-headline font-black text-black dark:text-white">Status Layanan Active</Label>
                        <p className="text-[10px] font-bold text-black/70 dark:text-zinc-300">Aktifkan sinkronisasi mutasi otomatis.</p>
                    </div>
                    <Switch
                        checked={config.enabled}
                        onCheckedChange={(val) => onChange({ ...config, enabled: val })}
                        className="data-[state=checked]:bg-neo-yellow border-2 border-black dark:border-zinc-700"
                    />
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Member ID Transaksi H2H</Label>
                        <Input
                            placeholder="Kode Member H2H (Contoh: OK2498473)"
                            value={config.memberID || ''}
                            onChange={(e) => onChange({ ...config, memberID: e.target.value })}
                            className="h-10 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs rounded-xl shadow-neo-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Username Web Mutasi Orderkuota</Label>
                        <Input
                            placeholder="Username Web (Contoh: althardev)"
                            value={config.username || ''}
                            onChange={(e) => onChange({ ...config, username: e.target.value })}
                            className="h-10 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs rounded-xl shadow-neo-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">PIN Transaksi IP H2H</Label>
                        <Input
                            type="password"
                            placeholder="PIN Transaksi IP H2H (Contoh: 123456)"
                            value={config.pin || ''}
                            onChange={(e) => onChange({ ...config, pin: e.target.value })}
                            className="h-10 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs rounded-xl shadow-neo-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Password Transaksi IP H2H</Label>
                        <Input
                            type="password"
                            placeholder="Password yang disetting ketika mendaftar IP H2H"
                            value={config.password || ''}
                            onChange={(e) => onChange({ ...config, password: e.target.value })}
                            className="h-10 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs rounded-xl shadow-neo-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Token Web Mutasi Orderkuota</Label>
                        <Input
                            type="password"
                            placeholder="Token auth mutasi dari portal Orderkuota"
                            value={config.token || ''}
                            onChange={(e) => onChange({ ...config, token: e.target.value })}
                            className="h-10 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs rounded-xl shadow-neo-sm"
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

                <div className="p-3 bg-neo-sky/10 dark:bg-sky-950/40 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm">
                    <p className="text-[10px] font-bold text-black/80 dark:text-zinc-300 leading-relaxed flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-black dark:text-white shrink-0 stroke-[2.5]" />
                        <strong>Keamanan:</strong> Kunci STSPointKey dikelola secara rahasia di backend server AirPay.
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
