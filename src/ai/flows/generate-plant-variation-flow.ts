
'use server';
/**
 * @fileOverview Generates visual variations of a plant using AI.
 *
 * - generatePlantVariation - A function that generates a new image of a plant based on a description.
 * - GeneratePlantVariationInput - The input type for the generatePlantVariation function.
 * - GeneratePlantVariationOutput - The return type for the generatePlantVariation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlantVariationInputSchema = z.object({
  plantName: z.string().describe('The name of the plant.'),
  variationDescription: z
    .string()
    .describe('A description of the desired visual variation (e.g., "in full bloom", "autumn colors", "as a sapling").'),
  originalPhotoDataUri: z
    .string()
    .optional()
    .describe(
      "Optional. An original photo of the plant as a data URI for visual context. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GeneratePlantVariationInput = z.infer<typeof GeneratePlantVariationInputSchema>;

const GeneratePlantVariationOutputSchema = z.object({
  generatedImage: z
    .string()
    .describe('The generated image of the plant variation, as a data URI.'),
});
export type GeneratePlantVariationOutput = z.infer<typeof GeneratePlantVariationOutputSchema>;

export async function generatePlantVariation(
  input: GeneratePlantVariationInput
): Promise<GeneratePlantVariationOutput> {
  return generatePlantVariationFlow(input);
}

const generatePlantVariationFlow = ai.defineFlow(
  {
    name: 'generatePlantVariationFlow',
    inputSchema: GeneratePlantVariationInputSchema,
    outputSchema: GeneratePlantVariationOutputSchema,
  },
  async (input: GeneratePlantVariationInput) => {
    const promptParts = [];

    let textPrompt = `You are an expert botanical illustrator. Generate an image of the plant named "${input.plantName}" with the following variation: "${input.variationDescription}".`;

    if (input.originalPhotoDataUri) {
      promptParts.push({media: {url: input.originalPhotoDataUri}});
      textPrompt += ` Use the provided image as a strong visual reference for the plant's appearance, but ensure the generated image clearly reflects the desired variation.`;
    } else {
      textPrompt += ` Since no reference image is provided, create a plausible and clear depiction based on the plant name and variation description.`;
    }
    promptParts.push({text: textPrompt});

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: promptParts,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or returned no media URL.');
    }

    return {generatedImage: media.url};
  }
);
