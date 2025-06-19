"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Leaf, Camera, Search } from "lucide-react";

const ParallaxSection = ({
  imageUrl,
  dataAiHint,
  children,
  className,
  minHeight = "min-h-screen",
  overlayOpacity = "bg-black/30",
}: {
  imageUrl: string;
  dataAiHint: string;
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  overlayOpacity?: string;
}) => (
  <div
    className={`relative ${minHeight} bg-cover bg-center flex items-center justify-center ${className || ''}`}
    style={{ backgroundImage: `url(${imageUrl})` }}
  >
    <Image
      src={imageUrl}
      alt=""
      fill={true}
      style={{ objectFit: 'cover' }}
      className="opacity-0 pointer-events-none"
      data-ai-hint={dataAiHint}
    />
    <div className={`absolute inset-0 ${overlayOpacity} backdrop-blur-[1px]`}></div>
    <div className="relative z-10 text-center text-white p-4">
      {children}
    </div>
  </div>
);

export function LandingPageComponent() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-md">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Link href="/login">
            <button className="px-4 py-2 bg-green-600/90 backdrop-blur-sm text-white rounded hover:bg-green-700 transition">Login</button>
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        <ParallaxSection imageUrl="https://placehold.co/1920x1080.png" dataAiHint="forest landscape">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-headline animate-fade-in-down">
              Discover the World of Plants
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in-up">
              Identify species, learn their secrets, and connect with nature using the power of AI.
            </p>
          </div>
        </ParallaxSection>

        <section className="py-16 bg-background/50 backdrop-blur-md text-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-12 font-headline text-primary">Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center p-6 bg-card/70 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/10">
                <Camera className="h-16 w-16 text-primary mb-4" />
                <h3 className="text-2xl font-semibold mb-2 font-headline">Instant Identification</h3>
                <p className="text-muted-foreground">
                  Upload an image and let our AI identify the plant species in seconds.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-card/70 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/10">
                <Search className="h-16 w-16 text-primary mb-4" />
                <h3 className="text-2xl font-semibold mb-2 font-headline">Rich Information</h3>
                <p className="text-muted-foreground">
                  Access detailed descriptions, uses, native regions, and growing conditions.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-card/70 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/10">
                <Leaf className="h-16 w-16 text-primary mb-4" />
                <h3 className="text-2xl font-semibold mb-2 font-headline">Medicinal Insights</h3>
                <p className="text-muted-foreground">
                  Discover traditional medicinal uses and regional botanical knowledge.
                </p>
              </div>
            </div>
          </div>
        </section>

        <ParallaxSection imageUrl="https://placehold.co/1920x1080.png" dataAiHint="close-up leaves" minHeight="min-h-[60vh]" overlayOpacity="bg-black/20">
          <div className="container mx-auto px-4 py-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-headline">
              Your Botanical Journey Starts Here
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto">
              Whether you're a curious beginner or a seasoned botanist, FloraFind is your companion in exploring the plant kingdom.
            </p>
          </div>
        </ParallaxSection>
      </main>

      <footer className="py-4 bg-background/70 backdrop-blur-md border-t border-white/10">
        <div className="container mx-auto px-4">
          <p>&copy; 2025 FloraFind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

    