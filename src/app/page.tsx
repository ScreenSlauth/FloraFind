"use client";

import HeroGeometric from "@/components/hero-geometric";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf, MoveRight, Flower2, Sprout } from "lucide-react";
import { Pacifico } from "next/font/google";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      delay: 0.5 + i * 0.2,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

// Garden element animations
const floatingLeaf = {
  animate: {
    y: [0, -10, 0],
    rotate: [0, 5, 0, -5, 0],
    transition: { 
      y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
      rotate: { repeat: Infinity, duration: 5, ease: "easeInOut" }
    }
  }
};

export default function Home() {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Ensure theme is available after mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Default to dark theme colors
  const isDarkMode = !mounted || theme === "dark" || theme === "system";
  
  return (
    <HeroGeometric>
      {/* This content is passed as children to HeroGeometric */}
      <div className="max-w-3xl mx-auto text-center my-auto px-4 py-8 flex flex-col items-center justify-center h-full">
        {/* Badge */}
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8 md:mb-12 glass-effect backdrop-blur-md",
            isDarkMode ? "bg-white/10" : "bg-black/5"
          )}
        >
          <Leaf className="h-4 w-4 text-green-500" />
          <span className={cn(
            "text-sm tracking-wide",
            isDarkMode ? "text-white/80" : "text-gray-700"
          )}>
            FloraFind AI
          </span>
        </motion.div>

        {/* Green garden elements - similar to other pages */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating leaves - adjusted for both mobile and desktop */}
          <motion.div
            className={cn(
              "absolute glass-icon-button",
              isMobile ? "top-[8%] left-[5%]" : "top-[15%] left-[10%]"
            )}
            variants={floatingLeaf}
            animate="animate"
          >
            <Leaf className={cn(
              "text-green-500/60",
              isMobile ? "h-8 w-8" : "h-12 w-12"
            )} />
          </motion.div>
          
          <motion.div
            className={cn(
              "absolute glass-icon-button",
              isMobile ? "top-[20%] right-[8%]" : "top-[30%] right-[15%]"
            )}
            variants={floatingLeaf}
            animate="animate"
          >
            <Leaf className={cn(
              "text-green-400/60",
              isMobile ? "h-6 w-6" : "h-8 w-8"
            )} />
          </motion.div>
          
          <motion.div
            className={cn(
              "absolute glass-icon-button",
              isMobile ? "bottom-[15%] left-[10%]" : "bottom-[20%] left-[20%]"
            )}
            variants={floatingLeaf}
            animate="animate"
          >
            <Sprout className={cn(
              "text-emerald-500/60",
              isMobile ? "h-7 w-7" : "h-10 w-10"
            )} />
          </motion.div>
          
          <motion.div
            className={cn(
              "absolute glass-icon-button",
              isMobile ? "top-[40%] right-[3%]" : "top-[60%] right-[5%]"
            )}
            variants={floatingLeaf}
            animate="animate"
          >
            <Flower2 className={cn(
              "text-green-300/60",
              isMobile ? "h-9 w-9" : "h-14 w-14"
            )} />
          </motion.div>
          
          {/* Green gradient blobs */}
          <div className={cn(
            "absolute bg-gradient-to-r from-green-500/5 to-emerald-500/5 blur-3xl",
            isMobile ? "top-[30%] left-[2%] w-40 h-40" : "top-[40%] left-[5%] w-64 h-64"
          )}></div>
          <div className={cn(
            "absolute bg-gradient-to-r from-emerald-400/5 to-teal-500/5 blur-3xl",
            isMobile ? "bottom-[5%] right-[2%] w-48 h-48" : "bottom-[10%] right-[10%] w-80 h-80"
          )}></div>
        </div>

        {/* Titles */}
        <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
            <span className={cn(
              "bg-clip-text text-transparent",
              isDarkMode 
                ? "bg-gradient-to-b from-white to-white/80" 
                : "bg-gradient-to-b from-gray-800 to-gray-600"
            )}>
              Discover the World
            </span>
            <br />
            <span
              className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500",
                pacifico.className
              )}
            >
              Around You
            </span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
          <p className={cn(
            "text-base sm:text-lg md:text-xl mb-10 md:mb-12 leading-relaxed font-light tracking-wide max-w-xl mx-auto",
            isDarkMode ? "text-white/70" : "text-gray-700"
          )}>
            Snap a photo, identify any plant, and learn its secrets. FloraFind uses AI to bring botany to your fingertips.
          </p>
        </motion.div>

        {/* Button */}
        <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
          <Link href="/app">
            <Button
              variant="glass-primary"
              size="xl"
              className="font-semibold text-lg"
            >
              Start Exploring
              <MoveRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </HeroGeometric>
  );
}
