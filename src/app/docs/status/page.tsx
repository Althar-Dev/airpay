'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Copy, Check, Terminal, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function DocsStatusPage() {
  const { toast } = useToast();
  const [activeLang, setActiveLang] = useState<'curl' | 'javascript' | 'php' | 'python' | 'go'>('curl');
  const [copied, setCopied] = useState(false);

  const getCodeSnippet = () => {
    switch (activeLang) {
      case 'curl':
        return `curl -X POST "http://localhost:9002/api/qris/status" \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: QP-Key-YOUR_SECRET_KEY" \\
  -d '{
    "transaction_id": "INV-20260808-001"
  }'`;
      case 'javascript':
        return `const response = await fetch('http://localhost:9002/api/qris/status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'QP-Key-YOUR_SECRET_KEY'
  },
  body: JSON.stringify({
    transaction_id: 'INV-20260808-001'
  })
});

const result = await response.json();
console.log(result);`;
      case 'php':
        return `<?php
$ch = curl_init('http://localhost:9002/api/qris/status');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'X-API-KEY: QP-Key-YOUR_SECRET_KEY'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'transaction_id' => 'INV-20260808-001'
    ])
]);

$response = curl_exec($ch);
curl_close($ch);
$result = json_decode($response, true);
print_r($result);`;
      case 'python':
        return `import requests

url = "http://localhost:9002/api/qris/status"
headers = {
    "Content-Type": "application/json",
    "X-API-KEY": "QP-Key-YOUR_SECRET_KEY"
}
payload = {
    "transaction_id": "INV-20260808-001"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
      case 'go':
        return `package main

import (
    "bytes"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "http://localhost:9002/api/qris/status"
    payload := []byte(\`{"transaction_id": "INV-20260808-001"}\`)

    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-API-KEY", "QP-Key-YOUR_SECRET_KEY")

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}`;
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    toast({ variant: "success", title: "Kode Tersalin!", description: "Contoh kode berhasil disalin." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-32 max-w-4xl">
      <Card className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black shadow-neo-md bg-white overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b-2 border-black bg-neo-green">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-black text-white font-black text-xs px-2.5 py-1">POST</Badge>
              <h1 className="font-mono font-black text-xl sm:text-2xl text-black">/api/qris/status</h1>
            </div>
            <span className="text-xs font-black bg-white text-black px-3 py-1 border-2 border-black rounded-xl shadow-neo-sm">Cek Mutasi Real-Time</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-black/80 pt-2">
            Endpoint ini secara otomatis menarik data mutasi dari saluran pembayaran yang sedang aktif (Orderkuota / GoPay / ShopeePay), mencocokkan nominal total_amount, dan mengonfirmasi status transaksi menjadi Success.
          </p>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Headers */}
          <div className="space-y-2">
            <h3 className="text-xs font-headline font-black text-black uppercase tracking-wider">HTTP Request Headers</h3>
            <div className="bg-[#FFFDF5] border-2 border-black rounded-xl p-4 font-mono text-xs font-bold space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-rose-600">X-API-KEY</span>
                <span className="font-sans text-[10px] font-black uppercase bg-neo-pink px-2 py-0.5 rounded border border-black text-black">Wajib</span>
              </div>
              <p className="text-black/70 text-[11px] font-sans">Secret API Key toko Anda (contoh: <code className="bg-black/5 px-1.5 py-0.5 rounded border border-black/20 text-black">QP-Key-xxx</code>)</p>
            </div>
          </div>

          {/* Request Body */}
          <div className="space-y-2">
            <h3 className="text-xs font-headline font-black text-black uppercase tracking-wider">Request Body Parameters (JSON)</h3>
            <div className="border-2 border-black rounded-xl overflow-hidden font-mono text-xs shadow-neo-sm">
              <div className="bg-black text-white p-2.5 text-[11px] font-black flex justify-between">
                <span>JSON Payload</span>
                <span>application/json</span>
              </div>
              <pre className="p-4 bg-[#FFFDF5] text-black font-bold overflow-x-auto leading-relaxed">
{`{
  "transaction_id": "INV-001"   // (string, wajib) ID Transaksi / external_id Anda
}`}
              </pre>
            </div>
          </div>

          {/* Response JSON */}
          <div className="space-y-2">
            <h3 className="text-xs font-headline font-black text-black uppercase tracking-wider">Respons Berhasil Terkonfirmasi (HTTP 200 OK - Paid)</h3>
            <div className="border-2 border-black rounded-xl overflow-hidden font-mono text-xs shadow-neo-sm">
              <div className="bg-emerald-600 text-white p-2.5 text-[11px] font-black flex justify-between">
                <span>200 OK (Confirmed)</span>
                <span>Status: Success</span>
              </div>
              <pre className="p-4 bg-[#FFFDF5] text-black font-bold overflow-x-auto leading-relaxed text-[11px]">
{`{
  "success": true,
  "data": {
    "transaction_id": "INV-001",
    "external_id": "INV-001",
    "status": "Success",
    "base_amount": 25000,
    "unique_code": 43,
    "total_amount": 25043,
    "fee_amount": 175,
    "net_amount": 24868,
    "mdr_rate": "0.7%",
    "paid_at": "2026-08-08T03:05:22.000Z",
    "payment_method": "API QRIS"
  }
}`}
              </pre>
            </div>
          </div>

          {/* Code Examples Box */}
          <div className="space-y-2 pt-4 border-t-2 border-black">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-headline font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 stroke-[2.5]" /> Contoh Kode Panggilan
              </h3>
              <Button onClick={copyCode} size="sm" className="h-8 border-2 border-black bg-neo-yellow text-black font-headline font-black text-xs shadow-neo-sm">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
                {copied ? 'Tersalin' : 'Salin Kode'}
              </Button>
            </div>

            <div className="border-2 border-black rounded-xl overflow-hidden">
              <div className="flex items-center gap-1 p-2 bg-neo-cream border-b-2 border-black overflow-x-auto">
                {(['curl', 'javascript', 'php', 'python', 'go'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-headline font-black transition-all border-2 ${
                      activeLang === lang ? 'bg-black text-white border-black shadow-neo-sm' : 'bg-white text-black border-transparent hover:border-black'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-[#1E1E1E] text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto min-h-[200px]">
                <pre>{getCodeSnippet()}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button asChild variant="outline" className="h-11 px-5 border-2 border-black bg-white text-black font-headline font-black text-xs shadow-neo-sm rounded-xl">
          <Link href="/docs/create" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 stroke-[3]" /> Kembali ke POST /api/qris/create
          </Link>
        </Button>

        <Button asChild className="h-11 px-5 border-2 border-black bg-neo-sky text-black font-headline font-black text-xs shadow-neo-sm rounded-xl">
          <Link href="/docs/image" className="flex items-center gap-2">
            Lanjut ke GET /api/qris/image <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
