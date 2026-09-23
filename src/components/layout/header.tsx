'use client';

import { Bell, LogOut, Settings, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { SidebarTrigger } from '../ui/sidebar';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { ThemeToggle } from '../theme-toggle';

export default function AppHeader() {
  const { user, firestore, auth } = useFirebase();
  const router = useRouter();

  const merchantRef = useMemoFirebase(() => user ? doc(firestore, 'merchants', user.uid) : null, [user, firestore]);
  const { data: merchantData, isLoading: isMerchantLoading } = useDoc<{ name: string }>(merchantRef);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  // Mendapatkan inisial dari nama atau email
  const getInitial = () => {
    if (merchantData?.name) return merchantData.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <header className="flex h-16 items-center justify-between border-b-2 border-black dark:border-zinc-800 bg-[#FFFDF5] dark:bg-zinc-950 px-4 lg:h-[68px] lg:px-6 sticky top-0 z-30 shadow-neo-sm dark:shadow-none transition-colors">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-neo-sm hover:bg-neo-yellow dark:hover:bg-zinc-800 rounded-xl p-1.5 h-9 w-9 text-black dark:text-white" />
        <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 px-3 py-1 rounded-full shadow-neo-sm text-xs font-black text-black dark:text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black dark:border-zinc-900" />
          Gateway Active 99.98%
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-neo-yellow dark:hover:bg-zinc-800 text-black dark:text-white shadow-neo-sm rounded-xl px-2.5 flex items-center gap-2 transition-all">
              <Avatar className='h-7 w-7 border-2 border-black dark:border-zinc-700 shadow-neo-sm'>
                <AvatarFallback className="bg-neo-yellow dark:bg-yellow-400 text-black font-black text-[10px]">
                  {getInitial()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-block font-headline font-black text-xs text-black dark:text-white truncate max-w-[100px]">
                {isMerchantLoading ? <Skeleton className="h-3 w-16" /> : (merchantData?.name || 'Merchant')}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 border-3 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-neo-md rounded-2xl p-2 space-y-1">
            <DropdownMenuLabel className="font-normal p-2 bg-neo-cream dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 rounded-xl">
              <div className="flex flex-col space-y-0.5">
                {isMerchantLoading ? (
                  <Skeleton className="h-4 w-24 mb-1" />
                ) : (
                  <p className="text-xs font-headline font-black text-black dark:text-white">
                    {merchantData?.name || 'Merchant'}
                  </p>
                )}
                <p className="text-[10px] font-bold text-black/70 dark:text-zinc-400 truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-black/10 dark:bg-zinc-800" />

            <DropdownMenuItem asChild className="rounded-xl hover:bg-neo-sky dark:hover:bg-zinc-800 font-black text-xs cursor-pointer focus:bg-neo-sky dark:focus:bg-zinc-800 dark:text-zinc-200">
              <Link href="/account" className="flex items-center gap-2 w-full">
                <Settings className="h-4 w-4 stroke-[2.5]" />
                <span>Pengaturan Profil Toko</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-black/10 dark:bg-zinc-800" />

            <DropdownMenuItem onClick={handleLogout} className="rounded-xl hover:bg-neo-coral dark:hover:bg-rose-900/40 hover:text-white font-black text-xs cursor-pointer text-rose-600 dark:text-rose-400 focus:bg-neo-coral focus:text-white">
              <LogOut className="mr-2 h-4 w-4 stroke-[2.5]" />
              <span>Keluar dari Akun</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
