import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrGenerator } from "./qr-generator";
import { QrCode } from "lucide-react";

export default function GenerateQrPage() {
    return (
        <div className="w-full space-y-6 pb-32">
            {/* Header Info Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 sm:border-3 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md text-black dark:text-white transition-colors">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
                        <QrCode className="w-3 h-3 text-black stroke-[3]" /> GENERATOR QRIS CEPAT
                    </div>
                    <h1 className="font-headline font-black text-xl sm:text-3xl text-black dark:text-white tracking-tight">
                        Buat Kode QRIS Pembayaran
                    </h1>
                    <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
                        Input nominal transaksi untuk menghasilkan kode QRIS dinamis yang siap di-scan pelanggan.
                    </p>
                </div>
            </div>

            <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
                <CardHeader className="p-4 sm:p-6 border-b-2 border-black dark:border-zinc-700 bg-[#FFFDF5] dark:bg-zinc-800">
                    <CardTitle className="font-headline font-black text-base sm:text-lg text-black dark:text-white">Formulir Nominal</CardTitle>
                    <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Kode QRIS akan langsung menyertakan jumlah tagihan yang Anda tentukan.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <QrGenerator />
                </CardContent>
            </Card>
        </div>
    )
}
