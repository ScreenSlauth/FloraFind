// src/ai/flows/identify-plant-from-image.ts
'use server';
/**
 * @fileOverview Identifies a plant from an image and provides information about it.
 *
 * - identifyPlantFromImage - A function that identifies a plant from an image.
 * - IdentifyPlantFromImageInput - The input type for the identifyPlantFromImage function.
 * - IdentifyPlantFromImageOutput - The return type for the identifyPlantFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPlantFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyPlantFromImageInput = z.infer<typeof IdentifyPlantFromImageInputSchema>;

const IdentifyPlantFromImageOutputSchema = z.object({
  scientificName: z.string().describe('The scientific name of the plant.'),
  commonName: z.string().describe('The common name of the plant.'),
  hindiName: z.string().describe('The Hindi name of the plant, if available.'),
  description: z.string().describe('A brief description of the plant.'),
  uses: z.string().describe('Common uses of the plant, presented as newline-separated points. Each point should start with a hyphen and a space (e.g., "- Use 1\\n- Use 2").'),
  benefits: z.string().describe('Key benefits of the plant, presented as newline-separated points. Each point should start with a hyphen and a space (e.g., "- Benefit 1\\n- Benefit 2").'),
  nativeRegion: z.string().describe('The native region where the plant grows.'),
  growingConditions: z.string().describe('Optimal growing conditions for the plant.'),
  isPoisonous: z.boolean().describe('Strictly true if the plant is generally considered poisonous to humans or common pets, false otherwise. Do not use this field to indicate "unknown".'),
  toxicityDetails: z.string().optional().describe('Specific details about the plant\'s toxicity (e.g., "Leaves are toxic to cats", "Non-toxic to humans and pets", or "Toxicity unknown if not specified otherwise by isPoisonous field").'),
  confidence: z
    .number()
    .describe(
      'A confidence level for the identification, represented as a decimal between 0 and 1.'
    ),
});
export type IdentifyPlantFromImageOutput = z.infer<typeof IdentifyPlantFromImageOutputSchema>;

export async function identifyPlantFromImage(
  input: IdentifyPlantFromImageInput
): Promise<IdentifyPlantFromImageOutput> {
  return identifyPlantFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPlantFromImagePrompt',
  input: {schema: IdentifyPlantFromImageInputSchema},
  output: {schema: IdentifyPlantFromImageOutputSchema},
  prompt: `You are an expert botanist. Identify the plant in the image and provide the following information:

- Scientific Name
- Common Name
- Hindi Name (if available)
- Description
- Uses (as newline-separated points, each starting with "- ")
- Benefits (as newline-separated points, each starting with "- ")
- Native Region
- Growing Conditions
- Is Poisonous (true if poisonous to humans/common pets, false otherwise; be certain)
- Toxicity Details (specifics about toxicity or if unknown, state "Toxicity details not specified" if isPoisonous is false and no other info, or be more specific if isPoisonous is true)
- Confidence Level (as a decimal between 0 and 1)

Analyze the following image:

{{media url=photoDataUri}}

Ensure that the output is formatted as a JSON object matching the schema: IdentifyPlantFromImageOutputSchema.
If Hindi name is not applicable or not found, provide an empty string or "N/A".
For boolean fields like isPoisonous, provide true or false.
For uses and benefits, ensure each point is on a new line and starts with "- ".
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const identifyPlantFromImageFlow = ai.defineFlow(
  {
    name: 'identifyPlantFromImageFlow',
    inputSchema: IdentifyPlantFromImageInputSchema,
    outputSchema: IdentifyPlantFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
