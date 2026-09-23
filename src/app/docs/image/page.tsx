'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, ArrowRight, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function DocsImagePage() {
  return (
    <div className="space-y-8 pb-32 max-w-4xl">
      <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black shadow-neo-md bg-white overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b-2 border-black bg-neo-sky">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white font-black text-xs px-2.5 py-1">GET</Badge>
              <h1 className="font-mono font-black text-xl sm:text-2xl text-black">/api/qris/image</h1>
            </div>
            <span className="text-xs font-black bg-white text-black px-3 py-1 border-2 border-black rounded-xl shadow-neo-sm">Binary PNG Image Stream</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-black/80 pt-2">
            Endpoint ini merender dan mengembalikan file gambar mentah PNG asli berdesain visual kustom toko Anda (gaya modul, sudut, warna latar belakang, dan logo transparan).
          </p>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Query Params */}
          <div className="space-y-2">
            <h3 className="text-xs font-headline font-black text-black uppercase tracking-wider">URL Query Parameters</h3>
            <div className="bg-[#FFFDF5] border-2 border-black rounded-xl p-4 font-mono text-xs font-bold space-y-3 shadow-neo-sm">
              <div className="flex justify-between items-center border-b border-black/10 pb-2">
                <span className="text-blue-700">tid</span>
                <span className="font-sans text-[11px] text-black">Transaction ID / External ID (Wajib)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">mid</span>
                <span className="font-sans text-[11px] text-black">Merchant UID Toko Anda (Wajib)</span>
              </div>
            </div>
          </div>

          {/* Usage HTML Tag */}
          <div className="space-y-2">
            <h3 className="text-xs font-headline font-black text-black uppercase tracking-wider">Penggunaan Langsung HTML / Mobile App</h3>
            <div className="border-2 border-black rounded-xl overflow-hidden font-mono text-xs shadow-neo-sm">
              <div className="bg-black text-white p-2.5 text-[11px] font-black flex justify-between">
                <span>HTML Image Tag</span>
                <span>image/png</span>
              </div>
              <pre className="p-4 bg-[#FFFDF5] text-black font-bold overflow-x-auto text-[11px] leading-relaxed">
{`<img 
  src="http://localhost:9002/api/qris/image?tid=INV-001&mid=MERCHANT_UID" 
  alt="Bayar QRIS Toko" 
  width="300" 
  height="300" 
/>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button asChild variant="outline" className="h-11 px-5 border-2 border-black bg-white text-black font-headline font-black text-xs shadow-neo-sm rounded-xl">
          <Link href="/docs/status" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 stroke-[3]" /> Kembali ke POST /api/qris/status
          </Link>
        </Button>

        <Button asChild className="h-11 px-5 border-2 border-black bg-neo-yellow text-black font-headline font-black text-xs shadow-neo-sm rounded-xl">
          <Link href="/docs/errors" className="flex items-center gap-2">
            Lanjut ke Kode HTTP Status <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
