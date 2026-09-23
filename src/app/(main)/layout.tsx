import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/sidebar';
import AppHeader from '@/components/layout/header';
import { FirebaseClientProvider } from '@/firebase';
import { MaintenanceProvider } from '@/components/maintenance-provider';

export default function AppPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseClientProvider>
      <MaintenanceProvider>
        <SidebarProvider defaultOpen>
          <div className="flex min-h-screen w-full max-w-full bg-[#FFFDF5] dark:bg-[#0c0c0e] text-black dark:text-zinc-100 transition-colors">
            <AppSidebar />
            <div className="flex-1 min-w-0 w-full flex flex-col">
              <AppHeader />
              <main className="p-3 sm:p-6 lg:p-8 flex-1 min-w-0 w-full max-w-full overflow-x-hidden">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </MaintenanceProvider>
    </FirebaseClientProvider>
  );
}
