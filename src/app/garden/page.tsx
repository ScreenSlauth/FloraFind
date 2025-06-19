"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeroGeometric from "@/components/hero-geometric";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import { getUserGarden, GardenPlant, deletePlantFromGarden } from "@/lib/garden-service";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Flower2, Leaf, PlusCircle, Search, Trash2, Info, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export default function GardenPage() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme is available after mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Default to dark theme colors
  const isDarkMode = !mounted || theme === "dark" || theme === "system";

  // Check authentication and load plants
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
      } else {
        setAuthenticated(true);
        loadGardenPlants();
      }
    };
    checkAuth();
  }, [router]);

  // Load user's garden plants
  const loadGardenPlants = async () => {
    setLoading(true);
    const { data, error } = await getUserGarden();
    if (error) {
      console.error("Error fetching garden plants:", error);
    } else if (data) {
      setPlants(data);
    }
    setLoading(false);
  };

  // Handle plant deletion
  const handleDeletePlant = async (id: string) => {
    setDeleteLoading(id);
    const { error } = await deletePlantFromGarden(id);
    if (error) {
      console.error("Error deleting plant:", error);
    } else {
      // Update the plants list after deletion
      setPlants(plants.filter(plant => plant.id !== id));
    }
    setDeleteLoading(null);
  };

  // Filter plants based on search term
  const filteredPlants = (tabPlants: GardenPlant[]) => {
    if (!searchTerm) return tabPlants;
    return tabPlants.filter(plant => 
      plant.common_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      plant.scientific_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plant.hindi_name && plant.hindi_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const renderPlantGrid = (plantsToRender: GardenPlant[]) => {
    const filtered = filteredPlants(plantsToRender);
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 glass-card p-8 backdrop-blur-md rounded-xl w-full max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <Search className="h-12 w-12 text-primary/70" />
          </div>
          <h3 className="text-xl font-medium mb-2">No plants found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? "No plants match your search. Try different keywords." 
              : "This category is empty. Add some plants to get started!"}
          </p>
          <Button onClick={() => router.push("/app")} variant="glass-primary">
            <PlusCircle className="mr-2 h-4 w-4" />
            Identify New Plants
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((plant, index) => (
          <motion.div 
            key={plant.id} 
            custom={index} 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <PlantCard 
              plant={plant} 
              onDelete={handleDeletePlant}
              isDeleting={deleteLoading === plant.id}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  if (loading && !authenticated) {
    return (
      <HeroGeometric>
        <div className="container mx-auto px-4 py-12 flex flex-col items-center">
          <div className="w-full max-w-4xl">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </HeroGeometric>
    );
  }
  
  if (!authenticated) return null;

  return (
    <HeroGeometric>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Decorative elements */}
        <div className="absolute top-12 right-12 opacity-20 pointer-events-none hidden md:block">
          <Leaf className="w-48 h-48 text-primary/30" />
        </div>
        
        <div className="glass-card backdrop-blur-md mb-8 p-6 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
                My Garden
              </h1>
              <p className="text-muted-foreground mt-2">
                Track and manage your identified plants
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Search plants..."
                  className="pl-10 pr-4 py-2 rounded-md glass-effect w-full sm:w-auto"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => router.push("/app")} variant="glass-primary">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Plants
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 glass-effect-green w-full sm:w-auto justify-start overflow-x-auto">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary/20">
                <Flower2 className="w-4 h-4 mr-2" />
                All Plants ({plants.length})
              </TabsTrigger>
              <TabsTrigger value="safe" className="data-[state=active]:bg-green-500/20">
                <Leaf className="w-4 h-4 mr-2" />
                Safe Plants ({plants.filter(p => !p.is_poisonous).length})
              </TabsTrigger>
              <TabsTrigger value="toxic" className="data-[state=active]:bg-red-500/20">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Toxic Plants ({plants.filter(p => p.is_poisonous).length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-80 rounded-xl" />
                  ))}
                </div>
              ) : plants.length === 0 ? (
                <div className="text-center py-12 glass-card p-8 backdrop-blur-md rounded-xl max-w-2xl mx-auto">
                  <Flower2 className="h-16 w-16 text-primary/70 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Your garden is empty</h2>
                  <p className="mb-6 text-muted-foreground">
                    Start identifying plants to add them to your collection!
                  </p>
                  <Button onClick={() => router.push("/app")} variant="glass-primary" size="lg">
                    <Search className="mr-2 h-5 w-5" />
                    Identify Plants
                  </Button>
                </div>
              ) : (
                renderPlantGrid(plants)
              )}
            </TabsContent>
            
            <TabsContent value="safe">
              {renderPlantGrid(plants.filter(plant => !plant.is_poisonous))}
            </TabsContent>
            
            <TabsContent value="toxic">
              {renderPlantGrid(plants.filter(plant => plant.is_poisonous))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </HeroGeometric>
  );
}

interface PlantCardProps {
  plant: GardenPlant;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isDarkMode: boolean;
}

function PlantCard({ plant, onDelete, isDeleting, isDarkMode }: PlantCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
      "glass-card backdrop-blur-md",
      isDarkMode ? "shadow-emerald-900/10" : "shadow-emerald-600/10",
      plant.is_poisonous ? "border-red-400/30" : "border-green-400/30"
    )}>
      <div className="relative w-full h-52">
        {plant.image_url ? (
          <Image 
            src={plant.image_url} 
            alt={plant.common_name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent",
          "flex items-end p-3"
        )}>
          <div className="w-full">
            <h3 className="text-xl font-bold text-white truncate">{plant.common_name}</h3>
            <p className="text-sm italic text-white/80 truncate">{plant.scientific_name}</p>
          </div>
        </div>
        
        {plant.is_poisonous && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="flex items-center gap-1 px-2">
              <AlertTriangle className="w-3 h-3" />
              Toxic
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        {plant.hindi_name && (
          <p className="text-sm text-muted-foreground mb-2">Hindi: {plant.hindi_name}</p>
        )}
        
        <p className="mt-1 text-sm line-clamp-2 flex-grow">{plant.description}</p>
        
        <div className="flex gap-2 mt-4 justify-between">
          <Link href={`/garden/${plant.id}`} className="flex-grow">
            <Button variant="glass" className="w-full flex items-center gap-2" size="sm">
              <Info className="h-4 w-4" />
              <span>Details</span>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(plant.id)}
            disabled={isDeleting}
            className={cn(
              "px-2 glass-icon-button",
              isDeleting ? "bg-red-500/20" : "hover:bg-red-500/20"
            )}
          >
            <Trash2 className={cn(
              "h-4 w-4",
              isDeleting ? "text-muted-foreground" : "text-red-500"
            )} />
          </Button>
        </div>
      </div>
    </Card>
  );
} 