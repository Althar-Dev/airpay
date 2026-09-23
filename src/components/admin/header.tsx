'use client';

import { Search, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '../ui/sidebar';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../theme-toggle';

export default function AdminHeader() {
  const { auth } = useFirebase();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b-2 border-black dark:border-zinc-800 bg-[#FFFDF5] dark:bg-zinc-950 px-4 lg:h-[68px] lg:px-6 sticky top-0 z-30 shadow-neo-sm dark:shadow-none transition-colors">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-neo-sm hover:bg-neo-yellow dark:hover:bg-zinc-800 rounded-xl p-1.5 h-9 w-9 text-black dark:text-white" />
        <div className="hidden md:flex items-center gap-2 bg-neo-coral text-white border-2 border-black dark:border-zinc-700 px-3 py-1 rounded-full shadow-neo-sm text-xs font-black">
          <Shield className="h-3.5 w-3.5 stroke-[3]" />
          <span>ADMIN CONTROL CENTER</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <div className="hidden lg:flex relative max-w-xs">
          <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-black dark:text-zinc-400 stroke-[3]" />
          <Input
            type="search"
            placeholder="Cari merchant..."
            className="h-9 w-64 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 rounded-xl pl-9 text-xs font-bold text-black dark:text-white shadow-neo-sm focus-visible:ring-black dark:focus-visible:ring-zinc-400"
          />
        </div>

        {/* Prominent Admin Logout Button */}
        <Button
          onClick={handleLogout}
          className="h-10 px-3 sm:px-4 border-2 border-black dark:border-zinc-700 bg-neo-coral hover:bg-rose-600 text-white font-headline font-black text-xs shadow-neo-sm hover:shadow-neo rounded-xl transition-all active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-2 shrink-0"
        >
          <LogOut className="h-4 w-4 stroke-[3]" />
          <span className="hidden sm:inline">Keluar Admin</span>
          <span className="sm:hidden">Keluar</span>
        </Button>
      </div>
    </header>
  );
}
