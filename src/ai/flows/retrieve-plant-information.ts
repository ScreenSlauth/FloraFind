'use server';

/**
 * @fileOverview An AI agent for retrieving detailed plant information.
 *
 * - retrievePlantInformation - A function that retrieves detailed plant information.
 * - RetrievePlantInformationInput - The input type for the retrievePlantInformation function.
 * - RetrievePlantInformationOutput - The return type for the retrievePlantInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RetrievePlantInformationInputSchema = z.object({
  plantName: z.string().describe('The name of the plant to retrieve information about.'),
});

export type RetrievePlantInformationInput = z.infer<typeof RetrievePlantInformationInputSchema>;

const RetrievePlantInformationOutputSchema = z.object({
  description: z.string().describe('A detailed description of the plant.'),
  uses: z.string().describe('The known uses of the plant, including medicinal and other applications, presented as newline-separated points. Each point should start with a hyphen and a space (e.g., "- Use 1\\n- Use 2").'),
  benefits: z.string().describe('Key benefits of the plant, presented as newline-separated points. Each point should start with a hyphen and a space (e.g., "- Benefit 1\\n- Benefit 2").'),
  nativeRegions: z.string().describe('The regions where the plant is native.'),
  growingConditions: z.string().describe('The optimal growing conditions for the plant.'),
  isPoisonous: z.boolean().describe('Strictly true if the plant is generally considered poisonous to humans or common pets, false otherwise. Do not use this field to indicate "unknown".'),
  toxicityDetails: z.string().optional().describe('Specific details about the plant\'s toxicity (e.g., "Leaves are toxic to cats", "Non-toxic to humans and pets", or "Toxicity unknown if not specified otherwise by isPoisonous field").'),
  regionalInsights: z.string().describe('Regional insights about the plant.'),
  medicinalApplications: z.string().describe('Medicinal applications of the plant, presented as newline-separated points. Each point should start with a hyphen and a space.'),
});

export type RetrievePlantInformationOutput = z.infer<typeof RetrievePlantInformationOutputSchema>;

export async function retrievePlantInformation(
  input: RetrievePlantInformationInput
): Promise<RetrievePlantInformationOutput> {
  return retrievePlantInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'retrievePlantInformationPrompt',
  input: {schema: RetrievePlantInformationInputSchema},
  output: {schema: RetrievePlantInformationOutputSchema},
  prompt: `You are an expert botanist with access to a comprehensive database of plant information.

  A user is requesting information about the following plant:
  Plant Name: {{{plantName}}}

  Provide detailed information about the plant, including:
  - Description
  - Uses (as newline-separated points, each starting with "- ")
  - Benefits (as newline-separated points, each starting with "- ")
  - Native Regions
  - Growing Conditions
  - Is Poisonous (true if poisonous to humans/common pets, false otherwise; be certain)
  - Toxicity Details (specifics about toxicity or if unknown, state "Toxicity details not specified" if isPoisonous is false and no other info, or be more specific if isPoisonous is true)
  - Regional Insights
  - Medicinal Applications (as newline-separated points, each starting with "- ")

  Ensure the information is accurate and draws from reliable sources.
  Ensure the output is formatted as a JSON object matching the RetrievePlantInformationOutputSchema.
  If a field like medicinalApplications is not applicable or has no specific points, provide a general statement or "N/A" for that string.
  `,
});

const retrievePlantInformationFlow = ai.defineFlow(
  {
    name: 'retrievePlantInformationFlow',
    inputSchema: RetrievePlantInformationInputSchema,
    outputSchema: RetrievePlantInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
