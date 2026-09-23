'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function DocsErrorsPage() {
  return (
    <div className="space-y-8 pb-32 max-w-4xl">
      <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black shadow-neo-md bg-white overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b-2 border-black bg-[#FFFDF5]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-black text-white rounded-xl">
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <CardTitle className="font-headline font-black text-lg sm:text-xl text-black">Referensi Kode HTTP Status Response</CardTitle>
              <CardDescription className="text-xs font-bold text-black/80">Daftar lengkap kode status HTTP dan makna kegagalannya.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y-2 divide-black/10 font-mono text-xs">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-black text-emerald-700 text-sm">200 OK</span>
              <span className="font-sans font-bold text-black/80">Permintaan berhasil diproses dan mengembalikan payload JSON valid.</span>
            </div>

            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-black text-amber-600 text-sm">400 Bad Request</span>
              <span className="font-sans font-bold text-black/80">Parameter amount atau external_id tidak valid/kosong/kurang dari atau sama dengan 0.</span>
            </div>

            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-black text-rose-600 text-sm">401 Unauthorized</span>
              <span className="font-sans font-bold text-black/80">Header X-API-KEY tidak disertakan pada request HTTP.</span>
            </div>

            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-black text-rose-700 text-sm">403 Forbidden</span>
              <span className="font-sans font-bold text-black/80">API Key tidak terdaftar atau akun merchant belum diizinkan.</span>
            </div>

            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-black text-purple-700 text-sm">409 Conflict</span>
              <span className="font-sans font-bold text-black/80">Duplikasi external_id atau antrian kode unik nominal pending sedang penuh.</span>
            </div>

            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-black text-red-700 text-sm">500 Internal Server Error</span>
              <span className="font-sans font-bold text-black/80">Terjadi kendala koneksi internal pada basis data atau perender gambar.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-start pt-4">
        <Button asChild variant="outline" className="h-11 px-5 border-2 border-black bg-white text-black font-headline font-black text-xs shadow-neo-sm rounded-xl">
          <Link href="/docs/image" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 stroke-[3]" /> Kembali ke GET /api/qris/image
          </Link>
        </Button>
      </div>
    </div>
  );
}
