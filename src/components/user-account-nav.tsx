"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth";
import { LogOut, Settings, User, HelpCircle, Leaf } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UserAccountNavProps {
  user: {
    email?: string | null;
    name?: string | null;
    image?: string | null;
    user_metadata?: {
      username?: string | null;
      avatar_url?: string | null;
    };
  };
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const router = useRouter();
  const { toast } = useToast();
  
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

  // Get display name from metadata username or name or email
  const displayName = user.user_metadata?.username || user.name || user.email || "User";
  
  // Get initials from display name
  const initials = displayName
    ? (typeof displayName === 'string' ? displayName[0].toUpperCase() : "U")
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          aria-label="Open user menu"
        >
          <Avatar className="h-8 w-8 ring-1 ring-primary/10">
            <AvatarImage src={user.user_metadata?.avatar_url || user.image || ""} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 glass-effect backdrop-blur-md" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{displayName}</p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link 
            href="/dashboard" 
            className="flex items-center cursor-pointer w-full hover:bg-primary/10 rounded-sm transition-colors"
          >
            <User className="mr-2 h-4 w-4 text-primary" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link 
            href="/garden" 
            className="flex items-center cursor-pointer w-full hover:bg-primary/10 rounded-sm transition-colors"
          >
            <Leaf className="mr-2 h-4 w-4 text-primary" />
            <span>My Garden</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link 
            href="/settings" 
            className="flex items-center cursor-pointer w-full hover:bg-primary/10 rounded-sm transition-colors"
          >
            <Settings className="mr-2 h-4 w-4 text-primary" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link 
            href="/help" 
            className="flex items-center cursor-pointer w-full hover:bg-primary/10 rounded-sm transition-colors"
          >
            <HelpCircle className="mr-2 h-4 w-4 text-primary" />
            <span>Help</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
          onSelect={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4 text-destructive" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 