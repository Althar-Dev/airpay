'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, Settings2, ShieldAlert, Sliders, Landmark, Smartphone, ArrowUpRight, Percent, CreditCard, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { updateSystemSettingsAction } from "@/app/admin/actions";

export default function AdminSettingsPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settings, isLoading } = useDoc<{
    maintenanceMode: boolean,
    minWithdrawal?: number,
    mdrFee?: number,
    bankFee?: number,
    ewalletFee?: number,
  }>(settingsRef);

  const [localSettings, setLocalSettings] = useState({
    minWithdrawal: 10000,
    mdrFee: 0.7,
    bankFee: 3500,
    ewalletFee: 2000,
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        minWithdrawal: settings.minWithdrawal ?? 10000,
        mdrFee: settings.mdrFee ?? 0.7,
        bankFee: settings.bankFee ?? 3500,
        ewalletFee: settings.ewalletFee ?? 2000,
      });
    }
  }, [settings]);

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

  const handleToggleMaintenance = async (checked: boolean) => {
    const resAction = await updateSystemSettingsAction({ maintenanceMode: checked });
    if (resAction.success) {
      toast({
        title: checked ? "Maintenance Mode Aktif ⚠️" : "Maintenance Mode Nonaktif 🟢",
        description: checked ? "Akses publik seluruh merchant kini dibatasi." : "Akses publik seluruh merchant telah dipulihkan.",
        variant: checked ? "destructive" : "default",
      });
    } else {
      toast({ variant: "destructive", title: "Gagal", description: resAction.message });
    }
  };

  const handleSavePlatformConfig = async () => {
    const resAction = await updateSystemSettingsAction({
      minWithdrawal: Number(localSettings.minWithdrawal) || 10000,
      mdrFee: Number(localSettings.mdrFee) || 0.7,
      bankFee: Number(localSettings.bankFee) || 3500,
      ewalletFee: Number(localSettings.ewalletFee) || 2000,
    });
    if (resAction.success) {
      toast({
        title: "Konfigurasi Tersimpan! ✨",
        description: "Parameter platform & biaya penarikan AirPay telah diperbarui.",
      });
    } else {
      toast({ variant: "destructive", title: "Gagal", description: resAction.message });
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-32">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 sm:border-3 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md text-black dark:text-white transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-black stroke-[3]" /> KONFIGURASI SISTEM
          </div>
          <h1 className="font-headline font-black text-xl sm:text-3xl text-black dark:text-white tracking-tight">
            System Control & Parameter Platform
          </h1>
          <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
            Kelola status maintenance mode, tarif MDR, dan biaya penarikan (payout fee) Bank & E-Wallet platform.
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
        {/* Left Column: Maintenance Control Card */}
        <Card className="lg:col-span-4 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
          <CardHeader className="bg-neo-coral/10 dark:bg-rose-950/40 border-b-2 border-black dark:border-zinc-700 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-neo-coral border-2 border-black rounded-xl text-white shadow-neo-sm">
                <ShieldAlert className="h-4 w-4 stroke-[3]" />
              </span>
              <CardTitle className="font-headline font-black text-base sm:text-lg text-black dark:text-white">Mode Pemeliharaan</CardTitle>
            </div>
            <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Sakelar darurat pemeliharaan server platform.</CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-black dark:border-zinc-700 bg-[#FFFDF5] dark:bg-zinc-800 shadow-neo-sm gap-3">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="maintenance-mode" className="font-headline font-black text-xs sm:text-sm text-black dark:text-white cursor-pointer">Status Maintenance Mode</Label>
                <p className="text-[11px] font-bold text-black/70 dark:text-zinc-300">
                  Kunci portal & tampilkan pemeliharaan server.
                </p>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-10 rounded-full bg-black/10 dark:bg-zinc-800 shrink-0" />
              ) : (
                <Switch
                  id="maintenance-mode"
                  checked={settings?.maintenanceMode || false}
                  onCheckedChange={handleToggleMaintenance}
                  className="data-[state=checked]:bg-neo-coral border-2 border-black dark:border-zinc-700 shrink-0"
                />
              )}
            </div>
          </CardContent>

          <CardFooter className="bg-[#FFFDF5] dark:bg-zinc-800 border-t-2 border-black dark:border-zinc-700 p-4">
            <p className="text-[10px] font-extrabold text-black/70 dark:text-zinc-400 italic">
              *Perubahan status maintenance akan langsung dirasakan pengguna aktif secara real-time.
            </p>
          </CardFooter>
        </Card>

        {/* Right Column: Organized Parameter & Fee Settings */}
        <Card className="lg:col-span-8 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
          <CardHeader className="bg-[#FFFDF5] dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-neo-yellow border-2 border-black rounded-xl text-black shadow-neo-sm">
                <Settings2 className="h-4 w-4 stroke-[3]" />
              </span>
              <div>
                <CardTitle className="font-headline font-black text-base sm:text-lg text-black dark:text-white">Parameter Standar & Fee Platform</CardTitle>
                <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Konfigurasi batas pencairan, persentase MDR, dan tarif admin transfer.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Section 1: Limit Minimal & MDR Fee */}
            <div className="space-y-3">
              <h3 className="font-headline font-black text-xs uppercase tracking-wider text-black/60 dark:text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 stroke-[2.5]" /> Limit Transaksi & Persentase MDR
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Min Withdrawal */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-neo-yellow/20 dark:bg-amber-950/40 border-2 border-black dark:border-zinc-700 shadow-neo-sm">
                  <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200 flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-black dark:text-white stroke-[2.5]" /> Minimal Withdrawal (IDR)
                  </Label>
                  <Input
                    type="number"
                    value={localSettings.minWithdrawal}
                    onChange={(e) => setLocalSettings({ ...localSettings, minWithdrawal: Number(e.target.value) })}
                    className="h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-headline font-black text-sm rounded-xl shadow-neo-sm"
                  />
                  <p className="text-[11px] font-bold text-black/70 dark:text-zinc-300">
                    Ambang batas: <span className="font-mono font-black text-black dark:text-white">{formatIDR(localSettings.minWithdrawal)}</span>
                  </p>
                </div>

                {/* MDR Fee */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 shadow-neo-sm">
                  <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-black dark:text-white stroke-[2.5]" /> MDR Fee Platform (%)
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      value={localSettings.mdrFee}
                      onChange={(e) => setLocalSettings({ ...localSettings, mdrFee: Number(e.target.value) })}
                      className="h-11 pr-8 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-headline font-black text-sm rounded-xl shadow-neo-sm"
                    />
                    <span className="absolute right-3 top-3 font-black text-xs text-black dark:text-white">%</span>
                  </div>
                  <p className="text-[11px] font-bold text-black/70 dark:text-zinc-300">
                    Tarif default: <span className="font-headline font-black text-purple-900 dark:text-purple-300">{localSettings.mdrFee}% / transaksi</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Payout Fees (Bank & E-Wallet) */}
            <div className="space-y-3 pt-2 border-t-2 border-black/10 dark:border-zinc-800">
              <h3 className="font-headline font-black text-xs uppercase tracking-wider text-black/60 dark:text-zinc-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 stroke-[2.5]" /> Biaya Admin Pencairan Dana (Payout Fee)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bank Fee */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-neo-sky/20 dark:bg-sky-950/40 border-2 border-black dark:border-zinc-700 shadow-neo-sm">
                  <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-black dark:text-white stroke-[2.5]" /> Transfer Bank Fee (IDR)
                  </Label>
                  <Input
                    type="number"
                    value={localSettings.bankFee}
                    onChange={(e) => setLocalSettings({ ...localSettings, bankFee: Number(e.target.value) })}
                    className="h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-headline font-black text-sm rounded-xl shadow-neo-sm"
                  />
                  <p className="text-[11px] font-bold text-black/70 dark:text-zinc-300">
                    Tarif: <span className="font-mono font-black text-sky-900 dark:text-sky-300">{formatIDR(localSettings.bankFee)}</span> / transfer
                  </p>
                </div>

                {/* E-Wallet Fee */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-neo-green/20 dark:bg-emerald-950/40 border-2 border-black dark:border-zinc-700 shadow-neo-sm">
                  <Label className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-black dark:text-white stroke-[2.5]" /> E-Wallet Payout Fee (IDR)
                  </Label>
                  <Input
                    type="number"
                    value={localSettings.ewalletFee}
                    onChange={(e) => setLocalSettings({ ...localSettings, ewalletFee: Number(e.target.value) })}
                    className="h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-headline font-black text-sm rounded-xl shadow-neo-sm"
                  />
                  <p className="text-[11px] font-bold text-black/70 dark:text-zinc-300">
                    Tarif: <span className="font-mono font-black text-emerald-900 dark:text-emerald-300">{formatIDR(localSettings.ewalletFee)}</span> / transfer
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-[#FFFDF5] dark:bg-zinc-800 border-t-2 border-black dark:border-zinc-700 p-4">
            <Button onClick={handleSavePlatformConfig} disabled={isLoading} className="h-11 sm:h-12 border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs sm:text-sm shadow-neo-sm hover:shadow-neo rounded-xl w-full flex items-center justify-center gap-2">
              <Save className="h-4 w-4 stroke-[3]" />
              Simpan Seluruh Konfigurasi Platform
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
