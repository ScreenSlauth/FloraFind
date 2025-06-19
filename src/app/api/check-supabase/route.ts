import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
    
    // Try to get the health status from Supabase
    const { data, error } = await supabase
      .from('garden_plants')
      .select('id')
      .limit(1);
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: envCheck,
      supabaseTest: {
        success: !error,
        error: error?.message,
        hasData: Array.isArray(data),
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 