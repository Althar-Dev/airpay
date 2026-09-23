'use server';

import { executeOrderkuotaPayout, OrderkuotaPayoutParams, OrderkuotaPayoutResult } from '@/lib/payment/orderkuota-payout';

/**
 * Server Action untuk mengeksekusi H2H Orderkuota Payout dari Server Node.js (Bypass Browser CORS restriction)
 */
export async function processOrderkuotaPayoutAction(params: OrderkuotaPayoutParams): Promise<OrderkuotaPayoutResult> {
  return await executeOrderkuotaPayout(params);
}
