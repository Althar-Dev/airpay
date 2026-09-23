'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Copy, Check, KeyRound, ShieldAlert, Code2, Lock, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoc, useFirebase, setDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const generateRandomString = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

type ApiKey = {
  id: string;
  merchantId: string;
  secretKey: string;
  createdAt: string;
};

export default function ApiKeysPage() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isRevealed, setIsRevealed] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch merchant data to get the custom merchantId
  const merchantDocRef = useMemoFirebase(() => user ? doc(firestore, 'merchants', user.uid) : null, [user, firestore]);
  const { data: merchantData } = useDoc<{ merchantId: string }>(merchantDocRef);

  const apiKeyRef = useMemoFirebase(() => user ? doc(firestore, 'merchants', user.uid, 'apiKeys', 'primary') : null, [user, firestore]);
  const { data: apiKey, isLoading } = useDoc<ApiKey>(apiKeyRef);

  // Create or sync key
  useEffect(() => {
    if (!isLoading && !apiKey && apiKeyRef && user && merchantData) {
      const secretKey = `QP-Key-${generateRandomString(32)}`;
      const newKey: ApiKey = {
        id: 'primary',
        merchantId: merchantData.merchantId || user.uid,
        secretKey: secretKey,
        createdAt: new Date().toISOString(),
      };

      // Save to merchant private collection
      setDocumentNonBlocking(apiKeyRef, newKey, { merge: true });

      // Also save to system keys index for fast API resolution
      const systemKeyRef = doc(firestore, 'system', `key_${secretKey}`);
      setDocumentNonBlocking(systemKeyRef, {
        merchantId: user.uid,
        secretKey: secretKey,
        createdAt: new Date().toISOString()
      }, { merge: true });

    } else if (apiKey?.secretKey && user) {
      // Continuous Sync: ensure the public index document exists
      const systemKeyRef = doc(firestore, 'system', `key_${apiKey.secretKey}`);
      setDocumentNonBlocking(systemKeyRef, {
        merchantId: user.uid,
        secretKey: apiKey.secretKey,
        createdAt: apiKey.createdAt || new Date().toISOString()
      }, { merge: true });
    }
  }, [isLoading, apiKey, apiKeyRef, user, merchantData, firestore]);

  const handleManualSync = async () => {
    if (!apiKey?.secretKey || !user) return;
    setIsSyncing(true);
    try {
      const systemKeyRef = doc(firestore, 'system', `key_${apiKey.secretKey}`);
      await setDocumentNonBlocking(systemKeyRef, {
        merchantId: user.uid,
        secretKey: apiKey.secretKey,
        createdAt: apiKey.createdAt || new Date().toISOString()
      }, { merge: true });

      toast({
        variant: "success",
        title: "Sinkronisasi Berhasil",
        description: "Kunci API Anda telah diaktifkan di server gateway.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Gagal Sinkronisasi",
        description: "Pastikan koneksi internet stabil dan coba lagi.",
      });
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      variant: "success",
      title: "Kunci Tersalin!",
      description: `${field} telah disalin ke clipboard Anda.`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="w-full space-y-6 pb-32">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 sm:border-3 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md text-black dark:text-white transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
            <KeyRound className="w-3 h-3 text-black stroke-[3]" /> KREDENSIAL DEVELOPER
          </div>
          <h1 className="font-headline font-black text-xl sm:text-3xl text-black dark:text-white tracking-tight">
            API Keys & Secret
          </h1>
          <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
            Gunakan kunci otentikasi ini untuk mengintegrasikan AirPay Engine dengan server & aplikasi web Anda.
          </p>
        </div>

        {apiKey && (
          <Button
            onClick={handleManualSync}
            disabled={isSyncing}
            variant="outline"
            className="h-10 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-mint text-black dark:text-white shadow-neo-sm rounded-xl font-headline font-black text-xs gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Aktifkan Ulang Kunci
          </Button>
        )}
      </div>

      {/* Main Keys Container Card */}
      <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
        <CardHeader className="p-4 sm:p-6 border-b-2 border-black dark:border-zinc-700 bg-[#FFFDF5] dark:bg-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-neo-sky border-2 border-black rounded-xl shadow-neo-sm text-black">
                <Code2 className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-headline font-black text-black dark:text-white">Kunci Otentikasi Merchant</CardTitle>
                <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Kunci API produksi aktif Anda saat ini.</CardDescription>
              </div>
            </div>
            {apiKey && (
              <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider bg-neo-green text-black px-2.5 py-1 border-2 border-black rounded-lg shadow-neo-sm">
                Akses Aktif ⚡
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Secret Key Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-headline font-black uppercase tracking-wider text-black dark:text-zinc-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Secret API Key (X-API-KEY)
              </label>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-md">
                Jangan Bagikan Kunci Ini
              </span>
            </div>

            {isLoading ? (
              <Skeleton className="h-12 w-full rounded-xl bg-black/10 dark:bg-zinc-800" />
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={isRevealed ? "text" : "password"}
                    readOnly
                    value={apiKey?.secretKey || 'Membuat kunci baru...'}
                    className="w-full h-12 pl-4 pr-12 bg-[#FFFDF5] dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl font-mono text-xs sm:text-sm font-bold text-black dark:text-white shadow-neo-sm select-all"
                  />
                  <button
                    type="button"
                    onClick={() => setIsRevealed(!isRevealed)}
                    className="absolute right-3 top-3.5 text-black/70 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                    title={isRevealed ? "Sembunyikan" : "Tampilkan"}
                  >
                    {isRevealed ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {apiKey?.secretKey && (
                  <Button
                    onClick={() => copyToClipboard(apiKey.secretKey, "Secret API Key")}
                    className="h-12 px-5 border-2 border-black dark:border-zinc-700 bg-neo-yellow hover:bg-yellow-400 text-black font-headline font-black text-xs shadow-neo-sm rounded-xl transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    {copiedField === "Secret API Key" ? <Check className="w-4 h-4 text-emerald-700 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
                    {copiedField === "Secret API Key" ? 'Tersalin!' : 'Salin Kunci'}
                  </Button>
                )}
              </div>
            )}
            <p className="text-[10px] font-bold text-black/60 dark:text-zinc-400 pt-1 leading-relaxed">
              Gunakan kunci ini pada header HTTP <code className="bg-black/5 dark:bg-zinc-800 px-1 py-0.5 rounded border border-black/20 dark:border-zinc-700 text-black dark:text-zinc-200 font-bold">X-API-KEY: SecretKey Anda</code> saat memanggil endpoint API AirPay.
              <br />Jika terjadi error 403, gunakan tombol <strong>"Aktifkan Ulang Kunci"</strong> di atas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
