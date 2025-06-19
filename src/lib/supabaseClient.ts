import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables or localStorage
const getSupabaseCredentials = () => {
  // First check environment variables (for normal deployment)
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // For client-side only, check localStorage (useful for GitHub Pages deployment)
  if (typeof window !== 'undefined') {
    // If environment variables are not set, try localStorage
    if (!supabaseUrl) {
      supabaseUrl = localStorage.getItem('SUPABASE_URL') || undefined;
    }
    if (!supabaseAnonKey) {
      supabaseAnonKey = localStorage.getItem('SUPABASE_ANON_KEY') || undefined;
    }
  }
  
  // Use default placeholder values if nothing is available
  return {
    supabaseUrl: supabaseUrl || 'https://placeholder-url.supabase.co',
    supabaseAnonKey: supabaseAnonKey || 'placeholder-key'
  };
};

// Create a function to get the Supabase client to ensure we can handle errors
const createSupabaseClient = () => {
  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    // If we're in the browser, show a console error
    if (typeof window !== 'undefined') {
      console.error('Failed to initialize Supabase client:', error);
    }
    
    // Return a mock client that will fail gracefully
    return createClient('https://placeholder-url.supabase.co', 'placeholder-key', {
      auth: {
        detectSessionInUrl: false,
        persistSession: false,
      }
    });
  }
};

export const supabase = createSupabaseClient();

export async function checkSupabaseConnection() {
  try {
    // Get current credentials
    const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
    
    // Check if we have actual configuration (not placeholder values)
    const usingPlaceholders = 
      supabaseUrl === 'https://placeholder-url.supabase.co' || 
      supabaseAnonKey === 'placeholder-key';
      
    if (usingPlaceholders) {
      return {
        ok: false,
        error: 'Missing Supabase configuration',
        details: {
          usingLocalStorage: typeof window !== 'undefined',
          url: supabaseUrl !== 'https://placeholder-url.supabase.co',
          key: supabaseAnonKey !== 'placeholder-key'
        }
      };
    }
    
    // Check if we can query something simple
    const { error } = await supabase.from('garden_plants').select('id').limit(1);
    
    if (error) {
      return {
        ok: false,
        error: error.message,
        details: error
      };
    }
    
    return {
      ok: true
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      details: err
    };
  }
} 