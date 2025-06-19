"use client";

import { useState, useRef, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Camera, Loader2, AlertTriangle, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { identifyPlantAction } from "@/lib/actions";
import { PlantInfoCard } from "@/components/app/plant-info-card";
import type { IdentifyPlantFromImageOutput } from "@/ai/flows/identify-plant-from-image";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const initialState: {
  data?: IdentifyPlantFromImageOutput;
  error?: string;
  filePreview?: string;
} = {};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const COMPRESSED_MAX_WIDTH = 1200; // Max width for compressed images
const COMPRESSED_MAX_HEIGHT = 1200; // Max height for compressed images
const COMPRESSED_QUALITY = 0.8; // JPEG quality (0.8 = 80%)

// Helper function to check if the device has a camera
const hasGetUserMedia = (): boolean => {
  return !!(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
};

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > COMPRESSED_MAX_WIDTH) {
          height = Math.round((height * COMPRESSED_MAX_WIDTH) / width);
          width = COMPRESSED_MAX_WIDTH;
        }
      } else {
        if (height > COMPRESSED_MAX_HEIGHT) {
          width = Math.round((width * COMPRESSED_MAX_HEIGHT) / height);
          height = COMPRESSED_MAX_HEIGHT;
        }
      }

      // Handle device pixel ratio for retina displays
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Scale context for retina displays
      ctx.scale(pixelRatio, pixelRatio);
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        COMPRESSED_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
  });
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Identifying...
        </>
      ) : (
        <>
          <Camera className="mr-2 h-4 w-4" /> Identify Plant
        </>
      )}
    </Button>
  );
}

export default function PlantIdentifier() {
  const [state, formAction] = useActionState(identifyPlantAction, initialState);
  const [filePreview, setFilePreview] = useState<string | null>(state.filePreview || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if device has camera
    setHasCamera(hasGetUserMedia());
  }, []);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Identification Error",
        description: state.error,
      });
    }
    if (state.filePreview) {
      setFilePreview(state.filePreview);
    }
  }, [state, toast]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFilePreview(null);
      return;
    }

    // Validate that it's an image file
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a valid image file",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please select an image under 10MB",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setIsProcessing(true);
      
      // Show preview of original image immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Compress image in background
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Update the file input with compressed image
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(compressedFile);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }

    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Failed to process image. Please try again.",
      });
      setFilePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    state.data = undefined;
    state.error = undefined;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl bg-card/80 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center">Identify a Plant</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="image-upload" className="block text-sm font-medium text-foreground">
              Upload Plant Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-input hover:border-primary transition-colors bg-background/40 backdrop-blur-sm">
              <div className="space-y-1 text-center">
                {filePreview ? (
                  <div className="relative group">
                    <Image
                      src={filePreview}
                      alt="Plant preview"
                      width={200}
                      height={200}
                      className="mx-auto h-48 w-48 object-cover rounded-md"
                      priority
                      unoptimized={true}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveImage}
                      type="button"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-muted rounded-full">
                      {isMobile && hasCamera ? (
                        <Camera className="h-12 w-12 text-muted-foreground" />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <p className="text-sm font-medium">
                        {isMobile && hasCamera ? "Take a photo or upload an image" : "Upload an image"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Any image format up to 10MB
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mt-4">
                  {isMobile && hasCamera ? (
                    <>
                      <label
                        htmlFor="camera-upload"
                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring"
                      >
                        <span className="inline-flex items-center px-4 py-2 border border-primary/20 rounded-md hover:border-primary/40 transition-colors">
                          <Camera className="w-4 h-4 mr-2" />
                          Take Photo
                        </span>
                        <Input
                          id="camera-upload"
                          name="image"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                          capture="environment"
                          ref={fileInputRef}
                          required
                        />
                      </label>
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring"
                      >
                        <span className="inline-flex items-center px-4 py-2 border border-primary/20 rounded-md hover:border-primary/40 transition-colors">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </span>
                        <Input
                          id="image-upload"
                          name="image"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          required
                        />
                      </label>
                    </>
                  ) : (
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring"
                    >
                      <span className="inline-flex items-center px-4 py-2 border border-primary/20 rounded-md hover:border-primary/40 transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </span>
                      <Input
                        id="image-upload"
                        name="image"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        required
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
          <SubmitButton />
        </form>

        {isProcessing && (
          <div className="mt-4 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Processing image...</p>
          </div>
        )}

        {state.data && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-center font-headline">Identification Result</h3>
            <PlantInfoCard data={state.data} type="identification" uploadedImagePreview={filePreview || undefined} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
