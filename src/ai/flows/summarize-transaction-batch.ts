'use server';
/**
 * @fileOverview This file implements a Genkit flow for summarizing a batch of transactions.
 *
 * - summarizeTransactionBatch - A function that handles the transaction batch summary process.
 * - TransactionBatchSummaryInput - The input type for the summarizeTransactionBatch function.
 * - TransactionBatchSummaryOutput - The return type for the summarizeTransactionBatch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TransactionBatchInputSchema = z.object({
  id: z.string().describe('Unique identifier for the transaction.'),
  amount: z.number().describe('The amount of the transaction.'),
  currency: z.string().describe('The currency of the transaction (e.g., "IDR", "USD").'),
  payerDetails: z
    .string()
    .describe('Details about the payer, such as name or anonymized ID.'),
  timestamp: z
    .string()
    .datetime()
    .describe('ISO 8601 formatted timestamp of the transaction.'),
  status: z.enum(['SUCCESS', 'FAILED', 'PENDING']).describe('The status of the transaction.'),
});

const TransactionBatchSummaryInputSchema = z.object({
  transactions: z.array(TransactionBatchInputSchema).describe('An array of payment transactions to be summarized.'),
});
export type TransactionBatchSummaryInput = z.infer<typeof TransactionBatchSummaryInputSchema>;

const TransactionBatchSummaryOutputSchema = z.object({
  totalAmount: z.number().describe('The sum of all successful transaction amounts.'),
  averageTransactionValue: z.number().describe('The average value of all successful transactions.'),
  numberOfTransactions: z.number().describe('The total number of transactions in the batch (including successful, failed, and pending).'),
  successfulTransactions: z.number().describe('The count of transactions with a SUCCESS status.'),
  failedTransactions: z.number().describe('The count of transactions with a FAILED status.'),
  pendingTransactions: z.number().describe('The count of transactions with a PENDING status.'),
  commonPayerTypes: z.array(z.string()).describe('A list of common payer types or frequently occurring payer details identified in the batch.'),
  periodCovered: z.string().describe('A descriptive string indicating the time range covered by the transactions (e.g., "October 27, 2023 10:00 - October 27, 2023 12:00").'),
  analysis: z.string().describe('A detailed textual analysis providing insights, trends, and key observations about the transaction batch.'),
});
export type TransactionBatchSummaryOutput = z.infer<typeof TransactionBatchSummaryOutputSchema>;

export async function summarizeTransactionBatch(input: TransactionBatchSummaryInput): Promise<TransactionBatchSummaryOutput> {
  return transactionBatchSummaryFlow(input);
}

const transactionBatchSummaryPrompt = ai.definePrompt({
  name: 'transactionBatchSummaryPrompt',
  input: { schema: TransactionBatchSummaryInputSchema },
  output: { schema: TransactionBatchSummaryOutputSchema },
  prompt: `You are an AI assistant specialized in analyzing financial transactions for merchants.
Your task is to analyze a batch of payment transactions and provide a comprehensive, insightful summary and analysis based on the provided input.
Focus on extracting key financial metrics, identifying patterns, and offering observations.

Transactions:
{{#each transactions}}
- ID: {{this.id}}, Amount: {{this.amount}} {{this.currency}}, Payer: {{this.payerDetails}}, Timestamp: {{this.timestamp}}, Status: {{this.status}}
{{/each}}

Based on the provided transactions, generate a structured JSON summary. Ensure the following metrics and insights are included:
- Calculate 'totalAmount' as the sum of all 'amount' for transactions with 'SUCCESS' status.
- Calculate 'averageTransactionValue' as the average of 'amount' for transactions with 'SUCCESS' status.
- Count 'numberOfTransactions' as the total count of all transactions.
- Count 'successfulTransactions' for transactions with 'SUCCESS' status.
- Count 'failedTransactions' for transactions with 'FAILED' status.
- Count 'pendingTransactions' for transactions with 'PENDING' status.
- Identify and list 'commonPayerTypes' by looking for recurring patterns or names in 'payerDetails'.
- Determine 'periodCovered' from the earliest to the latest 'timestamp' in the batch, formatted clearly.
- Provide a textual 'analysis' offering deeper insights, highlighting significant trends, anomalies, or important observations for the merchant. Ensure this analysis is helpful for business decisions.

Only consider transactions with 'SUCCESS' status for monetary calculations (totalAmount, averageTransactionValue).`,
});

const transactionBatchSummaryFlow = ai.defineFlow(
  {
    name: 'transactionBatchSummaryFlow',
    inputSchema: TransactionBatchSummaryInputSchema,
    outputSchema: TransactionBatchSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await transactionBatchSummaryPrompt(input);
    return output!;
  },
);
