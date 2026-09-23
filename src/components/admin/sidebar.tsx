'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  Terminal,
  ArrowLeft,
  QrCode,
  Wallet,
  ShoppingBag,
  ArrowUpRight,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useFirebase } from '@/firebase';

const adminMenu = [
  {
    label: 'Overview System',
    items: [
      { href: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
      { href: '/admin/merchants', label: 'Merchant Directory', icon: Users },
      { href: '/admin/withdrawals', label: 'Withdraw Requests', icon: ArrowUpRight },
    ]
  },
  {
    label: 'Payment Channels',
    items: [
      //{ href: '/admin/payment-channels/orderkuota', label: 'Orderkuota Channel', icon: QrCode },
      { href: '/admin/payment-channels/gopay', label: 'Gopay Merchant', icon: Wallet },
      //{ href: '/admin/payment-channels/shopeepay', label: 'ShopeePay Channel', icon: ShoppingBag },
    ]
  },
  {
    label: 'System Control',
    items: [
      { href: '/admin/settings', label: 'System Settings', icon: Settings },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useFirebase();
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

  return (
    <Sidebar className="border-r-2 border-black dark:border-zinc-800 bg-[#FFFDF5] dark:bg-zinc-950 transition-colors">
      <SidebarHeader className="h-16 lg:h-[68px] flex flex-row items-center justify-center p-0 border-b-2 border-black dark:border-zinc-800 shrink-0 bg-[#FFFDF5] dark:bg-zinc-950">
        <Link href="/admin" className="flex items-center justify-center gap-2 group">
          <Logo imgClassName="w-12 h-12 sm:w-14 sm:h-14 group-hover:scale-105 transition-transform" hideText />
          <span className="font-headline font-black text-xl tracking-tight text-black dark:text-white">
            Air<span className="bg-neo-yellow px-1.5 py-0.5 border-2 border-black shadow-neo-sm rounded-lg ml-0.5 text-black">Pay</span>
          </span>
          <Badge className="bg-neo-coral text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-wider border-2 border-black shadow-neo-sm rounded-md ml-1">
            Admin
          </Badge>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-3 bg-[#FFFDF5] dark:bg-zinc-950">
        <SidebarMenu>
          <SidebarMenuItem className="px-1 pb-3">
            <SidebarMenuButton
              asChild
              className="w-full justify-start h-10 rounded-xl border-2 border-black dark:border-zinc-700 bg-neo-coral text-white hover:bg-rose-600 shadow-neo-sm font-headline font-black text-xs"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2 stroke-[3]" />
                <span className="uppercase tracking-wider">Kembali Ke Merchant</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {adminMenu.map((group) => (
            <SidebarGroup key={group.label} className="p-0 mb-4 last:mb-0">
              <SidebarGroupLabel className="px-3 text-[10px] font-black uppercase tracking-wider text-black/60 dark:text-zinc-400 mb-2">
                {group.label}
              </SidebarGroupLabel>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
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
                          <span className="text-xs">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </div>
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t-2 border-black dark:border-zinc-800 bg-[#FFFDF5] dark:bg-zinc-950">
        <div className="flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 rounded-xl shadow-neo-sm text-black dark:text-white">
          <Avatar className="h-8 w-8 border border-black dark:border-zinc-700 shrink-0">
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="Admin" data-ai-hint={userAvatar.imageHint} />}
            <AvatarFallback className="bg-neo-coral text-white font-black text-xs">A</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-xs min-w-0">
            <span className="font-headline font-black text-black dark:text-white truncate">System Administrator</span>
            <span className="text-black/60 dark:text-zinc-400 truncate text-[10px] font-bold">{user?.email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
