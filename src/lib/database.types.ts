export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      garden_plants: {
        Row: {
          id: string
          user_id: string
          scientific_name: string
          common_name: string
          hindi_name: string | null
          description: string | null
          uses: string | null
          benefits: string | null
          native_region: string | null
          growing_conditions: string | null
          is_poisonous: boolean | null
          toxicity_details: string | null
          image_url: string | null
          created_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          scientific_name: string
          common_name: string
          hindi_name?: string | null
          description?: string | null
          uses?: string | null
          benefits?: string | null
          native_region?: string | null
          growing_conditions?: string | null
          is_poisonous?: boolean | null
          toxicity_details?: string | null
          image_url?: string | null
          created_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          scientific_name?: string
          common_name?: string
          hindi_name?: string | null
          description?: string | null
          uses?: string | null
          benefits?: string | null
          native_region?: string | null
          growing_conditions?: string | null
          is_poisonous?: boolean | null
          toxicity_details?: string | null
          image_url?: string | null
          created_at?: string
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 