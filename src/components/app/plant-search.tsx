"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Search, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { retrievePlantInfoAction } from "@/lib/actions";
import { PlantInfoCard } from "@/components/app/plant-info-card";
import type { RetrievePlantInformationOutput } from "@/ai/flows/retrieve-plant-information";
import { useToast } from "@/hooks/use-toast";

const initialState: {
  data?: RetrievePlantInformationOutput;
  error?: string;
  plantName?: string;
} = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" /> Search Plant
        </>
      )}
    </Button>
  );
}

export default function PlantSearch() {
  const [state, formAction] = useActionState(retrievePlantInfoAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Search Error",
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl bg-card/80 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center">Search Plant Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="plantName" className="block text-sm font-medium text-foreground">
              Plant Name
            </label>
            <Input
              id="plantName"
              name="plantName"
              type="text"
              placeholder="e.g., Aloe Vera, Sunflower"
              required
              className="transition-colors focus:border-primary bg-background/50"
            />
          </div>
          <SubmitButton />
        </form>

        {state.data && state.plantName && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-center font-headline">Search Result for "{state.plantName}"</h3>
            <PlantInfoCard data={state.data} type="information" plantName={state.plantName} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
