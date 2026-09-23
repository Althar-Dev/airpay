'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Zap,
  RefreshCw,
  ImageIcon,
  ShieldCheck,
  AlertCircle,
  LayoutDashboard,
  KeyRound,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const docsNavItems: NavGroup[] = [
  {
    title: 'Memulai',
    items: [
      { href: '/docs', label: 'Pengenalan & Autentikasi', icon: BookOpen },
    ]
  },
  {
    title: 'API Reference (Endpoints)',
    items: [
      { href: '/docs/create', label: 'POST /api/qris/create', icon: Zap, badge: 'POST', badgeColor: 'bg-emerald-600' },
      { href: '/docs/status', label: 'POST /api/qris/status', icon: RefreshCw, badge: 'POST', badgeColor: 'bg-emerald-600' },
      { href: '/docs/image', label: 'GET /api/qris/image', icon: ImageIcon, badge: 'GET', badgeColor: 'bg-blue-600' },
    ]
  },
  {
    title: 'Referensi',
    items: [
      { href: '/docs/errors', label: 'Kode HTTP Status', icon: AlertCircle },
    ]
  }
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FFFDF5] dark:bg-[#0c0c0e] text-black dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Dedicated Docs Top Header */}
      <header className="sticky top-0 z-40 w-full h-16 sm:h-[68px] bg-white dark:bg-zinc-950 border-b-2 sm:border-b-3 border-black dark:border-zinc-800 px-4 sm:px-8 flex items-center justify-between shadow-neo-sm dark:shadow-none transition-colors">
        <div className="flex items-center gap-3">
          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border-2 border-black dark:border-zinc-700 bg-neo-yellow shadow-neo-sm text-black"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[3]" /> : <Menu className="w-5 h-5 stroke-[3]" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <Logo imgClassName="w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-105 transition-transform" hideText />
            <div className="flex flex-col">
              <span className="font-headline font-black text-lg sm:text-xl tracking-tight text-black dark:text-white flex items-center gap-1.5">
                Air<span className="bg-neo-yellow px-1.5 py-0.2 border-2 border-black shadow-neo-sm rounded-lg text-black">Pay</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-black dark:bg-zinc-800 text-white px-2 py-0.5 rounded-md border dark:border-zinc-700">DOCS</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Badge className="hidden sm:inline-flex bg-neo-green text-black border-2 border-black shadow-neo-sm font-black text-[10px] uppercase px-2.5 py-1">
            API v1.0 Live ⚡
          </Badge>

          <Button asChild className="h-9 sm:h-10 px-3 sm:px-4 border-2 border-black dark:border-zinc-700 bg-neo-yellow hover:bg-yellow-400 text-black font-headline font-black text-xs shadow-neo-sm rounded-xl transition-all">
            <Link href="/dashboard" className="flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Dasbor Toko</span>
            </Link>
          </Button>

          <Button asChild className="h-9 sm:h-10 px-3 sm:px-4 border-2 border-black dark:border-zinc-700 bg-neo-sky hover:bg-sky-300 text-black font-headline font-black text-xs shadow-neo-sm rounded-xl transition-all">
            <Link href="/developers/api-keys" className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">API Keys</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* Dedicated Docs Sidebar (Desktop) */}
        <aside className="hidden lg:block w-72 shrink-0 border-r-2 sm:border-r-3 border-black dark:border-zinc-800 bg-[#FFFDF5] dark:bg-zinc-950 p-5 sticky top-[68px] h-[calc(100vh-68px)] overflow-y-auto [&::-webkit-scrollbar]:hidden transition-colors">
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-black/60 px-2">Dokumentasi API</span>
              <h2 className="font-headline font-black text-lg text-black px-2">Developer Hub</h2>
            </div>

            <nav className="space-y-6">
              {docsNavItems.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2">
                  <h3 className="px-2 text-[10px] font-black uppercase tracking-wider text-black/60 border-b border-black/10 pb-1">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item, idx) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={idx}
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all ${isActive
                              ? 'bg-neo-yellow border-black shadow-neo-sm text-black font-headline font-black'
                              : 'border-transparent hover:border-black hover:bg-white text-black/80'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <item.icon className="w-4 h-4 shrink-0 stroke-[2.5]" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className={`${item.badgeColor} text-white font-black text-[9px] px-1.5 py-0.2 rounded border border-black`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Dedicated Docs Sidebar (Mobile Drawer) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <aside className="relative w-80 max-w-[85%] bg-[#FFFDF5] border-r-3 border-black p-5 h-full overflow-y-auto shadow-neo-lg z-10 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-black pb-3">
                  <span className="font-headline font-black text-lg text-black">Menu Dokumentasi</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg border-2 border-black bg-neo-coral text-white">
                    <X className="w-5 h-5 stroke-[3]" />
                  </button>
                </div>

                <nav className="space-y-6">
                  {docsNavItems.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-2">
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-black/60">
                        {group.title}
                      </h3>
                      <div className="space-y-1">
                        {group.items.map((item, idx) => {
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={idx}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all ${isActive
                                  ? 'bg-neo-yellow border-black shadow-neo-sm text-black font-headline font-black'
                                  : 'border-2 border-black bg-white shadow-neo-sm text-black'
                                }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <item.icon className="w-4 h-4 shrink-0 stroke-[2.5]" />
                                <span className="truncate">{item.label}</span>
                              </div>
                              {item.badge && (
                                <span className={`${item.badgeColor} text-white font-black text-[9px] px-1.5 py-0.2 rounded border border-black`}>
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t-2 border-black">
                <Button asChild className="w-full border-2 border-black bg-neo-yellow text-black font-headline font-black text-xs shadow-neo-sm">
                  <Link href="/dashboard">Kembali ke Dashboard</Link>
                </Button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Documentation Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-8 bg-[#FFFDF5] dark:bg-[#0c0c0e] text-black dark:text-zinc-100 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
