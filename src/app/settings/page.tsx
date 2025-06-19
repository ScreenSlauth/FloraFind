"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, updateProfile, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Save, Moon, Sun, Bell, BellOff, Upload, Trash2, HelpCircle } from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser();
        
        if (user) {
          setUser(user);
          setUsername(user.user_metadata?.username || "");
          setNotifications(user.user_metadata?.notifications !== false);
          setAvatarUrl(user.user_metadata?.avatar_url || "");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 2MB",
          variant: "destructive"
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      
      setAvatarFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      // If there's an existing avatar URL from Supabase Storage, delete it
      if (avatarUrl && avatarUrl.includes('storage.googleapis.com')) {
        // Extract the file path from the URL
        const urlPath = new URL(avatarUrl).pathname;
        const filePath = urlPath.split('/').slice(-1)[0];
        
        if (filePath) {
          // Delete the file from storage
          const { error } = await supabase.storage
            .from('avatars')
            .remove([filePath]);
            
          if (error) {
            console.error('Error deleting avatar from storage:', error);
          }
        }
      }
      
      // Clear the avatar locally
      setAvatarUrl("");
      setAvatarFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Update the user profile to remove the avatar_url
      if (user) {
        await updateProfile({
          avatar_url: undefined,
        });
      }
      
      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed."
      });
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Error",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive"
      });
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return avatarUrl || undefined;
    
    try {
      // Check if avatars bucket exists, create if not
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
      
      const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
      
      if (!avatarsBucketExists) {
        // Create the avatars bucket
        const { error: createBucketError } = await supabase
          .storage
          .createBucket('avatars', {
            public: true,
            fileSizeLimit: 2097152 // 2MB
          });
          
        if (createBucketError) {
          throw createBucketError;
        }
      }
      
      // Upload the avatar to Supabase Storage
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          upsert: true,
          cacheControl: '3600',
          contentType: avatarFile.type
        });
      
      if (error) {
        throw error;
      }
      
      // Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your avatar.",
        variant: "destructive"
      });
      return avatarUrl || undefined;
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Upload avatar if changed
      const uploadedAvatarUrl = await uploadAvatar();
      
      const { user: updatedUser, error } = await updateProfile({
        username: username,
        avatar_url: uploadedAvatarUrl,
        notifications: notifications
      });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update settings. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setUser(updatedUser);
      setAvatarFile(null); // Clear the file after successful upload
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully."
      });
    } catch (error) {
      console.error("Settings update error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return <div className="flex items-center justify-center h-[calc(100vh-4rem)]">Loading...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={handleSaveProfile} disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? "Saving..." : "Save Changes"}
          {!saving && <Save className="ml-2 h-4 w-4" />}
        </Button>
      </div>
      
      <div className="grid gap-6">
        {/* Profile Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarImage src={avatarUrl} alt={username || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Change
                </Button>
                
                {avatarUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-destructive hover:text-destructive" 
                    onClick={handleRemoveAvatar}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              
              <p className="text-xs text-muted-foreground text-center">
                JPG, PNG or GIF<br />Max 2MB
              </p>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Display Name</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="How should we call you?"
                  className="max-w-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  value={user?.email || ""} 
                  disabled 
                  className="max-w-md bg-muted/50"
                />
              </div>
            </div>
          </div>
        </Card>
        
        {/* Preferences Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Appearance</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={theme === "light" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="w-24"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </Button>
                <Button 
                  variant={theme === "dark" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="w-24"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive plant care reminders and updates
                </p>
              </div>
              <div className="flex items-center gap-2">
                {notifications ? 
                  <Bell className="h-4 w-4 text-primary mr-2" /> : 
                  <BellOff className="h-4 w-4 text-muted-foreground mr-2" />
                }
                <Switch 
                  checked={notifications} 
                  onCheckedChange={setNotifications} 
                />
              </div>
            </div>
          </div>
        </Card>
        
        {/* Help Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Help with Settings
          </h2>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-medium mb-2">How to upload an avatar:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Click the <strong>"Change"</strong> button below your profile picture</li>
                <li>Select an image file (JPG, PNG, or GIF) from your device</li>
                <li>Your selected image will appear as a preview</li>
                <li>Click <strong>"Save Changes"</strong> at the top of the page to confirm</li>
              </ol>
            </div>
            
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-medium mb-2">Troubleshooting:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Make sure your image is less than 2MB in size</li>
                <li>Only JPG, PNG, and GIF formats are supported</li>
                <li>If upload fails, try refreshing the page and uploading again</li>
                <li>For more help, visit our <a href="/help" className="text-primary hover:underline">Help Center</a></li>
              </ul>
            </div>
          </div>
        </Card>
        
        {/* Account Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-base font-medium">Sign Out</p>
                <p className="text-sm text-muted-foreground">
                  Log out from your account
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 