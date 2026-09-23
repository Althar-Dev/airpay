'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeftRight,
  BookOpen,
  KeyRound,
  LayoutDashboard,
  User,
  Wallet,
  Palette,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';

const menuGroups = [
  {
    label: 'Dashboard Utama',
    items: [
      { href: '/dashboard', label: 'Ringkasan Omset', icon: LayoutDashboard },
      { href: '/wallet', label: 'Saldo & Payout', icon: Wallet },
      { href: '/transactions', label: 'Riwayat Transaksi', icon: ArrowLeftRight },
    ]
  },
  {
    label: 'Developer & Integration',
    items: [
      { href: '/developers/api-keys', label: 'Kunci API', icon: KeyRound },
      { href: '/docs', label: 'Dokumentasi', icon: BookOpen },
      { href: '/developers/qris-design', label: 'Qris Design', icon: Palette },
    ]
  }
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r-2 border-black dark:border-zinc-800 bg-[#FFFDF5] dark:bg-zinc-950 transition-colors">
      {/* Header aligned with AppHeader height */}
      <SidebarHeader className="h-16 lg:h-[68px] flex flex-row items-center justify-center p-0 border-b-2 border-black dark:border-zinc-800 shrink-0 bg-[#FFFDF5] dark:bg-zinc-950">
        <Link href="/" className="flex items-center justify-center gap-2 group">
          <Logo imgClassName="w-12 h-12 sm:w-14 sm:h-14 group-hover:scale-105 transition-transform" hideText />
          <span className="font-headline font-black text-xl tracking-tight text-black dark:text-white">
            Air<span className="bg-neo-yellow px-1.5 py-0.5 border-2 border-black shadow-neo-sm rounded-lg ml-0.5 text-black">Pay</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-3 bg-[#FFFDF5] dark:bg-zinc-950">
        <SidebarMenu>
          {menuGroups.map((group) => (
            <SidebarGroup key={group.label} className="p-0 mb-4 last:mb-0">
              <SidebarGroupLabel className="px-3 text-[10px] font-black uppercase tracking-wider text-black/60 dark:text-zinc-400 mb-2">
                {group.label}
              </SidebarGroupLabel>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className={`w-full justify-start h-10.5 rounded-xl px-3 transition-all duration-200 border-2 select-none ${isActive
                          ? 'border-black dark:border-zinc-700 bg-neo-yellow text-black shadow-neo-sm font-headline font-black'
                          : 'border-transparent hover:border-black dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 text-black/80 dark:text-zinc-300 font-extrabold'
                          }`}
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className={`h-4 w-4 stroke-[2.5] transition-colors ${isActive ? 'text-black' : 'text-black/70 dark:text-zinc-400'}`} />
                          <span className="text-xs">
                            {item.label}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </div>
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Pinned Bottom Account Menu */}
      <SidebarFooter className="p-3 border-t-2 border-black dark:border-zinc-800 bg-[#FFFDF5] dark:bg-zinc-950 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            {(() => {
              const isActive = pathname === '/account';
              return (
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip="Profil Toko"
                  className={`w-full justify-start h-11 rounded-xl px-3 transition-all duration-200 border-2 select-none ${isActive
                    ? 'border-black dark:border-zinc-700 bg-neo-yellow text-black shadow-neo-sm font-headline font-black'
                    : 'border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-neo-cream dark:hover:bg-zinc-800 text-black dark:text-white font-headline font-black shadow-neo-sm'
                    }`}
                >
                  <Link href="/account" className="flex items-center gap-3">
                    <User className={`h-4.5 w-4.5 stroke-[2.5] transition-colors ${isActive ? 'text-black' : 'text-black/80 dark:text-zinc-300'}`} />
                    <span className="text-xs font-headline font-black">
                      Profil Toko
                    </span>
                  </Link>
                </SidebarMenuButton>
              );
            })()}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
