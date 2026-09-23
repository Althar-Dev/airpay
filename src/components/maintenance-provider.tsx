'use client';

import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading, firestore } = useFirebase();
    const router = useRouter();
    const pathname = usePathname();

    const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
    const { data: settings, isLoading: isSettingsLoading } = useDoc<{ maintenanceMode: boolean }>(settingsRef);

    const merchantRef = useMemoFirebase(() => user ? doc(firestore, 'merchants', user.uid) : null, [user, firestore]);
    const { data: merchant, isLoading: isMerchantLoading } = useDoc<{ admin?: boolean }>(merchantRef);

    const isLoading = isUserLoading || isSettingsLoading || (user && isMerchantLoading);
    const isMaintenanceMode = settings?.maintenanceMode ?? false;
    const isAdmin = merchant?.admin === true;

    const onMaintenancePage = pathname === '/maintenance';

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (isMaintenanceMode && !isAdmin && !onMaintenancePage) {
            router.replace('/maintenance');
        }
    }, [isLoading, isMaintenanceMode, isAdmin, onMaintenancePage, router]);
    
    if (isLoading && isMaintenanceMode && !onMaintenancePage) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">Checking application status...</p>
            </div>
        );
    }
    
    if (isMaintenanceMode && !isAdmin && !onMaintenancePage) {
        return (
             <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">Checking application status...</p>
            </div>
        );
    }

    return <>{children}</>;
}
