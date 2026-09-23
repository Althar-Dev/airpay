'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Palette, Link as LinkIcon, Check, Trash2, Save, Loader2, Pipette, QrCode as QrIcon, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useDoc, useFirebase, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

const PRESET_COLORS = [
  { name: 'Pure White', value: '#FFFFFF', class: 'bg-white' },
  { name: 'Golden Neo', value: '#FCB13B', class: 'bg-[#FCB13B]' },
  { name: 'Neo Pink', value: '#FF9EAA', class: 'bg-neo-pink' },
  { name: 'Neo Mint', value: '#A7F3D0', class: 'bg-neo-mint' },
  { name: 'Neo Sky', value: '#BAE6FD', class: 'bg-neo-sky' },
  { name: 'Neo Coral', value: '#FF6B6B', class: 'bg-neo-coral' },
];

const MODULE_STYLES = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'classy', label: 'Classy' },
];

const CORNER_STYLES = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'rounded', label: 'Rounded' },
];

export default function QrisDesignPage() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null);

  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [logoUrl, setLogoUrl] = useState('');
  const [validLogoUrl, setValidLogoUrl] = useState<string>('/img/rp.png');
  const [moduleStyle, setModuleStyle] = useState<any>('square');
  const [cornerStyle, setCornerStyle] = useState<any>('square');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current design settings from Firestore
  const merchantRef = useMemoFirebase(() => user ? doc(firestore, 'merchants', user.uid) : null, [user, firestore]);
  const { data: merchantData, isLoading: isDataLoading } = useDoc<any>(merchantRef);

  // Load existing settings when data is fetched
  useEffect(() => {
    if (merchantData?.qrDesign) {
      const design = merchantData.qrDesign;
      if (design.backgroundColor) setSelectedColor(design.backgroundColor);
      if (design.logoUrl !== undefined) setLogoUrl(design.logoUrl);
      if (design.moduleStyle) setModuleStyle(design.moduleStyle);
      if (design.cornerStyle) setCornerStyle(design.cornerStyle);
    }
  }, [merchantData]);

  // Pre-validate custom logo URL to prevent canvas crashes or blank QR preview
  useEffect(() => {
    const target = logoUrl.trim();
    if (!target) {
      setValidLogoUrl('/img/rp.png');
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    let isSubscribed = true;

    img.onload = () => {
      if (isSubscribed) setValidLogoUrl(target);
    };
    img.onerror = () => {
      // If custom logo fails to load or triggers CORS error, fallback to default logo
      if (isSubscribed) setValidLogoUrl('/img/rp.png');
    };
    img.src = target;

    return () => {
      isSubscribed = false;
    };
  }, [logoUrl]);

  // Initialize and Update QR Code
  useEffect(() => {
    const initQr = async () => {
      const QRCodeStyling = (await import('qr-code-styling')).default;

      if (!qrCodeInstance.current) {
        qrCodeInstance.current = new QRCodeStyling({
          width: 280,
          height: 280,
          data: "https://stspoint.id",
          margin: 0,
          qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' },
          imageOptions: { hideBackgroundDots: false, imageSize: 0.35, margin: 0 },
          dotsOptions: { color: "#000000", type: moduleStyle },
          backgroundOptions: { color: "transparent" },
          cornersSquareOptions: { color: "#000000", type: cornerStyle },
          cornersDotOptions: { color: "#000000", type: cornerStyle },
        });

        if (qrRef.current) {
          qrCodeInstance.current.append(qrRef.current);
        }
      }

      qrCodeInstance.current.update({
        dotsOptions: { type: moduleStyle },
        cornersSquareOptions: { type: cornerStyle },
        cornersDotOptions: { type: cornerStyle },
        image: validLogoUrl
      });
    };

    initQr();
  }, [moduleStyle, cornerStyle, validLogoUrl]);

  const handleSaveDesign = async () => {
    if (!merchantRef) return;
    setIsSaving(true);
    try {
      await updateDocumentNonBlocking(merchantRef, {
        qrDesign: {
          backgroundColor: selectedColor,
          logoUrl: logoUrl,
          moduleStyle: moduleStyle,
          cornerStyle: cornerStyle,
        }
      });
      toast({
        variant: "success",
        title: "Desain Disimpan! ✨",
        description: "Konfigurasi gaya visual QRIS Anda telah diperbarui."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan desain ke server."
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-4 pb-32">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-4 rounded-2xl shadow-neo-md text-black dark:text-white transition-colors">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1 bg-neo-yellow text-black border-2 border-black px-2 py-0.5 rounded-full shadow-neo-sm text-[9px] font-black uppercase">
            <Palette className="w-2.5 h-2.5 text-black stroke-[3]" /> KUSTOMISASI
          </div>
          <h1 className="font-headline font-black text-lg text-black dark:text-white tracking-tight">
            Desain Visual QRIS
          </h1>
          <p className="text-[10px] font-bold text-black/60 dark:text-zinc-300">
            Atur bentuk modul, sudut, dan logo untuk tampilan QRIS yang unik.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Controls Section */}
        <div className="lg:col-span-6 space-y-4 order-2 lg:order-1">
          <Card className="rounded-2xl border-2 border-black dark:border-zinc-700 shadow-neo-md overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">
            <CardHeader className="p-4 border-b-2 border-black dark:border-zinc-700 bg-[#FFFDF5] dark:bg-zinc-800">
              <CardTitle className="text-[10px] font-headline font-black text-black dark:text-white uppercase tracking-widest">Konfigurasi Gaya QR</CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-5">
              {/* Module Style Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-headline font-black uppercase tracking-wider text-black/70 dark:text-zinc-300 flex items-center gap-1.5">
                    <LayoutGrid className="w-2.5 h-2.5" /> Tipe Modul
                  </label>
                  <Select value={moduleStyle} onValueChange={setModuleStyle}>
                    <SelectTrigger className="h-9 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm font-bold text-xs bg-white dark:bg-zinc-800 text-black dark:text-white">
                      <SelectValue placeholder="Pilih Bentuk" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-xl">
                      {MODULE_STYLES.map(style => (
                        <SelectItem key={style.value} value={style.value} className="text-xs font-bold">{style.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-headline font-black uppercase tracking-wider text-black/70 dark:text-zinc-300 flex items-center gap-1.5">
                    <QrIcon className="w-2.5 h-2.5" /> Gaya Sudut
                  </label>
                  <Select value={cornerStyle} onValueChange={setCornerStyle}>
                    <SelectTrigger className="h-9 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm font-bold text-xs bg-white dark:bg-zinc-800 text-black dark:text-white">
                      <SelectValue placeholder="Pilih Bentuk" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-xl">
                      {CORNER_STYLES.map(style => (
                        <SelectItem key={style.value} value={style.value} className="text-xs font-bold">{style.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <label className="text-[9px] font-headline font-black uppercase tracking-wider text-black/70 dark:text-zinc-300">
                  Warna Latar Belakang
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={cn(
                        "w-8 h-8 rounded-xl border-2 border-black dark:border-zinc-700 shadow-neo-sm transition-all relative active:translate-x-[1px] active:translate-y-[1px]",
                        color.class,
                        selectedColor === color.value ? "scale-110" : ""
                      )}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-black stroke-[4]" />
                        </div>
                      )}
                    </button>
                  ))}

                  {/* Custom Color Picker Input */}
                  <div className="relative flex items-center gap-2">
                    <div className="relative h-8 w-8 rounded-xl border-2 border-black dark:border-zinc-700 shadow-neo-sm overflow-hidden flex items-center justify-center bg-white dark:bg-zinc-800 cursor-pointer">
                      <Pipette className="absolute z-10 w-3.5 h-3.5 text-black dark:text-white pointer-events-none stroke-[3]" />
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer border-none p-0 outline-none"
                        title="Pilih Warna Kustom"
                      />
                    </div>
                    <span className="text-[8px] font-black text-black/40 dark:text-zinc-400 uppercase tracking-tighter">Kustom</span>
                  </div>
                </div>
              </div>

              {/* Logo URL Input */}
              <div className="space-y-2">
                <label className="text-[9px] font-headline font-black uppercase tracking-wider text-black/70 dark:text-zinc-300">
                  URL Logo Tengah (PNG/SVG)
                </label>
                <div className="space-y-1.5">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-black dark:text-zinc-400 stroke-[2.5]" />
                    <Input
                      placeholder="Tempel tautan logo kustom di sini"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="h-9 pl-9 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white focus:shadow-neo-sm font-bold text-xs rounded-xl shadow-neo-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between px-0.5">
                    <p className="text-[8px] font-bold text-black/50 dark:text-zinc-400 italic">
                      *Otomatis pakai logo AirPay jika kosong / gagal dimuat
                    </p>
                    {logoUrl && (
                      <button
                        onClick={() => setLogoUrl('')}
                        className="text-[9px] font-black text-rose-600 dark:text-rose-400 hover:text-rose-700 h-5 p-0 flex items-center gap-1 bg-transparent border-none cursor-pointer"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Reset Default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-[#FFFDF5] dark:bg-zinc-800 border-t-2 border-black dark:border-zinc-700 p-4">
              <Button
                onClick={handleSaveDesign}
                disabled={isSaving || isDataLoading}
                className="w-full h-10 border-2 border-black dark:border-zinc-700 bg-neo-yellow-bold hover:bg-yellow-400 text-black font-headline font-black text-xs shadow-neo-sm transition-all active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin h-3.5 w-3.5 text-black" /> : <Save className="w-3.5 h-3.5 stroke-[3]" />}
                Simpan Perubahan Visual
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Pure QR Preview Section */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="flex flex-col items-center justify-center p-6 bg-neo-cream dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 rounded-3xl shadow-neo-lg min-h-[380px] relative overflow-hidden text-black dark:text-white">
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-zinc-400 mb-4 relative z-10">Live Visual Preview</p>

            <div
              className="relative w-full max-w-[220px] sm:max-w-[280px] aspect-square border-4 border-black dark:border-zinc-700 rounded-[2.5rem] shadow-neo-xl flex items-center justify-center p-5 sm:p-7 transition-colors duration-300 z-10 overflow-hidden"
              style={{ backgroundColor: selectedColor }}
            >
              <div ref={qrRef} className="w-full h-full flex items-center justify-center [&_canvas]:max-w-full [&_canvas]:max-h-full" />
            </div>

            <div className="mt-5 text-center relative z-10 space-y-1">
              <p className="font-headline font-black text-[10px] text-black dark:text-white">SCANNABLE Air</p>
              <div className="inline-flex items-center gap-1 bg-white dark:bg-zinc-800 border border-black dark:border-zinc-700 px-2 py-0.5 rounded-full text-[7px] font-mono font-bold text-black/50 dark:text-zinc-300 uppercase">
                Scan to open stspoint.id
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
