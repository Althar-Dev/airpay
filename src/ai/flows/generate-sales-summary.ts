'use server';
/**
 * @fileOverview An AI agent that provides a summary of sales performance.
 *
 * - generateSalesSummary - A function that generates an AI-powered summary of sales performance.
 * - SalesPerformanceSummaryInput - The input type for the generateSalesSummary function.
 * - SalesPerformanceSummaryOutput - The return type for the generateSalesSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SalesPerformanceSummaryInputSchema = z.object({
  timeRange: z
    .enum(['daily', 'weekly', 'monthly'])
    .describe('The time range for the sales summary (daily, weekly, or monthly).'),
  salesData: z
    .string()
    .describe(
      'A JSON string representing sales data. Each object in the array should contain date, revenue, and transaction details relevant to the specified time range, e.g., [{"date": "2023-10-26", "revenue": 1500, "transactions": 15}, ...].'
    ),
});
export type SalesPerformanceSummaryInput = z.infer<
  typeof SalesPerformanceSummaryInputSchema
>;

const SalesPerformanceSummaryOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the sales performance.'),
  keyTrends: z
    .array(z.string())
    .describe('List of key trends identified in the sales performance (e.g., growth, decline, popular times).'),
  anomalies: z
    .array(z.string())
    .describe('List of any anomalies or unusual patterns found in the sales performance (e.g., unexpected spikes or drops).'),
});
export type SalesPerformanceSummaryOutput = z.infer<
  typeof SalesPerformanceSummaryOutputSchema
>;

export async function generateSalesSummary(
  input: SalesPerformanceSummaryInput
): Promise<SalesPerformanceSummaryOutput> {
  return salesPerformanceSummaryFlow(input);
}

const salesPerformanceSummaryPrompt = ai.definePrompt({
  name: 'salesPerformanceSummaryPrompt',
  input: { schema: SalesPerformanceSummaryInputSchema },
  output: { schema: SalesPerformanceSummaryOutputSchema },
  prompt: `You are a sales performance analyst for AirPay. Your task is to analyze the provided sales data for a {{{timeRange}}} period and generate a summary, identify key trends, and pinpoint any anomalies.

The sales data is provided as a JSON string. Each object in the array represents a sales record, typically including fields like "date", "revenue", and "transactions". For example:
[
  {"date": "2023-10-01", "revenue": 1500, "transactions": 15},
  {"date": "2023-10-02", "revenue": 1650, "transactions": 17}
]

Analyze the following sales data for the {{{timeRange}}} period:
{{{salesData}}}

Provide a clear and concise summary, highlight any significant trends (e.g., growth, decline, popular products/times if inferred), and mention any unusual activities or anomalies (e.g., unexpected spikes or drops in sales).

Ensure your response is structured as a JSON object strictly following the output schema.`,
});

const salesPerformanceSummaryFlow = ai.defineFlow(
  {
    name: 'salesPerformanceSummaryFlow',
    inputSchema: SalesPerformanceSummaryInputSchema,
    outputSchema: SalesPerformanceSummaryOutputSchema,
  },
  async input => {
    const { output } = await salesPerformanceSummaryPrompt(input);
    return output!;
  }
);
