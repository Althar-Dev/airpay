'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { BellRing, Mail, MessageSquare, Save, Bell, ShieldCheck } from "lucide-react";

export default function NotificationsPage() {
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Pengaturan Disimpan! ✨",
            description: "Preferensi notifikasi usaha Anda berhasil diperbarui.",
        });
    }

  return (
    <div className="w-full space-y-6 pb-32">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 sm:border-3 border-black p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-yellow border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
            <Bell className="w-3 h-3 text-black stroke-[3]" /> PENGATURAN NOTIFIKASI
          </div>
          <h1 className="font-headline font-black text-xl sm:text-3xl text-black tracking-tight">
            Notifikasi & Alert Webhook
          </h1>
          <p className="text-xs font-bold text-black/70">
            Atur bagaimana Anda dan tim mendapatkan pemberitahuan real-time pembayaran transaksi masuk.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black shadow-neo-md overflow-hidden bg-white">
        <CardHeader className="p-4 sm:p-6 border-b-2 border-black bg-[#FFFDF5]">
          <CardTitle className="font-headline font-black text-base sm:text-lg text-black">Preferensi Pemberitahuan</CardTitle>
          <CardDescription className="text-xs font-bold text-black/70">Aktifkan kanal pemberitahuan yang ingin Anda gunakan.</CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Email Notifications */}
            <div className="space-y-3">
                <h3 className="text-sm font-headline font-black text-black flex items-center gap-2">
                  <div className="p-1.5 bg-neo-sky border-2 border-black rounded-lg shadow-neo-sm text-black">
                    <Mail className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  Notifikasi Email
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3.5 border-2 border-black rounded-xl bg-[#FFFDF5] shadow-neo-sm">
                      <div className="space-y-0.5">
                          <Label htmlFor="email-payments" className="font-headline font-black text-xs text-black cursor-pointer">Pembayaran QRIS Sukses</Label>
                          <p className="text-[11px] font-bold text-black/70">Kirim email setiap kali ada transaksi berhasil masuk.</p>
                      </div>
                      <Switch id="email-payments" defaultChecked className="data-[state=checked]:bg-neo-yellow border-2 border-black" />
                  </div>
                  <div className="flex items-center justify-between p-3.5 border-2 border-black rounded-xl bg-[#FFFDF5] shadow-neo-sm">
                      <div className="space-y-0.5">
                          <Label htmlFor="email-reports" className="font-headline font-black text-xs text-black cursor-pointer">Laporan Omset Mingguan</Label>
                          <p className="text-[11px] font-bold text-black/70">Dapatkan ringkasan statistik pendapatan toko setiap hari Senin.</p>
                      </div>
                      <Switch id="email-reports" defaultChecked className="data-[state=checked]:bg-neo-yellow border-2 border-black" />
                  </div>
                </div>
            </div>

            {/* Push Notifications */}
            <div className="space-y-3 pt-2">
                <h3 className="text-sm font-headline font-black text-black flex items-center gap-2">
                  <div className="p-1.5 bg-neo-yellow border-2 border-black rounded-lg shadow-neo-sm text-black">
                    <BellRing className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  Push Alert Browser & Aplikasi
                </h3>
                <div className="flex items-center justify-between p-3.5 border-2 border-black rounded-xl bg-[#FFFDF5] shadow-neo-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="push-payments" className="font-headline font-black text-xs text-black cursor-pointer">Notifikasi Live Audio & Pop-up</Label>
                        <p className="text-[11px] font-bold text-black/70">Dapatkan notifikasi suara & pop-up real-time saat transaksi sukses.</p>
                    </div>
                    <Switch id="push-payments" defaultChecked className="data-[state=checked]:bg-neo-yellow border-2 border-black" />
                </div>
            </div>

            {/* SMS Notifications */}
            <div className="space-y-3 pt-2">
                <h3 className="text-sm font-headline font-black text-black flex items-center gap-2">
                  <div className="p-1.5 bg-neo-green border-2 border-black rounded-lg shadow-neo-sm text-black">
                    <MessageSquare className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  Konfirmasi SMS & WhatsApp
                </h3>
                <div className="flex items-center justify-between p-3.5 border-2 border-black rounded-xl bg-[#FFFDF5] shadow-neo-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="sms-withdrawals" className="font-headline font-black text-xs text-black cursor-pointer">Konfirmasi Pencairan Dana (*Payout*)</Label>
                        <p className="text-[11px] font-bold text-black/70">Terima SMS saat proses transfer saldo H+0 ke rekening Anda selesai.</p>
                    </div>
                    <Switch id="sms-withdrawals" className="data-[state=checked]:bg-neo-yellow border-2 border-black" />
                </div>
            </div>
        </CardContent>

        <CardFooter className="bg-[#FFFDF5] border-t-2 border-black px-4 sm:px-6 py-4">
            <Button onClick={handleSave} className="h-11 sm:h-12 border-2 border-black bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs sm:text-sm shadow-neo-sm hover:shadow-neo rounded-xl px-6 flex items-center gap-2">
              <Save className="h-4 w-4 stroke-[3]" /> Simpan Preferensi
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}