'use client';
import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateSalesSummary, SalesPerformanceSummaryOutput, SalesPerformanceSummaryInput } from '@/ai/flows/generate-sales-summary';
import { salesData } from '@/lib/data';
import { Loader2, Wand2, AlertTriangle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type TimeRange = 'daily' | 'weekly' | 'monthly';

export function SalesSummary() {
  const [summary, setSummary] = useState<SalesPerformanceSummaryOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedRange, setSelectedRange] = useState<TimeRange | null>(null);
  const { toast } = useToast();

  const handleGenerateSummary = (timeRange: TimeRange) => {
    startTransition(async () => {
      setSelectedRange(timeRange);
      try {
        const input: SalesPerformanceSummaryInput = {
          timeRange,
          salesData: JSON.stringify(salesData),
        };
        const result = await generateSalesSummary(input);
        setSummary(result);
      } catch (error) {
        console.error('Error generating sales summary:', error);
        toast({
          variant: 'destructive',
          title: 'AI Summary Failed',
          description: 'Could not generate the sales summary. Please try again.',
        });
        setSummary(null);
      }
    });
  };

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <div className='flex items-start justify-between'>
            <div>
                <CardTitle>AI Sales Summary</CardTitle>
                <CardDescription>Get AI-powered insights into your sales performance.</CardDescription>
            </div>
            <Wand2 className="h-6 w-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          {(['daily', 'weekly', 'monthly'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={selectedRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleGenerateSummary(range)}
              disabled={isPending}
              className="capitalize"
            >
              {isPending && selectedRange === range ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {range}
            </Button>
          ))}
        </div>

        {isPending && (
            <div className="flex items-center justify-center h-40">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Our AI is analyzing your data...</p>
                </div>
            </div>
        )}

        {!isPending && summary && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground">{summary.summary}</p>
            </div>
            <Separator />
            {summary.keyTrends?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className='h-4 w-4' /> Key Trends</h4>
                <div className="flex flex-wrap gap-2">
                  {summary.keyTrends.map((trend, index) => (
                    <Badge key={index} variant="secondary">{trend}</Badge>
                  ))}
                </div>
              </div>
            )}
            {summary.anomalies?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className='h-4 w-4' /> Anomalies</h4>
                <div className="flex flex-wrap gap-2">
                  {summary.anomalies.map((anomaly, index) => (
                    <Badge key={index} variant="destructive">{anomaly}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {!isPending && !summary && (
            <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Select a time range to generate a summary.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
