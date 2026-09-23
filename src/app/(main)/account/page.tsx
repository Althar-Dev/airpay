'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc } from "firebase/firestore";
import { User, Building2, Landmark, Loader2, Save, Mail, Phone, MapPin, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useDoc, useFirebase, updateDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { BankAccountModal } from "@/components/wallet/bank-account-modal";

const profileSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  email: z.string().email("Email tidak valid"),
  phoneNumber: z.string().optional(),
});

const businessSchema = z.object({
  businessName: z.string().min(2, "Nama bisnis terlalu pendek"),
  businessAddress: z.string().optional(),
  merchantId: z.string(),
});

const bankingSchema = z.object({
  bankName: z.string().min(2, "Nama bank terlalu pendek"),
  bankAccountNumber: z.string().min(5, "Nomor rekening terlalu pendek"),
});

export default function AccountPage() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const merchantRef = useMemoFirebase(() => user ? doc(firestore, 'merchants', user.uid) : null, [user, firestore]);
  const { data: merchantData, isLoading } = useDoc(merchantRef);

  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settingsData } = useDoc(settingsRef);

  const bankFeeVal = settingsData?.bankFee ?? 3500;
  const ewalletFeeVal = settingsData?.ewalletFee ?? 2000;

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '', phoneNumber: '' },
  });

  const businessForm = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: { businessName: '', businessAddress: '', merchantId: '' },
  });

  const bankingForm = useForm<z.infer<typeof bankingSchema>>({
    resolver: zodResolver(bankingSchema),
    defaultValues: { bankName: '', bankAccountNumber: '' },
  });

  useEffect(() => {
    if (merchantData) {
      profileForm.reset({
        name: merchantData.name || '',
        email: merchantData.email || user?.email || '',
        phoneNumber: merchantData.phoneNumber || '',
      });
      businessForm.reset({
        businessName: merchantData.businessName || '',
        businessAddress: merchantData.businessAddress || '',
        merchantId: merchantData.merchantId || '',
      });
      bankingForm.reset({
        bankName: merchantData.bankName || '',
        bankAccountNumber: merchantData.bankAccountNumber || '',
      });
    }
  }, [merchantData, user, profileForm, businessForm, bankingForm]);

  const handleSave = async (values: any) => {
    if (!merchantRef) return;
    setIsSaving(true);
    try {
      const { merchantId, ...savableValues } = values;
      updateDocumentNonBlocking(merchantRef, savableValues);
      toast({
        title: "Perubahan Disimpan! ✨",
        description: "Profil usaha Anda berhasil diperbarui di sistem AirPay.",
      });
    } catch (error) {
      console.error("Error saving account details:", error);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat memperbarui profil.",
      });
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-32">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 sm:border-3 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md text-black dark:text-white transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
            <User className="w-3 h-3 text-black stroke-[3]" /> PENGATURAN MERCHANTS
          </div>
          <h1 className="font-headline font-black text-xl sm:text-3xl text-black dark:text-white tracking-tight">
            Profil & Identitas Toko
          </h1>
          <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
            Kelola informasi identitas pribadi, detail bisnis, dan rekening bank pencairan omset Anda.
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full space-y-4">
        <TabsList className="bg-[#FFFDF5] dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-1 rounded-xl shadow-neo-sm h-auto w-full sm:w-fit grid grid-cols-3 sm:flex gap-1">
          <TabsTrigger value="profile" className="rounded-lg py-2 px-4 gap-2 text-xs font-headline font-black transition-all data-[state=active]:bg-neo-yellow data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-neo-sm dark:text-zinc-200">
            <User className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Pribadi</span>
            <span className="sm:hidden">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="rounded-lg py-2 px-4 gap-2 text-xs font-headline font-black transition-all data-[state=active]:bg-neo-sky data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-neo-sm dark:text-zinc-200">
            <Building2 className="h-4 w-4 stroke-[2.5]" />
            <span>Bisnis</span>
          </TabsTrigger>
          <TabsTrigger value="banking" className="rounded-lg py-2 px-4 gap-2 text-xs font-headline font-black transition-all data-[state=active]:bg-neo-green data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-neo-sm dark:text-zinc-200">
            <Landmark className="h-4 w-4 stroke-[2.5]" />
            <span>Rekening</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile */}
        <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleSave)}>
              <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
                <CardHeader className="p-4 sm:p-6 border-b-2 border-black dark:border-zinc-700 bg-[#FFFDF5] dark:bg-zinc-800">
                  <CardTitle className="text-base sm:text-lg font-headline font-black text-black dark:text-white">Informasi Pribadi Direktur</CardTitle>
                  <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Identitas resmi pemilik akun merchant AirPay.</CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-4">
                  <FormField control={profileForm.control} name="name" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Nama Lengkap Pemilik</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} className="h-10 sm:h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs sm:text-sm rounded-xl shadow-neo-sm" />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold text-rose-600" />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={profileForm.control} name="email" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Email Terverifikasi</FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-black dark:text-zinc-400 stroke-[2.5]" />
                          <FormControl>
                            <Input type="email" {...field} disabled className="h-10 sm:h-11 pl-9 bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white font-headline font-black text-xs sm:text-sm rounded-xl shadow-neo-sm" />
                          </FormControl>
                        </div>
                        <FormMessage className="text-[10px] font-bold text-rose-600" />
                      </FormItem>
                    )} />

                    <FormField control={profileForm.control} name="phoneNumber" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Nomor WhatsApp Active</FormLabel>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-black dark:text-zinc-400 stroke-[2.5]" />
                          <FormControl>
                            <Input type="tel" placeholder="08xxxxxxxxxx" {...field} disabled={isLoading} className="h-10 sm:h-11 pl-9 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs sm:text-sm rounded-xl shadow-neo-sm" />
                          </FormControl>
                        </div>
                        <FormMessage className="text-[10px] font-bold text-rose-600" />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>

                <CardFooter className="bg-[#FFFDF5] dark:bg-zinc-800 border-t-2 border-black dark:border-zinc-700 px-4 sm:px-6 py-4">
                  <Button type="submit" size="sm" disabled={isSaving || isLoading} className="h-11 sm:h-12 border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs sm:text-sm shadow-neo-sm hover:shadow-neo rounded-xl px-6 flex items-center gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Save className="h-4 w-4 stroke-[3]" />}
                    Simpan Perubahan Profil
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Tab 2: Business */}
        <TabsContent value="business" className="mt-0 focus-visible:outline-none">
          <Form {...businessForm}>
            <form onSubmit={businessForm.handleSubmit(handleSave)}>
              <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
                <CardHeader className="p-4 sm:p-6 border-b-2 border-black dark:border-zinc-700 bg-[#FFFDF5] dark:bg-zinc-800">
                  <CardTitle className="text-base sm:text-lg font-headline font-black text-black dark:text-white">Detail Operasional Bisnis</CardTitle>
                  <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Informasi nama toko dan alamat cabang utama Anda.</CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={businessForm.control} name="merchantId" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Merchant ID</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="h-10 sm:h-11 bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 font-headline font-black text-xs sm:text-sm rounded-xl shadow-neo-sm text-black dark:text-white" />
                        </FormControl>
                        <FormDescription className="text-[10px] font-bold text-black/60 dark:text-zinc-400">ID unik usaha Anda di jaringan server AirPay.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={businessForm.control} name="businessName" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Nama Bisnis / Toko Utama</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} className="h-10 sm:h-11 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs sm:text-sm rounded-xl shadow-neo-sm" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold text-rose-600" />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={businessForm.control} name="businessAddress" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="font-headline font-black text-xs uppercase tracking-wider text-black dark:text-zinc-200">Alamat Lengkap Toko</FormLabel>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-black dark:text-zinc-400 stroke-[2.5]" />
                        <FormControl>
                          <Textarea {...field} disabled={isLoading} className="min-h-[80px] pl-9 pt-2.5 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs sm:text-sm rounded-xl shadow-neo-sm" />
                        </FormControl>
                      </div>
                      <FormMessage className="text-[10px] font-bold text-rose-600" />
                    </FormItem>
                  )} />
                </CardContent>

                <CardFooter className="bg-[#FFFDF5] dark:bg-zinc-800 border-t-2 border-black dark:border-zinc-700 px-4 sm:px-6 py-4">
                  <Button type="submit" size="sm" disabled={isSaving || isLoading} className="h-11 sm:h-12 border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs sm:text-sm shadow-neo-sm hover:shadow-neo rounded-xl px-6 flex items-center gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Save className="h-4 w-4 stroke-[3]" />}
                    Simpan Detail Bisnis
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Tab 3: Banking */}
        <TabsContent value="banking" className="mt-0 focus-visible:outline-none">
          <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
            <CardHeader className="p-4 sm:p-6 border-b-2 border-black dark:border-zinc-700 bg-[#FFFDF5] dark:bg-zinc-800">
              <CardTitle className="text-base sm:text-lg font-headline font-black text-black dark:text-white">Informasi Rekening Bank & E-Wallet (*Payout*)</CardTitle>
              <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Tujuan pencairan otomatis dana omset toko Anda ke Rekening Bank atau E-Wallet.</CardDescription>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="p-4 bg-neo-yellow/20 border-2 border-black dark:border-zinc-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-black/60 dark:text-zinc-400">Metode Pencairan Saat Ini</p>
                  <p className="font-headline font-black text-base text-black dark:text-white">
                    {merchantData?.bankName ? `${merchantData.bankName} (${merchantData.bankAccountNumber})` : 'Belum Dikonfigurasi'}
                  </p>
                  <p className="text-xs font-bold text-black/70 dark:text-zinc-300">a.n. {merchantData?.bankAccountName || merchantData?.name || '-'}</p>
                </div>
                <Button
                  onClick={() => setIsBankModalOpen(true)}
                  className="h-10 border-2 border-black dark:border-zinc-700 bg-neo-yellow hover:bg-yellow-400 text-black font-headline font-black text-xs shadow-neo-sm rounded-xl"
                >
                  Ubah / Atur Rekening & E-Wallet
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-neo-sky/20 border-2 border-black dark:border-zinc-700 rounded-xl space-y-1">
                  <p className="font-headline font-black text-xs text-black dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-black dark:text-white stroke-[2.5]" />
                    Transfer Bank (Fee {formatIDR(bankFeeVal)})
                  </p>
                  <p className="text-[11px] font-bold text-black/70 dark:text-zinc-300">Dukungan: Mandiri, BCA, CIMB Niaga, Permata, BRI, BNI.</p>
                </div>
                <div className="p-3.5 bg-neo-green/20 border-2 border-black dark:border-zinc-700 rounded-xl space-y-1">
                  <p className="font-headline font-black text-xs text-black dark:text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-black dark:text-white stroke-[2.5]" />
                    E-Wallet (Fee {formatIDR(ewalletFeeVal)})
                  </p>
                  <p className="text-[11px] font-bold text-black/70 dark:text-zinc-300">Dukungan: GoPay, DANA, LinkAja, OVO, ShopeePay.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Dialog Content */}
      <BankAccountModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} />
    </div>
  );
}
