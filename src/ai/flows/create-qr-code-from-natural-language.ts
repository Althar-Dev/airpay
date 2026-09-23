'use server';
/**
 * @fileOverview A Genkit flow for generating QRIS payment details from natural language.
 *
 * - createQrCodeFromNaturalLanguage - A function that processes natural language input to extract QR code payment details.
 * - NaturalLanguageQrCreationInput - The input type for the createQrCodeFromNaturalLanguage function.
 * - QrCodeDetails - The return type for the createQrCodeFromNaturalLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NaturalLanguageQrCreationInputSchema = z.string().describe('Natural language description of the QRIS payment details.');
export type NaturalLanguageQrCreationInput = z.infer<typeof NaturalLanguageQrCreationInputSchema>;

const QrCodeDetailsSchema = z.object({
  amount: z.number().describe('The payment amount in IDR.'),
  productName: z.string().describe('The name of the product or service being paid for.'),
  merchantId: z.string().optional().describe('The merchant ID, if specified in the natural language input.'),
});
export type QrCodeDetails = z.infer<typeof QrCodeDetailsSchema>;

export async function createQrCodeFromNaturalLanguage(
  input: NaturalLanguageQrCreationInput
): Promise<QrCodeDetails> {
  return createQrCodeFromNaturalLanguageFlow(input);
}

const naturalLanguageQrCreationPrompt = ai.definePrompt({
  name: 'naturalLanguageQrCreationPrompt',
  input: {schema: NaturalLanguageQrCreationInputSchema},
  output: {schema: QrCodeDetailsSchema},
  prompt: `You are an AI assistant specialized in extracting QRIS payment details from natural language descriptions.
Your task is to parse the user's request and provide the exact payment amount as a number, the product or service name as a string, and optionally the merchant ID.
The currency for the amount is always Indonesian Rupiah (IDR).

User description: {{{input}}}`,
});

const createQrCodeFromNaturalLanguageFlow = ai.defineFlow(
  {
    name: 'createQrCodeFromNaturalLanguageFlow',
    inputSchema: NaturalLanguageQrCreationInputSchema,
    outputSchema: QrCodeDetailsSchema,
  },
  async input => {
    const {output} = await naturalLanguageQrCreationPrompt(input);
    return output!;
  }
);
