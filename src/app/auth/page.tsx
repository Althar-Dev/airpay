
import { redirect } from 'next/navigation';

export default function AuthRedirectPage() {
  // Redirect rute lama ke rute login yang baru
  redirect('/login');
}
