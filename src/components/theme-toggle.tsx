"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeToggleProps {
  size?: "default" | "sm";
}

export function ThemeToggle({ size = "default" }: ThemeToggleProps) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  // After mounting, we have access to the theme
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const iconSize = size === "sm" ? "h-[1rem] w-[1rem]" : "h-[1.2rem] w-[1.2rem]";
  
  // Early return while not mounted to avoid hydration issues
  if (!mounted) {
    return (
      <Button 
        variant="glass" 
        size={size === "sm" ? "sm" : "icon"}
        className="glass-icon-button cursor-pointer hover:bg-primary/10 transition-colors"
      >
        <Sun className={`${iconSize} text-amber-500`} />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="glass" 
          size={size === "sm" ? "sm" : "icon"} 
          className="glass-icon-button cursor-pointer hover:bg-primary/10 transition-colors relative"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Moon className={`${iconSize} text-blue-400`} />
          ) : (
            <Sun className={`${iconSize} text-amber-500`} />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-effect">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className="cursor-pointer hover:bg-amber-100/20 transition-colors rounded-sm"
        >
          <Sun className="mr-2 h-4 w-4 text-amber-500" /> 
          Light
          {theme === 'light' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className="cursor-pointer hover:bg-blue-100/20 transition-colors rounded-sm"
        >
          <Moon className="mr-2 h-4 w-4 text-blue-400" /> 
          Dark
          {theme === 'dark' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className="cursor-pointer hover:bg-gray-100/20 transition-colors rounded-sm"
        >
          <div className="mr-2 h-4 w-4 flex items-center justify-center">
            <span className="text-sm">⚙️</span>
          </div>
          System
          {(theme === 'system' || !theme) && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
