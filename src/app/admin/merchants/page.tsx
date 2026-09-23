'use client';

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { User, Mail, Calendar, Users } from "lucide-react";

export default function AdminMerchantsPage() {
  const { firestore } = useFirebase();

  const merchantsQuery = useMemoFirebase(() =>
    query(collection(firestore, 'merchants'), orderBy('registrationDate', 'desc')),
    [firestore]
  );
  const { data: merchants, isLoading } = useCollection(merchantsQuery);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-32 w-full max-w-full overflow-hidden">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 sm:border-3 border-black dark:border-zinc-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-neo-md text-black dark:text-white transition-colors w-full">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-3 py-0.5 rounded-full shadow-neo-sm text-[10px] font-black uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-black stroke-[3]" /> DIREKTORI MERCHANT
          </div>
          <h1 className="font-headline font-black text-xl sm:text-3xl text-black dark:text-white tracking-tight">
            Manajemen Merchant Terdaftar
          </h1>
          <p className="text-xs font-bold text-black/70 dark:text-zinc-300">
            Kelola data bisnis dan status hak akses seluruh merchant aktif di jaringan AirPay Engine.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white w-full max-w-full">
        <CardHeader className="bg-[#FFFDF5] dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700 p-4 sm:p-5">
          <CardTitle className="font-headline font-black text-base sm:text-lg text-black dark:text-white">Basis Data Merchant</CardTitle>
          <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">Daftar lengkap mitra merchant resmi terverifikasi.</CardDescription>
        </CardHeader>

        <CardContent className="p-0 w-full max-w-full overflow-x-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl bg-black/10 dark:bg-zinc-800" />)}
            </div>
          ) : (
            <Table className="w-full text-xs">
              <TableHeader className="bg-neo-cream dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="py-3 px-3 sm:px-5 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Nama Bisnis</TableHead>
                  <TableHead className="py-3 px-3 sm:px-5 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200 hidden sm:table-cell">Kontak Email</TableHead>
                  <TableHead className="py-3 px-3 sm:px-5 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200 hidden md:table-cell">Terdaftar</TableHead>
                  <TableHead className="py-3 px-3 sm:px-5 font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Status</TableHead>
                  <TableHead className="py-3 px-3 sm:px-5 text-right font-headline font-black uppercase text-[10px] tracking-wider text-black dark:text-zinc-200">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchants?.map((merchant) => (
                  <TableRow key={merchant.id} className="border-b-2 border-black/10 dark:border-zinc-800 last:border-none hover:bg-[#FFFDF5] dark:hover:bg-zinc-800/60 transition-colors">
                    <TableCell className="py-3 px-3 sm:px-5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-xl bg-neo-sky border-2 border-black shadow-neo-sm flex items-center justify-center text-black shrink-0">
                          <User className="h-4 w-4 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-headline font-black text-xs sm:text-sm text-black dark:text-white truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs">{merchant.businessName || merchant.name || 'Unnamed Merchant'}</p>
                          <p className="text-[9px] font-mono font-bold text-black/60 dark:text-zinc-400 truncate">{merchant.merchantId || '-'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-3 sm:px-5 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-black/80 dark:text-zinc-300">
                        <Mail className="h-3.5 w-3.5 stroke-[2.5] shrink-0" />
                        <span className="text-xs font-bold truncate max-w-[160px]">{merchant.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-3 sm:px-5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-black/80 dark:text-zinc-300">
                        <Calendar className="h-3.5 w-3.5 stroke-[2.5] shrink-0" />
                        <span className="text-xs font-bold whitespace-nowrap">
                          {merchant.registrationDate ? format(new Date(merchant.registrationDate), 'dd MMM yyyy') : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-3 sm:px-5">
                      {merchant.isActive ? (
                        <span className="bg-neo-green text-black border-2 border-black shadow-neo-sm text-[9px] sm:text-[10px] font-headline font-black px-2 py-0.5 rounded-lg inline-block whitespace-nowrap">Active ⚡</span>
                      ) : (
                        <span className="bg-neo-coral text-white border-2 border-black shadow-neo-sm text-[9px] sm:text-[10px] font-headline font-black px-2 py-0.5 rounded-lg inline-block whitespace-nowrap">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-3 sm:px-5 text-right">
                      {merchant.admin ? (
                        <span className="bg-neo-coral text-white border border-black shadow-neo-sm text-[9px] font-headline font-black px-2 py-0.5 rounded-md uppercase tracking-wider inline-block">Admin</span>
                      ) : (
                        <span className="bg-white dark:bg-zinc-800 text-black dark:text-white border border-black dark:border-zinc-700 text-[9px] font-headline font-black px-2 py-0.5 rounded-md uppercase tracking-wider inline-block">Merchant</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {merchants && merchants.length > 0 && (
          <CardFooter className="py-3 px-4 sm:px-6 bg-[#FFFDF5] dark:bg-zinc-800 border-t-2 border-black dark:border-zinc-700">
            <div className="text-xs font-headline font-black text-black dark:text-white uppercase tracking-wider">
              Total Terdaftar: <span className="bg-neo-yellow text-black px-1.5 py-0.5 border border-black rounded-md">{merchants.length}</span> Merchant
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
