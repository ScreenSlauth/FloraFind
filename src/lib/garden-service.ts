'use client';

import { supabase, checkSupabaseConnection } from './supabaseClient';
import { Database } from './database.types';
import { IdentifyPlantFromImageOutput } from '@/ai/flows/identify-plant-from-image';

// Type for plant in user's garden
export type GardenPlant = Database['public']['Tables']['garden_plants']['Row'];
export type SavedPlantInput = Database['public']['Tables']['garden_plants']['Insert'];

// Save a plant to the user's garden
export async function savePlantToGarden(
  plantData: IdentifyPlantFromImageOutput,
  imageUrl: string
): Promise<{ data: GardenPlant | null; error: any }> {
  try {
    console.log("Starting savePlantToGarden with:", { 
      scientificName: plantData.scientificName, 
      commonName: plantData.commonName
    });

    // Check Supabase connection
    const connectionStatus = await checkSupabaseConnection();
    if (!connectionStatus.ok) {
      console.error("Supabase connection check failed:", connectionStatus.error);
      return {
        data: null,
        error: { 
          message: 'Unable to connect to the database. Please try again later.',
          details: connectionStatus.error
        }
      };
    }

    // First check if we have a valid session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error("No active session:", sessionError || "Session not found");
      return { 
        data: null, 
        error: { message: 'Please log in to save plants to your garden.' } 
      };
    }

    // Then get the user details
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error("Authentication error:", userError || "User not authenticated");
      // Try to refresh the session
      await supabase.auth.refreshSession();
      return { 
        data: null, 
        error: { message: 'Authentication failed. Please try logging in again.' } 
      };
    }

    const userId = userData.user.id;
    console.log("Saving plant for user:", userId);

    // Check if plant already exists for this user to avoid duplicates
    const { data: existingPlant, error: checkError } = await supabase
      .from('garden_plants')
      .select('id')
      .eq('user_id', userId)
      .eq('scientific_name', plantData.scientificName)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking for existing plant:", checkError);
      return { data: null, error: checkError };
    }

    if (existingPlant) {
      console.log("Plant already exists in user's garden");
      return { data: existingPlant as GardenPlant, error: null };
    }

    const plantToSave: SavedPlantInput = {
      user_id: userId,
      scientific_name: plantData.scientificName,
      common_name: plantData.commonName,
      hindi_name: plantData.hindiName || null,
      description: plantData.description,
      uses: plantData.uses,
      benefits: plantData.benefits,
      native_region: plantData.nativeRegion,
      growing_conditions: plantData.growingConditions,
      is_poisonous: plantData.isPoisonous,
      toxicity_details: plantData.toxicityDetails || null,
      image_url: imageUrl,
    };

    const { data, error } = await supabase
      .from('garden_plants')
      .insert(plantToSave)
      .select('*')
      .single();

    if (error) {
      console.error("Error saving plant:", error);
      
      // Check for specific error types
      if (error.code === '23505') {
        return { data: null, error: { message: 'This plant already exists in your garden.' } };
      } else if (error.code === '42P01') {
        return { data: null, error: { message: 'Database table not found. The application may need to be updated.' } };
      } else if (error.code === '42501') {
        return { data: null, error: { message: 'You do not have permission to save plants. Please log in again.' } };
      }
      
      return { data: null, error };
    } else {
      console.log("Plant saved successfully:", data);
      return { data, error: null };
    }
  } catch (error: any) {
    console.error("Unexpected error saving plant:", error);
    return { 
      data: null, 
      error: error instanceof Error 
        ? error 
        : { message: 'An unexpected error occurred while saving the plant.' } 
    };
  }
}

// Get all plants in the user's garden
export async function getUserGarden(): Promise<{ data: GardenPlant[] | null; error: any }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { data: null, error: userError || new Error('User not authenticated') };
    }

    const userId = userData.user.id;
    console.log("Fetching garden for user:", userId);

    const { data, error } = await supabase
      .from('garden_plants')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error("Error fetching garden plants:", error);
    return { data: null, error };
  }
}

// Get a specific plant from the user's garden
export async function getGardenPlant(id: string): Promise<{ data: GardenPlant | null; error: any }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { data: null, error: userError || new Error('User not authenticated') };
    }
    
    const userId = userData.user.id;
    
    const { data, error } = await supabase
      .from('garden_plants')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Update a plant's notes
export async function updatePlantNotes(id: string, notes: string): Promise<{ data: any; error: any }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { data: null, error: userError || new Error('User not authenticated') };
    }
    
    const userId = userData.user.id;
    
    const { data, error } = await supabase
      .from('garden_plants')
      .update({ notes })
      .eq('id', id)
      .eq('user_id', userId);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Delete a plant from the user's garden
export async function deletePlantFromGarden(id: string): Promise<{ error: any }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { error: userError || new Error('User not authenticated') };
    }
    
    const userId = userData.user.id;
    
    const { error } = await supabase
      .from('garden_plants')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    return { error };
  } catch (error) {
    return { error };
  }
} 