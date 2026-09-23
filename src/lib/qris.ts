'use server';

import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { generateDynamicQrisString } from '@/lib/payment/dinamis';

/**
 * @fileOverview Pustaka perender QRIS berdesain presisi tinggi berbasis Node Canvas (100% identik dengan QRCodeStyling).
 */

export interface QrisDesign {
    backgroundColor?: string;
    logoUrl?: string;
    moduleStyle?: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy';
    cornerStyle?: 'square' | 'dot' | 'rounded';
}

/**
 * Fungsi Perender Visual Murni Berpresisi Tinggi menggunakan Node Canvas.
 */
export async function drawMerchantQris(qrisBase: string, amount: number, design: QrisDesign) {
    try {
        if (!qrisBase) throw new Error('Base QRIS string tidak tersedia.');

        const dynamicString = generateDynamicQrisString(amount.toString(), qrisBase);
        const qr = QRCode.create(dynamicString, { errorCorrectionLevel: 'H' });
        const { modules } = qr;
        const moduleCount = modules.size;
        
        const canvasSize = 1000;
        const margin = 50;
        const cellSize = (canvasSize - (margin * 2)) / moduleCount;
        
        const backgroundColorHex = design?.backgroundColor || '#FFFFFF';
        const moduleStyle = design?.moduleStyle || 'square';
        const cornerStyle = design?.cornerStyle || 'square';

        const canvas = createCanvas(canvasSize, canvasSize);
        const ctx = canvas.getContext('2d');

        // 1. Gambar Latar Belakang
        ctx.fillStyle = backgroundColorHex;
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // 2. Finder pattern corners identification
        const isCornerArea = (row: number, col: number) => {
            if (row < 7 && col < 7) return true;
            if (row < 7 && col >= moduleCount - 7) return true;
            if (row >= moduleCount - 7 && col < 7) return true;
            return false;
        };

        // 3. Gambar Modul QR
        ctx.fillStyle = '#000000';

        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (modules.get(row, col) && !isCornerArea(row, col)) {
                    const startX = margin + (col * cellSize);
                    const startY = margin + (row * cellSize);
                    const centerX = startX + (cellSize / 2);
                    const centerY = startY + (cellSize / 2);

                    if (moduleStyle === 'dots') {
                        // Smooth Circular Dots
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, cellSize * 0.42, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (moduleStyle === 'rounded' || moduleStyle === 'extra-rounded' || moduleStyle === 'classy') {
                        // Smooth Rounded Rectangles
                        const r = cellSize * (moduleStyle === 'extra-rounded' ? 0.45 : 0.28);
                        ctx.beginPath();
                        if (typeof ctx.roundRect === 'function') {
                            ctx.roundRect(startX, startY, cellSize, cellSize, r);
                        } else {
                            ctx.rect(startX, startY, cellSize, cellSize);
                        }
                        ctx.fill();
                    } else {
                        // Sharp Square Modules
                        ctx.fillRect(startX, startY, cellSize, cellSize);
                    }
                }
            }
        }

        // 4. Gambar Finder Patterns (Sudut) Sesuai cornerStyle
        const drawFinderPattern = (startRow: number, startCol: number, style: string) => {
            const startX = margin + (startCol * cellSize);
            const startY = margin + (startRow * cellSize);
            const outerWidth = 7 * cellSize;
            const innerWidth = 3 * cellSize;
            const innerOffset = 2 * cellSize;

            ctx.fillStyle = '#000000';

            if (style === 'dot') {
                const centerPos = startX + (outerWidth / 2);
                const centerPosY = startY + (outerWidth / 2);
                const outerR = outerWidth / 2;
                const innerCutoutR = (5 * cellSize) / 2;
                const innerDotR = innerWidth / 2;

                // Outer Ring (Circle with Hole)
                ctx.beginPath();
                ctx.arc(centerPos, centerPosY, outerR, 0, Math.PI * 2, false);
                ctx.arc(centerPos, centerPosY, innerCutoutR, 0, Math.PI * 2, true);
                ctx.fill();

                // Inner Dot (Solid Circle)
                ctx.beginPath();
                ctx.arc(centerPos, centerPosY, innerDotR, 0, Math.PI * 2, false);
                ctx.fill();
            } else if (style === 'rounded') {
                const outerR = outerWidth * 0.25;
                const innerR = innerWidth * 0.25;

                // Outer Ring
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(startX, startY, outerWidth, outerWidth, outerR);
                    ctx.roundRect(startX + cellSize, startY + cellSize, 5 * cellSize, 5 * cellSize, outerR * 0.7);
                } else {
                    ctx.rect(startX, startY, outerWidth, outerWidth);
                    ctx.rect(startX + cellSize, startY + cellSize, 5 * cellSize, 5 * cellSize);
                }
                ctx.fill('evenodd');

                // Inner Dot
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(startX + innerOffset, startY + innerOffset, innerWidth, innerWidth, innerR);
                } else {
                    ctx.rect(startX + innerOffset, startY + innerOffset, innerWidth, innerWidth);
                }
                ctx.fill();
            } else {
                // Classic Square Finder Pattern
                ctx.beginPath();
                ctx.rect(startX, startY, outerWidth, outerWidth);
                ctx.rect(startX + cellSize, startY + cellSize, 5 * cellSize, 5 * cellSize);
                ctx.fill('evenodd');

                ctx.fillRect(startX + innerOffset, startY + innerOffset, innerWidth, innerWidth);
            }
        };

        drawFinderPattern(0, 0, cornerStyle);
        drawFinderPattern(0, moduleCount - 7, cornerStyle);
        drawFinderPattern(moduleCount - 7, 0, cornerStyle);

        // 5. Overlay Logo Transparan dengan Fallback public/img/rp.png
        const defaultLogoPath = path.join(process.cwd(), 'public', 'img', 'rp.png');
        let logoToLoad: string | Buffer = defaultLogoPath;

        let userLogoUrl = design?.logoUrl?.trim() || '';
        if (userLogoUrl) {
            if (userLogoUrl.startsWith('/')) {
                const localPath = path.join(process.cwd(), 'public', userLogoUrl);
                if (fs.existsSync(localPath)) {
                    logoToLoad = localPath;
                } else {
                    logoToLoad = `https://${process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:9002'}${userLogoUrl}`;
                }
            } else {
                logoToLoad = userLogoUrl;
            }
        }

        try {
            let logo;
            try {
                logo = await loadImage(logoToLoad);
            } catch (err) {
                if (fs.existsSync(defaultLogoPath)) {
                    logo = await loadImage(defaultLogoPath);
                } else {
                    logo = await loadImage('https://stspoint.id/img/rp.png');
                }
            }

            if (logo) {
                const logoSize = Math.floor(canvasSize * 0.30);
                const lx = (canvasSize - logoSize) / 2;
                const ly = (canvasSize - logoSize) / 2;

                ctx.drawImage(logo, lx, ly, logoSize, logoSize);
            }
        } catch (e) {
            console.warn('Logo loading bypassed:', e);
        }

        const buffer = canvas.toBuffer('image/png');
        const dataUrl = 'data:image/png;base64,' + buffer.toString('base64');

        return {
            string: dynamicString,
            image: dataUrl,
            buffer: buffer
        };

    } catch (error: any) {
        console.error('CRITICAL QRIS RENDER ERROR:', error);
        throw error;
    }
}
