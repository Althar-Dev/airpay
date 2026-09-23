'use server';
import nodemailer from 'nodemailer';

interface MailOptions {
    to: string;
    subject: string;
    html: string;
}

interface VerificationCodeEmailOptions {
    to: string;
    code: string;
}

interface PaymentSuccessEmailOptions {
    to: string;
    merchantName: string;
    amount: number;
    transactionId: string;
    customerName?: string;
}

interface WithdrawalSuccessEmailOptions {
    to: string;
    merchantName: string;
    amount: number;
    bankName: string;
    accountNumber: string;
}

const sendMail = async ({ to, subject, html }: MailOptions) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        const errorMessage = 'Email credentials (EMAIL_USER, EMAIL_PASSWORD) are not configured in the .env file.';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    try {
        await transporter.sendMail({
            from: `AirPay Engine <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent to ${to}`);
    } catch (error: any) {
        console.error('Failed to send email:', error);
        throw new Error(error.message || 'Failed to send email.');
    }
};

/**
 * Neo-Brutalist HTML Email Container Wrapper
 * Uses Pure White & High-Saturation Accent Colors + Linear Gradient Hacks to prevent Gmail Dark Mode from turning light cream into brown.
 */
const renderEmailTemplate = (contentHtml: string) => {
    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>AirPay Notification</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
            
            :root {
                color-scheme: light;
                supported-color-schemes: light;
            }
            
            body {
                font-family: 'Plus Jakarta Sans', Arial, sans-serif;
                background-color: #F4F4F5 !important;
                margin: 0;
                padding: 0;
                color: #000000 !important;
            }

            u + .body {
                background-color: #F4F4F5 !important;
            }

            @media (prefers-color-scheme: dark) {
                .email-bg {
                    background-color: #F4F4F5 !important;
                    background-image: linear-gradient(#F4F4F5, #F4F4F5) !important;
                }
                .email-card {
                    background-color: #FFFFFF !important;
                    background-image: linear-gradient(#FFFFFF, #FFFFFF) !important;
                    color: #000000 !important;
                }
                .email-header {
                    background-color: #38BDF8 !important;
                    background-image: linear-gradient(#38BDF8, #38BDF8) !important;
                    color: #000000 !important;
                }
                .email-text {
                    color: #000000 !important;
                }
            }
        </style>
    </head>
    <body className="body" style="background-color: #F4F4F5; margin: 0; padding: 24px 12px; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
        <!-- Outer Background Wrapper -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-bg" style="background-color: #F4F4F5; background-image: linear-gradient(#F4F4F5, #F4F4F5); width: 100%; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-card" style="max-width: 580px; background-color: #ffffff; background-image: linear-gradient(#ffffff, #ffffff); border: 3px solid #000000; border-radius: 20px; box-shadow: 6px 6px 0px #000000; overflow: hidden;">
                        <!-- Header Branding -->
                        <tr>
                            <td class="email-header" style="background-color: #38BDF8; background-image: linear-gradient(#38BDF8, #38BDF8); border-bottom: 3px solid #000000; padding: 20px 24px; text-align: center;">
                                <div style="font-size: 26px; font-weight: 900; color: #000000; letter-spacing: -0.5px;">
                                    Air<span style="background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF); border: 2px solid #000000; border-radius: 8px; padding: 2px 8px; margin-left: 4px; box-shadow: 2px 2px 0px #000000; color: #000000;">Pay</span>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Main Content Area -->
                        <tr>
                            <td style="padding: 28px 24px; background-color: #ffffff; background-image: linear-gradient(#ffffff, #ffffff); color: #000000;">
                                ${contentHtml}
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #F4F4F5; background-image: linear-gradient(#F4F4F5, #F4F4F5); border-top: 3px solid #000000; padding: 18px 24px; text-align: center; font-size: 11px; font-weight: 800; color: #000000;">
                                <p style="margin: 0 0 6px 0; color: #000000;">&copy; ${new Date().getFullYear()} <strong>AirPay Engine</strong>. All rights reserved.</p>
                                <p style="margin: 0; color: #444444; font-weight: 700;">Platform Gerbang Pembayaran QRIS Dinamis Multi-Channel Indonesia</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

export const sendVerificationCodeEmail = async ({ to, code }: VerificationCodeEmailOptions) => {
    const subject = `🔐 Kode Verifikasi AirPay: ${code}`;
    const contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
            <span style="display: inline-block; background-color: #38BDF8; background-image: linear-gradient(#38BDF8, #38BDF8); border: 2px solid #000000; border-radius: 50px; padding: 4px 14px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; box-shadow: 2px 2px 0px #000000; color: #000000;">
                VERIFIKASI AKUN
            </span>
            <h2 style="font-size: 22px; font-weight: 900; color: #000000; margin: 16px 0 8px 0; letter-spacing: -0.5px;">Kode Otentikasi Pendaftaran</h2>
            <p style="font-size: 13px; font-weight: 700; color: #111111; margin: 0; line-height: 1.5;">
                Terima kasih telah mendaftar di <strong>AirPay</strong>. Gunakan kode verifikasi di bawah ini untuk menyelesaikan proses pendaftaran usaha Anda.
            </p>
        </div>

        <!-- Big OTP Code Box: Pure White with Crisp Black Border & Blue Header Badge -->
        <div style="background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF); border: 3px solid #000000; border-radius: 16px; padding: 24px 20px; text-align: center; margin: 24px 0; box-shadow: 4px 4px 0px #000000;">
            <p style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #000000; margin: 0 0 10px 0; letter-spacing: 1px;">KODE VERIFIKASI ANDA</p>
            <div style="font-size: 40px; font-weight: 900; color: #000000; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; line-height: 1; background-color: #38BDF8; background-image: linear-gradient(#38BDF8, #38BDF8); border: 2px solid #000000; border-radius: 12px; padding: 14px 10px; display: block; box-shadow: 2px 2px 0px #000000;">
                ${code}
            </div>
            <p style="font-size: 11px; font-weight: 800; color: #D90429; margin: 14px 0 0 0;">*Kode ini berlaku selama 10 menit. Jangan bagikan kepada siapa pun.</p>
        </div>

        <p style="font-size: 12px; font-weight: 700; color: #333333; line-height: 1.5; text-align: center; margin-top: 20px;">
            Jika Anda tidak pernah merasa meminta kode verifikasi ini, abaikan email ini secara aman.
        </p>
    `;

    await sendMail({ to, subject, html: renderEmailTemplate(contentHtml) });
};

export const sendPaymentSuccessEmail = async ({ to, merchantName, amount, transactionId, customerName }: PaymentSuccessEmailOptions) => {
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    const subject = `⚡ Pembayaran Masuk ${formattedAmount} - ${merchantName}`;
    const contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
            <span style="display: inline-block; background-color: #B2F5EA; background-image: linear-gradient(#B2F5EA, #B2F5EA); border: 2px solid #000000; border-radius: 50px; padding: 4px 14px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; box-shadow: 2px 2px 0px #000000; color: #000000;">
                TRANSAKSI SUKSES ⚡
            </span>
            <h2 style="font-size: 22px; font-weight: 900; color: #000000; margin: 16px 0 8px 0; letter-spacing: -0.5px;">Pembayaran QRIS Diterima</h2>
            <p style="font-size: 13px; font-weight: 700; color: #111111; margin: 0; line-height: 1.5;">
                Halo <strong>${merchantName}</strong>, selamat! Anda baru saja menerima pembayaran QRIS baru.
            </p>
        </div>

        <div style="background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF); border: 3px solid #000000; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; box-shadow: 4px 4px 0px #000000;">
            <p style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #000000; margin: 0 0 6px 0; letter-spacing: 1px;">TOTAL NOMINAL DITERIMA</p>
            <div style="font-size: 34px; font-weight: 900; color: #000000; background-color: #B2F5EA; background-image: linear-gradient(#B2F5EA, #B2F5EA); border: 2px solid #000000; border-radius: 12px; padding: 10px; box-shadow: 2px 2px 0px #000000;">
                ${formattedAmount}
            </div>
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 2px solid #000000; border-radius: 12px; overflow: hidden; background-color: #FFFFFF; font-size: 12px; font-weight: 800;">
            <tr style="border-bottom: 1px solid #000000;">
                <td style="padding: 12px 16px; border-bottom: 1px solid #000000; color: #444444; background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF);">ID Transaksi</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #000000; text-align: right; font-family: monospace; color: #000000; background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF);">${transactionId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #000000;">
                <td style="padding: 12px 16px; border-bottom: 1px solid #000000; color: #444444; background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF);">Nama Pembeli</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #000000; text-align: right; color: #000000; background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF);">${customerName || 'Pelanggan QRIS'}</td>
            </tr>
            <tr>
                <td style="padding: 12px 16px; color: #444444; background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF);">Status Saldo</td>
                <td style="padding: 12px 16px; text-align: right; color: #008844; background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF);">Langsung Diteruskan ke Wallet ⚡</td>
            </tr>
        </table>
    `;

    await sendMail({ to, subject, html: renderEmailTemplate(contentHtml) });
};

export const sendWithdrawalSuccessEmail = async ({ to, merchantName, amount, bankName, accountNumber }: WithdrawalSuccessEmailOptions) => {
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    const subject = `💸 Pencairan Dana Berhasil: ${formattedAmount}`;
    const contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
            <span style="display: inline-block; background-color: #38BDF8; background-image: linear-gradient(#38BDF8, #38BDF8); border: 2px solid #000000; border-radius: 50px; padding: 4px 14px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; box-shadow: 2px 2px 0px #000000; color: #000000;">
                PENCAIRAN SALDO SUKSES 💸
            </span>
            <h2 style="font-size: 22px; font-weight: 900; color: #000000; margin: 16px 0 8px 0; letter-spacing: -0.5px;">Dana Berhasil Ditransfer</h2>
            <p style="font-size: 13px; font-weight: 700; color: #111111; margin: 0; line-height: 1.5;">
                Halo <strong>${merchantName}</strong>, permintaan pencairan saldo toko Anda telah berhasil diproses oleh sistem.
            </p>
        </div>

        <div style="background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF); border: 3px solid #000000; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; box-shadow: 4px 4px 0px #000000;">
            <p style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #000000; margin: 0 0 6px 0; letter-spacing: 1px;">TOTAL DANA DITRANSFER</p>
            <div style="font-size: 34px; font-weight: 900; color: #000000; background-color: #38BDF8; background-image: linear-gradient(#38BDF8, #38BDF8); border: 2px solid #000000; border-radius: 12px; padding: 10px; box-shadow: 2px 2px 0px #000000;">
                ${formattedAmount}
            </div>
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 2px solid #000000; border-radius: 12px; overflow: hidden; background-color: #FFFFFF; font-size: 12px; font-weight: 800;">
            <tr style="border-bottom: 1px solid #000000;">
                <td style="padding: 12px 16px; border-bottom: 1px solid #000000; color: #444444; background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF);">Bank Tujuan</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #000000; text-align: right; color: #000000; background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF);">${bankName}</td>
            </tr>
            <tr>
                <td style="padding: 12px 16px; color: #444444; background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF);">Nomor Rekening</td>
                <td style="padding: 12px 16px; text-align: right; font-family: monospace; color: #000000; background-color: #FFFFFF; background-image: linear-gradient(#FFFFFF, #FFFFFF);">${accountNumber}</td>
            </tr>
        </table>
    `;

    await sendMail({ to, subject, html: renderEmailTemplate(contentHtml) });
};
