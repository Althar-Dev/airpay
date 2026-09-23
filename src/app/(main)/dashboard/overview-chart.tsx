'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
};

interface OverviewChartProps {
    data: { month: string, revenue: number }[];
    loading: boolean;
}

export function OverviewChart({ data, loading }: OverviewChartProps) {
  
  if (loading) {
      return (
        <Card className="shadow-sm border">
            <CardHeader>
                <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="flex h-[300px] items-end justify-between gap-2 px-4 pb-4">
                  <Skeleton className="h-[40%] w-full" />
                  <Skeleton className="h-[70%] w-full" />
                  <Skeleton className="h-[55%] w-full" />
                  <Skeleton className="h-[85%] w-full" />
                  <Skeleton className="h-[35%] w-full" />
                  <Skeleton className="h-[60%] w-full" />
                </div>
            </CardContent>
        </Card>
      );
  }

  return (
    <Card className="shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg">Overview Pendapatan</CardTitle>
      </CardHeader>
      <CardContent className="pl-0 sm:pl-2">
        <ChartContainer 
          config={chartConfig} 
          className="aspect-auto h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={45}
                fontSize={10}
                tickFormatter={(value) => `Rp${Number(value) >= 1000 ? (Number(value) / 1000).toFixed(0) + 'k' : value}`}
              />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                content={<ChartTooltipContent formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value as number)} />} 
               />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}