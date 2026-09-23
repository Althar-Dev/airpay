import { redirect } from 'next/navigation';

export default function PaymentChannelsRedirect() {
  // Redirect to the first channel by default
  redirect('/admin/payment-channels/gopay');
}
