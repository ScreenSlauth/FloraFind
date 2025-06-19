'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle,
  SheetHeader
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogOut, Menu, User, Home, Leaf, Search, Settings } from 'lucide-react';
import { getCurrentUser, signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { UserAccountNav } from '@/components/user-account-nav';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from "next/image";
export function Navbar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const router = useRouter();
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Ensure theme is available after mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Default to dark theme colors
  const isDarkMode = !mounted || theme === "dark" || theme === "system";
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser();
        
        if (user) {
          console.log("User authenticated:", user);
          setIsAuthenticated(true);
          setUser(user);
        } else {
          console.log("User not authenticated");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    
    checkAuth();
  }, [pathname]);
  
  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Logged Out",
        description: "You've been successfully logged out."
      });
      
      setIsMobileMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Navigation items for consistency
  const navItems = [
    {
      name: "Identify Plants",
      href: "/app",
      icon: Search,
      requiresAuth: true
    },
    {
      name: "My Garden",
      href: "/garden",
      icon: Leaf,
      requiresAuth: true
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      requiresAuth: true
    }
  ];

  return (
    <header className="glass-effect backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
      <div className="container max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group px-3 py-2 z-50 relative pointer-events-auto">
            <div className="flex items-center justify-center w-8 h-8 rounded-full glass-icon-button group-hover:bg-primary/10 transition-colors">
              <Leaf className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">FloraFind</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 pointer-events-auto">
          {navItems.map(item => (
            (!item.requiresAuth || (item.requiresAuth && isAuthenticated)) && (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-300 rounded-md px-3 py-1.5 cursor-pointer hover:bg-primary/5 z-50 relative",
                  isActive(item.href)
                    ? "glass-nav-item text-primary"
                    : "hover:glass-nav-item text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
              </Link>
            )
          ))}
          
          {!isAuthenticated && isAuthenticated !== null && (
            <>
              <Link href="/login" className="cursor-pointer hover:opacity-90 transition-opacity">
                <Button variant="glass" size="sm" className="hover:shadow-md transition-shadow">Log In</Button>
              </Link>
              <Link href="/signup" className="cursor-pointer hover:opacity-90 transition-opacity">
                <Button variant="glass-green" size="sm" className="hover:shadow-md transition-shadow">Sign Up</Button>
              </Link>
            </>
          )}
          
          {/* Theme Toggle button */}
          <div className="cursor-pointer">
            <ThemeToggle />
          </div>
          
          {isAuthenticated && user && (
            <>
              {/* User account navigation */}
              <div className="cursor-pointer">
                <UserAccountNav user={{
                  name: user.user_metadata?.username || null,
                  email: user.email,
                  image: user.user_metadata?.avatar_url || null
                }} />
              </div>
            </>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="glass" size="icon" className="glass-icon-button cursor-pointer hover:bg-primary/10 transition-colors">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className={cn(
                "w-[300px] sm:w-[400px] glass-effect backdrop-blur-md",
                isDarkMode ? "border border-white/10 text-white" : "border border-black/10 text-gray-900 bg-white/80"
              )}>
              <SheetHeader>
                <SheetTitle className={isDarkMode ? "text-white" : "text-gray-900"}>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {isAuthenticated && user && (
                  <div className={cn(
                    "flex flex-col items-center pb-4 mb-4 border-b glass-card p-4 rounded-xl",
                    isDarkMode ? "border-white/10" : "border-black/10 bg-white/50"
                  )}>
                    <Avatar className="h-16 w-16 mb-2 ring-2 ring-primary/20">
                      <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.user_metadata?.username || "User"} />
                      <AvatarFallback>{user.user_metadata?.username?.[0] || user.email?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <p className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>
                      {user.user_metadata?.username || user.email}
                    </p>
                    <p className={cn("text-sm", isDarkMode ? "text-white/70" : "text-gray-600")}>
                      {user.email}
                    </p>
                  </div>
                )}
                
                {/* FloraFind Home Link */}
                <Link 
                  href="/"
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-2 rounded-md glass-nav-item cursor-pointer hover:bg-primary/5 transition-colors z-50 relative",
                    isDarkMode 
                      ? "text-white border border-white/20" 
                      : "text-gray-900 bg-white/40 border border-black/10"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Leaf className="w-4 h-4 text-primary" />
                  <span className="text-lg font-semibold">FloraFind</span>
                </Link>
                
                {/* Map through nav items for mobile */}
                {navItems.map(item => (
                  (!item.requiresAuth || (item.requiresAuth && isAuthenticated)) && (
                    <Link 
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md glass-nav-item cursor-pointer hover:bg-primary/5 transition-colors z-50 relative",
                        isDarkMode 
                          ? "text-white border border-white/20" 
                          : "text-gray-900 bg-white/40 border border-black/10",
                        isActive(item.href) && "bg-primary/10"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 text-primary" />
                      <span>{item.name}</span>
                    </Link>
                  )
                ))}
                
                {isAuthenticated !== null && (
                  <div className={cn(
                    "mt-auto pt-4 border-t flex flex-col gap-2",
                    isDarkMode ? "border-white/10" : "border-black/10"
                  )}>
                    {!isAuthenticated ? (
                      <>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer w-full">
                          <Button 
                            variant="glass" 
                            className={cn(
                              "w-full hover:shadow-md transition-shadow",
                              !isDarkMode && "bg-white/50 text-gray-900 hover:bg-white/70"
                            )}
                          >
                            Log In
                          </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer w-full">
                          <Button 
                            variant="glass-green" 
                            className="w-full hover:shadow-md transition-shadow"
                          >
                            Sign Up
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Button 
                        variant="glass-primary" 
                        onClick={handleLogout} 
                        className="w-full cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </Button>
                    )}
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
} 