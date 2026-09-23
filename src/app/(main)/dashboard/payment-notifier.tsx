'use client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { playNotificationSound } from '@/lib/sounds';
import { BellRing } from 'lucide-react';
import { useState } from 'react';

export function PaymentNotifier() {
    const { toast } = useToast();
    const [isNotifying, setIsNotifying] = useState(false);

    const handleNotify = async () => {
        setIsNotifying(true);
        try {
            await playNotificationSound();
            toast({
                title: 'Payment Received',
                description: 'IDR 50,000 from Customer an. John Doe.',
            });
        } catch (error) {
            console.error("Failed to play notification sound", error);
             toast({
                variant: 'destructive',
                title: 'Audio Error',
                description: 'Could not play notification sound. Please interact with the page first.',
            });
        } finally {
            // Re-enable button after a short delay
            setTimeout(() => setIsNotifying(false), 1000);
        }
    };

    return (
        <Button onClick={handleNotify} disabled={isNotifying}>
            <BellRing className="mr-2 h-4 w-4" />
            Simulate Payment
        </Button>
    );
}
