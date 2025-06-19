
"use server";

import { identifyPlantFromImage, IdentifyPlantFromImageOutput } from "@/ai/flows/identify-plant-from-image";
import { retrievePlantInformation, RetrievePlantInformationOutput } from "@/ai/flows/retrieve-plant-information";
import { generatePlantVariation, GeneratePlantVariationOutput } from "@/ai/flows/generate-plant-variation-flow";
import { z } from "zod";

const IdentifyPlantSchema = z.object({
  image: z.instanceof(File).refine(file => file.size > 0, { message: "Image is required." })
    .refine(file => file.type.startsWith("image/"), { message: "File must be an image."}),
});

export async function identifyPlantAction(
  prevState: any,
  formData: FormData
): Promise<{ data?: IdentifyPlantFromImageOutput; error?: string; filePreview?: string }> {
  try {
    const validatedFields = IdentifyPlantSchema.safeParse({
      image: formData.get("image"),
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors.image?.join(", ") || "Invalid image." };
    }
    
    const imageFile = validatedFields.data.image;

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${imageFile.type};base64,${base64Image}`;

    const result = await identifyPlantFromImage({ photoDataUri: dataUri });
    return { data: result, filePreview: dataUri };
  } catch (error) {
    console.error("Error in identifyPlantAction:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to identify plant. Please try again.";
    // Ensure filePreview is passed back even on error if available, so UI doesn't lose it.
    const filePreview = formData.get("image") ? 
      URL.createObjectURL(formData.get("image") as File) : // This is not ideal for server actions, re-evaluate if needed
      (prevState?.filePreview || undefined);
    
    // For server actions, converting blob URL back to data URI or handling differently might be needed.
    // For now, we just pass back the error. If image was large, re-sending data URI is not efficient.
    // Let's assume `prevState.filePreview` is what we want to keep if an error occurs after image processing.
    return { error: errorMessage, filePreview: prevState?.filePreview };
  }
}


const RetrievePlantInfoSchema = z.object({
  plantName: z.string().min(1, "Plant name is required."),
});

export async function retrievePlantInfoAction(
  prevState: any,
  formData: FormData
): Promise<{ data?: RetrievePlantInformationOutput; error?: string, plantName?: string }> {
  try {
    const validatedFields = RetrievePlantInfoSchema.safeParse({
      plantName: formData.get("plantName"),
    });
    
    const plantName = validatedFields.success ? validatedFields.data.plantName : prevState?.plantName || "";


    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors.plantName?.join(", ") || "Invalid plant name.", plantName};
    }

    const result = await retrievePlantInformation({ plantName });
    return { data: result, plantName };
  } catch (error) {
    console.error("Error in retrievePlantInfoAction:", error);
    const plantName = formData.get("plantName") as string || prevState?.plantName || "";
    return { error: error instanceof Error ? error.message : "Failed to retrieve plant information. Please try again.", plantName };
  }
}

const GeneratePlantVariationSchema = z.object({
  plantName: z.string().min(1, "Plant name is required."),
  variationDescription: z.string().min(3, "Variation description is required and should be at least 3 characters long."),
  originalPhotoDataUri: z.string().optional(),
});

export async function generatePlantVariationAction(
  prevState: any,
  formData: FormData
): Promise<{ data?: GeneratePlantVariationOutput; error?: string;
  plantName?: string; variationDescription?: string; originalPhotoDataUri?: string; }> {
  const plantName = formData.get("plantName") as string;
  const variationDescription = formData.get("variationDescription") as string;
  const originalPhotoDataUri = formData.get("originalPhotoDataUri") as string | undefined;

  try {
    const validatedFields = GeneratePlantVariationSchema.safeParse({
      plantName,
      variationDescription,
      originalPhotoDataUri: originalPhotoDataUri || undefined,
    });

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorMessages = Object.values(fieldErrors).map(errArray => errArray?.join(", ")).join(" ");
      return { 
        error: errorMessages || "Invalid input for plant variation.",
        plantName,
        variationDescription,
        originalPhotoDataUri
      };
    }
    
    const result = await generatePlantVariation(validatedFields.data);
    return { 
      data: result,
      plantName,
      variationDescription,
      originalPhotoDataUri
    };
  } catch (error) {
    console.error("Error in generatePlantVariationAction:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to generate plant variation. Please try again.",
      plantName,
      variationDescription,
      originalPhotoDataUri
    };
  }
}
