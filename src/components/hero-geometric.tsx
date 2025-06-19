"use client"

import { motion } from "framer-motion"
import { Pacifico } from "next/font/google"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type React from 'react';
import { Leaf } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
  darkGradient,
  lightGradient,
  isDarkMode = true,
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
  darkGradient?: string
  lightGradient?: string
  isDarkMode?: boolean
}) {
  // Use the appropriate gradient based on theme
  const activeGradient = isDarkMode 
    ? (darkGradient || gradient)
    : (lightGradient || "from-gray-950/[0.04]")
    
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full glass-effect transition-all duration-500",
            "bg-gradient-to-r to-transparent",
            activeGradient,
            isDarkMode 
              ? "backdrop-blur-md border border-white/[0.15]"
              : "backdrop-blur-md border border-black/[0.05]",
            isDarkMode
              ? "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]"
              : "shadow-[0_8px_32px_0_rgba(0,0,0,0.03)]",
            isHovered && "transform scale-110",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

export default function HeroGeometric({
  children,
  badge = "Kokonut UI",
  title1 = "Elevate Your",
  title2 = "Digital Vision",
  description = "Crafting exceptional digital experiences through innovative design and cutting-edge technology.",
}: {
  children?: React.ReactNode;
  badge?: string;
  title1?: string;
  title2?: string;
  description?: string;
}) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme is available after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to dark theme colors
  const isDarkMode = !mounted || theme === "dark" || theme === "system";

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
  }

  return (
    <div className={cn(
      "relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-transparent",
      isDarkMode ? "text-white" : "text-gray-800"
    )}>
      <div className={cn(
        "absolute inset-0 blur-3xl",
        isDarkMode
          ? "bg-gradient-to-br from-green-500/[0.05] via-transparent to-emerald-500/[0.05]"
          : "bg-gradient-to-br from-green-300/[0.1] via-transparent to-emerald-300/[0.1]"
      )} />

      <div className="absolute inset-0 overflow-hidden">
        {/* Update shape colors to be more garden-themed with greens */}
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          darkGradient="from-green-500/[0.15]"
          lightGradient="from-green-500/[0.07]"
          isDarkMode={isDarkMode}
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          darkGradient="from-emerald-500/[0.15]"
          lightGradient="from-emerald-500/[0.07]"
          isDarkMode={isDarkMode}
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          darkGradient="from-teal-500/[0.15]"
          lightGradient="from-teal-500/[0.07]"
          isDarkMode={isDarkMode}
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          darkGradient="from-lime-500/[0.15]"
          lightGradient="from-lime-500/[0.07]"
          isDarkMode={isDarkMode}
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          darkGradient="from-green-400/[0.15]"
          lightGradient="from-green-400/[0.07]"
          isDarkMode={isDarkMode}
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 w-full h-full flex flex-col">
        {children ? (
          <div className="flex-grow flex flex-col">{children}</div>
        ) : (
          <div className="max-w-3xl mx-auto text-center my-auto glass-card p-8 backdrop-blur-md">
            <motion.div
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="glass-nav-item inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8 md:mb-12 mx-auto"
            >
              <Link href="/app" className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-500" />
                <span className={cn(
                  "text-sm tracking-wide",
                  isDarkMode ? "text-white/80" : "text-gray-700"
                )}>
                  {badge}
                </span>
              </Link>
            </motion.div>

            <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                <span className={cn(
                  "bg-clip-text text-transparent",
                  isDarkMode
                    ? "bg-gradient-to-b from-white to-white/80"
                    : "bg-gradient-to-b from-gray-800 to-gray-600"
                )}>
                  {title1}
                </span>
                <br />
                <span
                  className={cn(
                    "bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500",
                    pacifico.className,
                  )}
                >
                  {title2}
                </span>
              </h1>
            </motion.div>

            <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
              <p className={cn(
                "text-base sm:text-lg md:text-xl mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4",
                isDarkMode ? "text-white/70" : "text-gray-700"
              )}>
                {description}
              </p>
            </motion.div>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent pointer-events-none" />
    </div>
  )
}
