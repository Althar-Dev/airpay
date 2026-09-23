
'use server';

import { drawMerchantQris, type QrisDesign } from '@/lib/qris';

interface QrGenerationParams {
    userId: string;
    amount: number;
    design: QrisDesign;
    qrisBase: string;
}

/**
 * Server Action untuk memproses pembuatan gambar QRIS berdesain.
 * Fungsi ini tidak memanggil Firestore di server untuk menghindari permission errors.
 * Semua data konfigurasi dikirimkan dari client yang sudah terautentikasi.
 */
export async function generateQrImageAction(params: QrGenerationParams): Promise<{ 
    success: boolean, 
    message?: string, 
    imageData?: string, 
    qrisString?: string 
}> {
    try {
        if (!params.userId) throw new Error("User ID wajib disertakan.");
        if (!params.qrisBase) throw new Error("String base QRIS tidak ditemukan. Silakan hubungi admin.");
        if (!params.amount || params.amount <= 0) throw new Error("Nominal transaksi tidak valid.");

        // Lakukan perenderan gambar kustom menggunakan Jimp
        const result = await drawMerchantQris(params.qrisBase, params.amount, params.design);

        return { 
            success: true, 
            imageData: result.image, 
            qrisString: result.string 
        };

    } catch (error: any) {
        console.error("Server Action QR Generation Failed:", error);
        return { 
            success: false, 
            message: error.message || "Gagal memproses gambar QR Code secara visual." 
        };
    }
}
