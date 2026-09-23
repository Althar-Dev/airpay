'use server';

/**
 * @fileOverview Pustaka integrasi untuk GoBiz Bridge API (Gopay Merchant).
 * 
 * Mengatur proses otentikasi (OTP) dan pengambilan mutasi transaksi.
 */

const GOBIZ_BASE_URL = 'https://api.gomerchant.biz.id';

export interface GoBizLoginResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    requires_otp: boolean;
    otp_token: string;
    otp_length: number;
    x_uniqueid: string;
  };
}

export interface GoBizVerifyResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    access_token: string;
    refresh_token: string;
    x_uniqueid: string;
    merchants: {
      id: string;
      name: string;
    }[];
  };
}

export interface GoBizRefreshResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    x_uniqueid: string;
  };
}

export interface GoBizMutation {
  id: string;
  amount: number;
  status: string;
  timestamp: string;
  type: 'IN' | 'OUT';
  description: string;
  [key: string]: any;
}

export interface GoBizMutationResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    merchant_id: string;
    mutations: GoBizMutation[];
    token_refreshed: boolean;
    access_token?: string;
    refresh_token?: string;
  };
}

/**
 * Helper to handle fetch responses and avoid JSON parsing errors when receiving HTML
 */
async function handleResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  } else {
    // If not JSON, it's likely an HTML error page from the server/proxy
    const text = await response.text();
    console.error("Non-JSON Response received:", text.substring(0, 200));
    throw new Error(`Server Bridge API mengembalikan format tidak valid (Status: ${response.status}). Pastikan endpoint URL sudah benar dan server sedang aktif.`);
  }
}

/**
 * BRIDGE API: Request OTP GoBiz. 
 * Mengirimkan sinyal login ke nomor HP target.
 */
export async function goBizLogin(apiKey: string, phoneNumber: string): Promise<GoBizLoginResponse> {
  try {
    const response = await fetch(`${GOBIZ_BASE_URL}/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey: apiKey, phone_number: phoneNumber }),
    });
    
    const result = await handleResponse(response);
    
    if (!response.ok || result.status === 'error') {
      return { 
        status: 'error', 
        message: result.message || `Gagal meminta OTP (Status: ${response.status}).` 
      };
    }
    
    return result;
  } catch (error: any) {
    console.error('GoBiz Login Error:', error);
    return { status: 'error', message: error.message || 'Terjadi kesalahan koneksi ke server Bridge.' };
  }
}

/**
 * BRIDGE API: Verifikasi OTP GoBiz. 
 * Menukarkan kode OTP dan otp_token menjadi token otentikasi.
 */
export async function goBizVerify(apiKey: string, otpCode: string, otpToken: string, xUniqueId: string): Promise<GoBizVerifyResponse> {
  try {
    const response = await fetch(`${GOBIZ_BASE_URL}/v1/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: apiKey,
        otp_code: otpCode,
        otp_token: otpToken,
        x_uniqueid: xUniqueId
      }),
    });
    
    const result = await handleResponse(response);

    if (!response.ok || result.status === 'error') {
      return { 
        status: 'error', 
        message: result.message || `Verifikasi gagal (Status: ${response.status}).` 
      };
    }
    
    return result;
  } catch (error: any) {
    console.error('GoBiz Verify Error:', error);
    return { status: 'error', message: error.message || 'Gagal memverifikasi OTP karena masalah koneksi.' };
  }
}

/**
 * BRIDGE API: Refresh Access Token GoBiz secara manual.
 */
export async function goBizRefresh(apiKey: string, refreshToken: string, xUniqueId: string): Promise<GoBizRefreshResponse> {
  try {
    const response = await fetch(`${GOBIZ_BASE_URL}/v1/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: apiKey,
        refresh_token: refreshToken,
        x_uniqueid: xUniqueId
      }),
    });
    const result = await handleResponse(response);
    return result;
  } catch (error: any) {
    return { status: 'error', message: error.message };
  }
}

/**
 * BRIDGE API: Ambil mutasi terproses.
 */
export async function goBizMutations(params: {
  apiKey: string;
  accessToken: string;
  refreshToken: string;
  xUniqueId: string;
  merchantId?: string;
  limit?: number;
}): Promise<GoBizMutationResponse> {
  try {
    const response = await fetch(`${GOBIZ_BASE_URL}/v1/mutations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: params.apiKey,
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
        x_uniqueid: params.xUniqueId,
        merchant_id: params.merchantId,
        limit: params.limit || 20
      }),
    });
    const result = await handleResponse(response);
    return result;
  } catch (error: any) {
    return { status: 'error', message: error.message };
  }
}
