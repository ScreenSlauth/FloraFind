"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Leaf, Flower2, Sun, Droplets, BookOpen, Globe, Thermometer, ShieldCheck, HelpCircle, Skull, Sparkles, MapPin, HeartPulse, Wand2, Loader2, Bookmark, AlertTriangle } from "lucide-react";
import type { IdentifyPlantFromImageOutput } from "@/ai/flows/identify-plant-from-image";
import type { RetrievePlantInformationOutput } from "@/ai/flows/retrieve-plant-information";
import type { GeneratePlantVariationOutput } from "@/ai/flows/generate-plant-variation-flow";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { generatePlantVariationAction } from "@/lib/actions";
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/lib/supabaseClient";
import { savePlantToGarden } from "@/lib/garden-service";
import { getSession, getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";


type ExtendedIdentifyOutput = IdentifyPlantFromImageOutput & { isPoisonous?: boolean; toxicityDetails?: string; benefits?: string; };
type ExtendedRetrieveOutput = RetrievePlantInformationOutput & { isPoisonous?: boolean; toxicityDetails?: string; benefits?: string; };


type PlantInfoCardProps = 
  | { type: "identification"; data: ExtendedIdentifyOutput; uploadedImagePreview?: string; plantName?: never; }
  | { type: "information"; data: ExtendedRetrieveOutput; plantName: string; uploadedImagePreview?: never; };

const renderBulletedList = (text?: string | null, listDisc?: boolean) => {
  if (!text) return <p className="text-sm text-muted-foreground">N/A</p>;

  const points = text.split('\n').map(p => p.trim()).filter(p => p.trim() !== "");
  
  if (points.every(p => p.startsWith('- '))) {
    return (
      <ul className={cn("space-y-1", listDisc ? "list-disc pl-5" : "list-none pl-0")}>
        {points.map((point, index) => (
          <li key={index} className={cn("text-sm text-muted-foreground", !listDisc && "flex items-start")}>
            {!listDisc && <span className="mr-2 mt-1 text-primary">&#8226;</span>}
            <span>{point.substring(listDisc ? 0 : 2)}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (points.length > 1) {
     return (
        <ul className="list-disc pl-5 space-y-1">
          {points.map((point, index) => (
            <li key={index} className="text-sm text-muted-foreground">{point}</li>
          ))}
        </ul>
      );
  }
  return <p className="text-sm text-muted-foreground">{text}</p>;
};


const DetailItem = ({ icon, label, value, isList, listDisc, className }: { icon?: React.ElementType; label: string; value?: string | number | null; isList?: boolean; listDisc?: boolean, className?: string }) => {
  if (!value && typeof value !== 'number' && !isList) return null; 
  const IconComponent = icon;
  return (
    <div className={cn(
      "flex flex-col space-y-2 p-4 glass-effect backdrop-blur-md rounded-lg transition-all duration-300 hover:shadow-lg", 
      className
    )}>
      <div className="flex items-center space-x-2">
        {IconComponent && <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />}
        <p className="text-md font-semibold text-foreground">{label}</p>
      </div>
      {isList ? renderBulletedList(value as string, listDisc) : <p className="text-sm text-muted-foreground">{String(value ?? 'N/A')}</p>}
    </div>
  );
};

const initialVariationState: {
  data?: GeneratePlantVariationOutput;
  error?: string;
  plantName?: string;
  variationDescription?: string;
  originalPhotoDataUri?: string;
} = {};

function VariationSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" /> Generate Variation
        </>
      )}
    </Button>
  );
}


export function PlantInfoCard({ data, type, uploadedImagePreview, plantName: initialPlantName }: PlantInfoCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [variationState, variationFormAction] = useActionState(generatePlantVariationAction, initialVariationState);
  const [currentVariationDescription, setCurrentVariationDescription] = useState("");
  const [isSavedInGarden, setIsSavedInGarden] = useState(false);
  const [savingToGarden, setSavingToGarden] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    // Check session on initial load as well
    const checkInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    };
    
    checkInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (variationState.error) {
      toast({
        variant: "destructive",
        title: "Variation Generation Error",
        description: variationState.error,
      });
    }
  }, [variationState, toast]);

  const isIdentification = type === "identification";
  const idData = isIdentification ? (data as ExtendedIdentifyOutput) : null;
  const infoData = type === "information" ? (data as ExtendedRetrieveOutput) : null;

  const commonName = idData?.commonName || (isIdentification ? "N/A" : initialPlantName);
  const scientificName = idData?.scientificName;
  const hindiName = idData?.hindiName;
  
  const description = data.description;
  const uses = data.uses;
  const benefits = data.benefits;
  const growingConditions = data.growingConditions;
  const nativeRegion = idData?.nativeRegion || infoData?.nativeRegions;
  const isPoisonous = data.isPoisonous;
  const toxicityDetails = data.toxicityDetails;
  
  const confidence = idData?.confidence;

  const regionalInsights = infoData?.regionalInsights;
  const medicinalApplications = infoData?.medicinalApplications;

  let numPostGrowingConditionsItems = 0;
  numPostGrowingConditionsItems++; 
  if (type === "information" && regionalInsights) numPostGrowingConditionsItems++;
  if (type === "information" && medicinalApplications) numPostGrowingConditionsItems++;
  
  const plantNameToUseForVariation = commonName !== "N/A" ? commonName : scientificName || "this plant";

  const handleSaveToGardenToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save plants to your garden.",
        variant: "destructive"
      });
      return;
    }
    
    setSavingToGarden(true);
    
    try {
      if (isIdentification && idData && uploadedImagePreview) {
        let imageUrl = uploadedImagePreview;
        if (uploadedImagePreview.startsWith('data:')) {
          try {
            const base64Data = uploadedImagePreview.split(',')[1];
            const mimeType = uploadedImagePreview.split(';')[0].split(':')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `plant_${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;
            
            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('plant_images')
              .upload(filename, buffer, {
                contentType: mimeType,
                upsert: true
              });
            
            if (uploadError) {
              throw uploadError;
            }
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('plant_images')
              .getPublicUrl(filename);

            imageUrl = publicUrl;
          } catch (uploadError) {
            console.error("Error uploading image:", uploadError);
            toast({
              title: "Image Upload Failed",
              description: "Could not save the plant image. Please try again.",
              variant: "destructive"
            });
            setSavingToGarden(false); // Stop loading state
            return;
          }
        }
        
        const { error: saveError } = await savePlantToGarden(idData, imageUrl);
        
        if (saveError) {
          console.error("Error saving to garden from service:", saveError);
          toast({
            title: "Error Saving Plant",
            description: saveError.message || "An unexpected error occurred while saving the plant.",
            variant: "destructive"
          });
        } else {
          setIsSavedInGarden(true);
          toast({
            title: "Success!",
            description: `${idData.commonName || idData.scientificName} has been saved to your garden. Redirecting...`,
          });

          // Redirect after a short delay
          setTimeout(() => {
            router.push('/garden');
          }, 1500);
        }
      } else {
        toast({
            title: "Cannot Save Plant",
            description: "Missing necessary plant data to save.",
            variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Caught an unexpected error in handleSaveToGardenToggle:", error);
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingToGarden(false);
    }
  };


  return (
    <Card className="w-full overflow-hidden shadow-xl transform transition-all duration-300 hover:shadow-2xl bg-background/60 backdrop-blur-md border border-white/20 glass-card">
      <CardHeader className="glass-effect bg-primary/5 backdrop-blur-sm p-4 md:p-6 relative">
        {/* Save to Garden button */}
        {isIdentification && uploadedImagePreview && (
          <Button
            variant={isSavedInGarden ? "glass-green" : "glass"}
            size="sm"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 glass-icon-button"
            onClick={handleSaveToGardenToggle}
            disabled={savingToGarden || isAuthenticated === null}
          >
            {savingToGarden ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bookmark className={cn("h-4 w-4 mr-2", isSavedInGarden && "fill-current")} />
            )}
            {isSavedInGarden ? "Saved" : "Save to Garden"}
          </Button>
        )}

        {isIdentification && uploadedImagePreview && (
          <div className="mb-4 rounded-lg overflow-hidden border-2 border-primary/80 shadow-md mx-auto w-48 h-48 md:w-56 md:h-56">
            <Image
              src={uploadedImagePreview}
              alt={commonName || "Uploaded plant"}
              width={224}
              height={224}
              className="object-cover w-full h-full"
              data-ai-hint="plant photography"
            />
          </div>
        )}
        <CardTitle className="text-2xl md:text-3xl font-headline text-primary text-center">{commonName}</CardTitle>
        {scientificName && <CardDescription className="text-center text-lg italic text-primary/80">{scientificName}</CardDescription>}
        {hindiName && hindiName.toLowerCase() !== 'n/a' && hindiName.trim() !== '' && <CardDescription className="text-center text-md text-primary/70">(Hindi: {hindiName})</CardDescription>}
      </CardHeader>
      
      <CardContent className="p-4 md:p-6 space-y-6">
        {isIdentification && confidence !== undefined && (
          <div className="space-y-2 p-4 bg-card/70 backdrop-blur-sm rounded-lg shadow-sm border border-white/10">
            <div className="flex justify-between items-center mb-1">
              <p className="text-md font-semibold text-foreground">Confidence:</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help text-sm">
                      {(confidence * 100).toFixed(0)}%
                      <HelpCircle className="h-3.5 w-3.5 ml-1.5" />
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Likelihood of correct identification. Higher is better.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Progress value={confidence * 100} className="h-3 [&>div]:bg-primary" />
          </div>
        )}

        <DetailItem icon={BookOpen} label="Description" value={description} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem icon={Leaf} label="Uses" value={uses} isList />
          <DetailItem icon={Sparkles} label="Benefits" value={benefits} isList />
          <DetailItem icon={Globe} label={isIdentification ? "Native Region" : "Native Regions"} value={nativeRegion} />
          <DetailItem icon={Thermometer} label="Growing Conditions" value={growingConditions} />
          
          <div className={cn("flex flex-col space-y-2 p-4 bg-card/70 backdrop-blur-sm rounded-lg shadow-sm border border-white/10", numPostGrowingConditionsItems === 1 && "md:col-span-2")}>
            <div className="flex items-center space-x-2">
              {isPoisonous ? <Skull className="h-5 w-5 text-destructive flex-shrink-0" /> : <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />}
              <p className="text-md font-semibold text-foreground">Toxicity</p>
            </div>
            <p className="text-sm font-semibold">
              {isPoisonous ? <span className="text-destructive">Poisonous</span> : <span className="text-green-500">Non-Poisonous</span>}
            </p>
            {toxicityDetails && <p className="text-xs text-muted-foreground italic">{toxicityDetails}</p>}
          </div>

          {type === "information" && regionalInsights && <DetailItem icon={MapPin} label="Regional Insights" value={regionalInsights} />}
          {type === "information" && medicinalApplications && <DetailItem icon={HeartPulse} label="Medicinal Applications" value={medicinalApplications} isList listDisc className={cn(numPostGrowingConditionsItems === 3 && "md:col-span-2")}/>}
        </div>

        {/* Visual Variation Section */}
        <Card className="bg-card/50 backdrop-blur-md border border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary flex items-center">
              <Wand2 className="mr-3 h-6 w-6" />
              Visual Variations
            </CardTitle>
            <CardDescription className="text-sm">
              Generate an AI image of this plant with a specific variation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={variationFormAction} className="space-y-4">
              <input type="hidden" name="plantName" value={plantNameToUseForVariation} />
              {isIdentification && uploadedImagePreview && (
                <input type="hidden" name="originalPhotoDataUri" value={uploadedImagePreview} />
              )}
              <div>
                <label htmlFor="variationDescription" className="block text-sm font-medium text-foreground mb-1">
                  Describe Variation (e.g., "in full bloom", "autumn colors")
                </label>
                <Input
                  id="variationDescription"
                  name="variationDescription"
                  placeholder="e.g., as a bonsai tree"
                  required
                  minLength={3}
                  value={currentVariationDescription}
                  onChange={(e) => setCurrentVariationDescription(e.target.value)}
                  className="transition-colors focus:border-primary bg-background/50"
                />
              </div>
              <VariationSubmitButton />
            </form>
            {variationState.data?.generatedImage && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3 text-center">Generated Variation:</h4>
                <div className="rounded-lg overflow-hidden border-2 border-primary/80 shadow-md mx-auto w-full max-w-md aspect-square relative">
                  <Image
                    src={variationState.data.generatedImage}
                    alt={`AI variation of ${variationState.plantName || commonName}: ${variationState.variationDescription || ''}`}
                    fill
                    className="object-contain" 
                    data-ai-hint="plant illustration"
                  />
                </div>
              </div>
            )}
             {variationState.error && !variationState.data?.generatedImage &&(
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription>
                  {variationState.error || "Could not generate the plant variation. Please try a different description or try again later."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </CardContent>

      <CardFooter className="bg-primary/5 backdrop-blur-sm p-4 flex items-center justify-center space-x-6 border-t border-white/10">
        <Link href="/help" className="hover:scale-110 transition-transform">
          <Flower2 className="h-7 w-7 text-accent hover:text-primary transition-colors" />
        </Link>
        <Link href="/garden" className="hover:scale-110 transition-transform">
          <Sun className="h-7 w-7 text-accent hover:text-primary transition-colors" />
        </Link>
        <Link href="/settings" className="hover:scale-110 transition-transform">
          <Droplets className="h-7 w-7 text-accent hover:text-primary transition-colors" />
        </Link>
      </CardFooter>
    </Card>
  );
}


    