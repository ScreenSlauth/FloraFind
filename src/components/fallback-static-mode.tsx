"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Github, Code, BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";

interface FallbackStaticModeProps {
  children: React.ReactNode;
}

export function FallbackStaticMode({ children }: FallbackStaticModeProps) {
  const [showFallback, setShowFallback] = useState(true);
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [isConfiguring, setIsConfiguring] = useState(false);

  // For safety in static builds, check if we're on the client and have localStorage
  const isClient = typeof window !== "undefined";

  const tryLocalCredentials = () => {
    if (!isClient) return;
    
    try {
      localStorage.setItem("SUPABASE_URL", supabaseUrl);
      localStorage.setItem("SUPABASE_ANON_KEY", supabaseKey);
      
      // Provide visual feedback
      setIsConfiguring(true);
      setTimeout(() => {
        setShowFallback(false);
        setIsConfiguring(false);
        // Force reload to apply changes
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error saving credentials to localStorage:", error);
    }
  };
  
  // Check localStorage for credentials on mount
  useState(() => {
    if (!isClient) return;
    
    const storedUrl = localStorage.getItem("SUPABASE_URL");
    const storedKey = localStorage.getItem("SUPABASE_ANON_KEY");
    
    if (storedUrl && storedKey) {
      setSupabaseUrl(storedUrl);
      setSupabaseKey(storedKey);
      setShowFallback(false);
    }
  });

  if (!showFallback) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 bg-gradient-to-b from-green-50/30 to-blue-50/30 dark:from-green-950/30 dark:to-blue-950/30">
      <Card className="w-full max-w-xl p-6 space-y-6 glass-effect backdrop-blur-md">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Leaf className="h-10 w-10 text-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center">FloraFind Static Demo</h1>
        
        <Alert className="border-primary/20 bg-primary/5">
          <Leaf className="h-4 w-4" />
          <AlertTitle>Static GitHub Pages Deployment</AlertTitle>
          <AlertDescription>
            You're viewing a static build of FloraFind. For full functionality, you need to provide Supabase credentials.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configure Supabase</h3>
          
          <p className="text-sm text-muted-foreground">
            To use this demo with your own Supabase project, enter your credentials below.
            These will be stored only in your browser's localStorage.
          </p>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Supabase URL</label>
              <Input 
                value={supabaseUrl} 
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Supabase Anon Key</label>
              <Input 
                value={supabaseKey} 
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="your-supabase-anon-key"
                type="password"
              />
            </div>
          </div>
          
          <Button 
            onClick={tryLocalCredentials} 
            disabled={!supabaseUrl || !supabaseKey || isConfiguring}
            className="w-full"
          >
            {isConfiguring ? "Applying..." : "Apply Credentials"}
          </Button>
          
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Other Options</h4>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="https://github.com/ScreenSlauth/FloraFind" target="_blank" className="flex-1">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  <span>View Source</span>
                </Button>
              </Link>
              
              <Link href="https://supabase.com/dashboard" target="_blank" className="flex-1">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>Supabase Dashboard</span>
                </Button>
              </Link>
            </div>
            
            <Button 
              variant="link"
              onClick={() => setShowFallback(false)} 
              className="text-sm px-0"
            >
              Skip and try demo anyway
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 