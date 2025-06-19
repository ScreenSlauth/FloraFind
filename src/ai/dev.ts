
import { config } from 'dotenv';
config();

import '@/ai/flows/retrieve-plant-information.ts';
import '@/ai/flows/identify-plant-from-image.ts';
import '@/ai/flows/generate-plant-variation-flow.ts';
