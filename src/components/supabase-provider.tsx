'use client';

import { useEffect, useState, ReactNode } from 'react';
import { ConnectionError } from './ui/connection-error';
import { checkSupabaseConnection } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

interface SupabaseProviderProps {
  children: ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const checkConnection = async () => {
      try {
        const status = await checkSupabaseConnection();
        
        if (status.ok) {
          setConnectionStatus('connected');
        } else {
          console.error('Supabase connection error:', status.error);
          setConnectionStatus('error');
          setErrorDetails(status.details);
        }
      } catch (error) {
        console.error('Error checking Supabase connection:', error);
        setConnectionStatus('error');
        setErrorDetails(error);
      }
    };
    
    checkConnection();
  }, []);

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return null;
  }
  
  if (connectionStatus === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Connecting to database...</p>
        </div>
      </div>
    );
  }
  
  if (connectionStatus === 'error') {
    return <ConnectionError />;
  }
  
  return <>{children}</>;
} 