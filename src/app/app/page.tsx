"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import HeroGeometric from "@/components/hero-geometric";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlantIdentifier from "@/components/app/plant-identifier";
import PlantSearch from "@/components/app/plant-search";
import { Button } from "@/components/ui/button"; // For potential future use

export default function AppPage() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return null;

  return (
    <HeroGeometric>
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center w-full h-full pt-8 pb-4">
        <main className="flex-grow flex flex-col items-center w-full overflow-y-auto">
          <Tabs defaultValue="identify" className="w-full max-w-3xl bg-card/70 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-2xl border border-white/10">
            <TabsList className="grid w-full grid-cols-2 md:w-auto md:mx-auto mb-6 bg-background/50">
              <TabsTrigger value="identify" className="text-base">Identify Plant</TabsTrigger>
              <TabsTrigger value="search" className="text-base">Search Plant Info</TabsTrigger>
            </TabsList>
            <TabsContent value="identify">
              <PlantIdentifier />
            </TabsContent>
            <TabsContent value="search">
              <PlantSearch />
            </TabsContent>
          </Tabs>
        </main>
        
        <div className="pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 FloraFind. Explore with curiosity.
          </p>
        </div>
      </div>
    </HeroGeometric>
  );
}
