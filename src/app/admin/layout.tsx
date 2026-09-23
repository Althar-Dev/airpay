'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/sidebar';
import AdminHeader from '@/components/admin/header';
import { FirebaseClientProvider, useFirebase, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Wrench, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const [isFixing, setIsFixing] = useState(false);

  const merchantRef = useMemoFirebase(() => 
    user ? doc(firestore, 'merchants', user.uid) : null, 
    [user, firestore]
  );
  
  const { data: merchant, isLoading: isMerchantLoading } = useDoc<{ admin?: boolean, email?: string, name?: string }>(merchantRef);

  useEffect(() => {
    if (isUserLoading || isMerchantLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (merchant && merchant.admin !== true) {
      router.replace('/dashboard');
    }
  }, [user, merchant, isUserLoading, isMerchantLoading, router]);

  const handleFixProfile = async () => {
    if (!user || !merchantRef) return;
    setIsFixing(true);
    try {
      const data = {
        id: user.uid,
        admin: true,
        email: user.email || '',
        name: user.displayName || 'Admin User',
        isActive: true,
        registrationDate: new Date().toISOString(),
        merchantId: `ADM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        emailVerified: true
      };
      setDocumentNonBlocking(merchantRef, data, { merge: true });
    } catch (err) {
      console.error("Failed to fix profile:", err);
    } finally {
      setTimeout(() => setIsFixing(false), 1000);
    }
  };

  if (isUserLoading || isMerchantLoading || isFixing) {
    return null;
  }

  if (user && !merchant) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FFFDF5] dark:bg-[#0c0c0e] p-4 text-black dark:text-white transition-colors">
        <Card className="max-w-md w-full border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-neo-lg text-black dark:text-white">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-neo-coral border-2 border-black shadow-neo-sm flex items-center justify-center mb-4 text-white">
              <ShieldAlert className="h-6 w-6 stroke-[2.5]" />
            </div>
            <CardTitle className="font-headline font-black text-black dark:text-white">Admin Profile Not Found</CardTitle>
            <CardDescription className="text-xs font-bold text-black/70 dark:text-zinc-300">
              User ID: {user.uid}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs font-bold text-center text-black/70 dark:text-zinc-300">
            Akun Anda belum terdaftar sebagai admin di database.
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={handleFixProfile} className="w-full h-11 border-2 border-black dark:border-zinc-700 bg-neo-yellow text-black font-headline font-black text-xs shadow-neo-sm hover:shadow-neo rounded-xl">
               <Wrench className="mr-2 h-4 w-4 stroke-[2.5]" />
               Daftarkan Sebagai Admin
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full h-10 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white font-headline font-black text-xs rounded-xl">
              Ke Dashboard Merchant
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (user && merchant?.admin === true) {
    return <>{children}</>;
  }

  return null;
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseClientProvider>
      <AdminGuard>
        <SidebarProvider defaultOpen>
          <div className="flex min-h-screen w-full max-w-full bg-[#FFFDF5] dark:bg-[#0c0c0e] text-black dark:text-zinc-100 transition-colors">
            <AdminSidebar />
            <div className="flex-1 min-w-0 w-full flex flex-col">
              <AdminHeader />
              <main className="p-3 sm:p-6 lg:p-8 flex-1 min-w-0 w-full max-w-full overflow-x-hidden">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </AdminGuard>
    </FirebaseClientProvider>
  );
}
