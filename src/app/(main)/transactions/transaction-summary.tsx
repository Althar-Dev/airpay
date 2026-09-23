'use client';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { summarizeTransactionBatch, TransactionBatchSummaryOutput, TransactionBatchSummaryInput } from '@/ai/flows/summarize-transaction-batch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

type Transaction = {
    id: string;
    amount: number;
    date: string;
    status: "Successful" | "Pending" | "Failed";
    customer: string;
};

interface TransactionSummaryProps {
    transactions: Transaction[];
}

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
    const [summary, setSummary] = useState<TransactionBatchSummaryOutput | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleGenerateSummary = () => {
        startTransition(async () => {
            try {
                const input: TransactionBatchSummaryInput = {
                    transactions: transactions.map(t => ({
                        id: t.id,
                        amount: t.amount,
                        currency: "IDR",
                        payerDetails: t.customer,
                        timestamp: new Date(t.date).toISOString(),
                        status: t.status.toUpperCase() as 'SUCCESS' | 'FAILED' | 'PENDING',
                    }))
                };
                const result = await summarizeTransactionBatch(input);
                setSummary(result);
            } catch (error) {
                console.error('Error summarizing transactions:', error);
                toast({
                    variant: 'destructive',
                    title: 'AI Summary Failed',
                    description: 'Could not summarize transactions. Please try again.',
                });
                setSummary(null);
                setIsOpen(false);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1" onClick={handleGenerateSummary}>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Summarize
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>AI Transaction Summary</DialogTitle>
                    <DialogDescription>
                        An AI-generated analysis of the selected transaction batch.
                    </DialogDescription>
                </DialogHeader>
                {isPending ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>Analyzing transactions...</p>
                        </div>
                    </div>
                ) : summary ? (
                    <div className="text-sm space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="font-semibold">Total Amount:</div>
                            <div>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.totalAmount)}</div>
                            
                            <div className="font-semibold">Avg. Transaction:</div>
                            <div>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.averageTransactionValue)}</div>

                            <div className="font-semibold">Total Transactions:</div>
                            <div>{summary.numberOfTransactions}</div>

                            <div className="font-semibold">Successful:</div>
                            <div>{summary.successfulTransactions}</div>

                            <div className="font-semibold">Failed:</div>
                            <div>{summary.failedTransactions}</div>

                            <div className="font-semibold">Pending:</div>
                            <div>{summary.pendingTransactions}</div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-1">Period Covered</h4>
                            <p className="text-muted-foreground">{summary.periodCovered}</p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-1">Analysis</h4>
                            <p className="text-muted-foreground bg-secondary p-3 rounded-md">{summary.analysis}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">No summary available.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
