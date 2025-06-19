"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { getGardenPlant, GardenPlant, updatePlantNotes, deletePlantFromGarden } from "@/lib/garden-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import HeroGeometric from "@/components/hero-geometric";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2, CalendarDays, Clock, BookOpen, ThermometerSun, Globe, Leaf, Pill, Skull, AlertTriangle, ShieldCheck, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlantDetailsPage({ params }: { params: { id: string } }) {
  const [plant, setPlant] = useState<GardenPlant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notesInput, setNotesInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme is available after mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Default to dark theme colors
  const isDarkMode = !mounted || theme === "dark" || theme === "system";

  useEffect(() => {
    async function checkAuthAndLoadPlant() {
      // Check if user is authenticated
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      
      // Load plant details
      const { data: plantData, error } = await getGardenPlant(params.id);
      if (error || !plantData) {
        console.error("Error loading plant:", error);
        router.push("/garden");
        return;
      }
      
      setPlant(plantData);
      setNotesInput(plantData.notes || "");
      setLoading(false);
    }
    
    checkAuthAndLoadPlant();
  }, [params.id, router]);
  
  const handleSaveNotes = async () => {
    if (!plant) return;
    
    setSavingNotes(true);
    const { error } = await updatePlantNotes(plant.id, notesInput);
    
    if (error) {
      console.error("Error saving notes:", error);
    } else {
      // Update local state
      setPlant({ ...plant, notes: notesInput });
      setEditingNotes(false);
    }
    
    setSavingNotes(false);
  };
  
  const handleDeletePlant = async () => {
    if (!plant) return;
    
    if (confirm("Are you sure you want to remove this plant from your garden?")) {
      setDeleteLoading(true);
      const { error } = await deletePlantFromGarden(plant.id);
      
      if (error) {
        console.error("Error deleting plant:", error);
        setDeleteLoading(false);
      } else {
        router.push("/garden");
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderContent = (content: string | null | undefined) => {
    if (!content) return <p className="text-muted-foreground text-sm italic">No information available.</p>;
    
    // Check if content has bullet points
    if (content.includes('- ')) {
      const points = content.split('\n').map(p => p.trim()).filter(Boolean);
      return (
        <ul className="space-y-1 ml-4 list-disc marker:text-primary">
          {points.map((point, index) => (
            <li key={index} className="text-sm">
              {point.replace('- ', '')}
            </li>
          ))}
        </ul>
      );
    }
    
    // Regular text with line breaks
    return (
      <p className="whitespace-pre-line text-sm">
        {content}
      </p>
    );
  };
  
  if (loading) {
    return (
      <HeroGeometric>
        <div className="container mx-auto px-4 py-8">
          <div className="glass-card backdrop-blur-md rounded-xl p-6">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Skeleton className="h-80 w-full rounded-xl mb-4" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
                <div className="flex gap-4 mt-6">
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
              <div className="lg:col-span-2">
                <Skeleton className="h-6 w-1/4 mb-3" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
                <Separator className="my-6" />
                <Skeleton className="h-6 w-1/4 mb-3" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-full mt-2" />
              </div>
            </div>
          </div>
        </div>
      </HeroGeometric>
    );
  }
  
  if (!plant) {
    return (
      <HeroGeometric>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="glass-card backdrop-blur-md rounded-xl p-12 max-w-xl mx-auto">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Plant not found</h2>
            <p className="mb-8 text-muted-foreground">
              This plant may have been removed from your garden or doesn't exist.
            </p>
            <Link href="/garden">
              <Button variant="glass-primary">Return to Garden</Button>
            </Link>
          </div>
        </div>
      </HeroGeometric>
    );
  }
  
  return (
    <HeroGeometric>
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card backdrop-blur-md rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Side - Image and quick info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-1/3"
            >
              <div className="sticky top-20">
                <div className="mb-6">
                  <Link href="/garden">
                    <Button variant="ghost" size="sm" className="mb-4 hover:glass-nav-item px-0">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Garden
                    </Button>
                  </Link>
                  <div className="relative rounded-xl overflow-hidden border border-primary/20 glass-effect shadow-xl">
                    <div className="h-80">
                      {plant.image_url ? (
                        <Image 
                          src={plant.image_url} 
                          alt={plant.common_name}
                          fill
                          priority
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-card/40 flex items-center justify-center">
                          <Leaf className="text-muted-foreground h-20 w-20 opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h1 className="text-2xl font-bold text-white mb-1">{plant.common_name}</h1>
                      <p className="text-md italic text-white/80">{plant.scientific_name}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {plant.is_poisonous ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Skull className="h-3 w-3" />
                          Toxic Plant
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/20 text-green-700 dark:text-green-300">
                          <ShieldCheck className="h-3 w-3" />
                          Safe Plant
                        </Badge>
                      )}
                      
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Added {formatDate(plant.created_at)}
                      </Badge>
                    </div>
                    
                    {plant.hindi_name && (
                      <div className="text-sm">
                        <span className="font-medium">Hindi Name:</span> {plant.hindi_name}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <Button 
                      variant="destructive"
                      className="w-full flex items-center justify-center"
                      onClick={handleDeletePlant}
                      disabled={deleteLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteLoading ? "Removing..." : "Remove from Garden"}
                    </Button>
                  </div>
                  
                  {/* Notes section */}
                  <Card className="mt-6 overflow-hidden glass-effect bg-card/40">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold">My Notes</h2>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditingNotes(!editingNotes)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {editingNotes ? (
                        <>
                          <Textarea 
                            placeholder="Add your notes about this plant here..."
                            className="min-h-[150px] glass-effect"
                            value={notesInput}
                            onChange={(e) => setNotesInput(e.target.value)}
                          />
                          <div className="flex justify-end mt-3">
                            <Button 
                              onClick={handleSaveNotes}
                              disabled={savingNotes}
                              size="sm"
                              variant="glass-primary"
                              className="gap-2"
                            >
                              <Save className="h-4 w-4" />
                              {savingNotes ? "Saving..." : "Save Notes"}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="bg-card/30 rounded-lg p-3 min-h-[100px] text-sm">
                          {plant.notes ? plant.notes : (
                            <p className="text-muted-foreground italic">
                              No notes added yet. Click the edit button to add some.
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
            
            {/* Right Side - Detailed information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:w-2/3"
            >
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="mb-6 glass-effect-green w-full sm:w-auto justify-start overflow-x-auto">
                  <TabsTrigger value="details" className="data-[state=active]:bg-primary/20">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="growing" className="data-[state=active]:bg-emerald-500/20">
                    <ThermometerSun className="w-4 h-4 mr-2" />
                    Growing
                  </TabsTrigger>
                  <TabsTrigger value="medicinal" className="data-[state=active]:bg-cyan-500/20">
                    <Pill className="w-4 h-4 mr-2" />
                    Medicinal
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6">
                  <Card className="glass-effect bg-card/30">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Description</h2>
                      </div>
                      <p className="text-md">{plant.description}</p>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glass-effect bg-card/30">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Globe className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-semibold">Native Region</h2>
                        </div>
                        {renderContent(plant.native_region)}
                      </CardContent>
                    </Card>
                    
                    <Card className="glass-effect bg-card/30">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <AlertTriangle className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-semibold">Toxicity</h2>
                        </div>
                        <div className="flex items-center mb-3">
                          {plant.is_poisonous ? (
                            <Badge variant="destructive" className="mr-2">Toxic</Badge>
                          ) : (
                            <Badge variant="secondary" className="mr-2 bg-green-500/20 text-green-700 dark:text-green-300">Safe</Badge>
                          )}
                        </div>
                        <p className="text-sm">
                          {plant.is_poisonous 
                            ? plant.toxicity_details || "This plant is considered toxic. Exercise caution when handling." 
                            : plant.toxicity_details || "This plant is generally considered non-toxic."}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="growing" className="space-y-6">
                  <Card className="glass-effect bg-card/30">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <ThermometerSun className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Growing Conditions</h2>
                      </div>
                      {renderContent(plant.growing_conditions)}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="medicinal" className="space-y-6">
                  <Card className="glass-effect bg-card/30">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Leaf className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Uses</h2>
                      </div>
                      {renderContent(plant.uses)}
                    </CardContent>
                  </Card>
                  
                  <Card className="glass-effect bg-card/30">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Pill className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Benefits</h2>
                      </div>
                      {renderContent(plant.benefits)}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </HeroGeometric>
  );
} 