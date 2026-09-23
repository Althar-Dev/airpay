import { config } from 'dotenv';
config();

import '@/ai/flows/create-qr-code-from-natural-language.ts';
import '@/ai/flows/generate-sales-summary.ts';
import '@/ai/flows/summarize-transaction-batch.ts';