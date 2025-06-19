"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LogOut, User, Settings, Home, Leaf, Bell, Shield, HelpCircle, Moon, Sun, ChevronRight, Calendar as CalendarIcon, PlusCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, signOut, updateProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export default function DashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: "",
    avatar_url: ""
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    plantReminders: true,
    newFeatures: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    shareGardenPublicly: false,
    allowAnonymousData: true
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const { user, error } = await getCurrentUser();
        
        if (error || !user) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to access the dashboard.",
            variant: "destructive"
          });
          router.push("/login");
          return;
        }
        
        setUser(user);
        setProfileData({
          username: user.user_metadata?.username || "",
          avatar_url: user.user_metadata?.avatar_url || ""
        });
        setLoading(false);
      } catch (error) {
        console.error("Error loading user:", error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
      }
    }
    
    loadUser();
  }, [router, toast]);

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

  const handleProfileUpdate = async () => {
    try {
      const { user, error } = await updateProfile(profileData);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setUser(user);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">
              <div className="flex items-center space-x-2">
                <User size={20} />
                <span>User Profile</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              {user?.email && (
                <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
              )}
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Log Out
              </Button>
            </div>
            
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/dashboard")}>
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/garden")}>
                <Leaf className="mr-2 h-4 w-4" />
                My Garden
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/app")}>
                <Leaf className="mr-2 h-4 w-4" />
                Identify Plants
              </Button>
              <Separator className="my-2" />
              <Button variant="ghost" className="w-full justify-start">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            FloraFind AI © 2024
          </CardFooter>
        </Card>
        
        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your account information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Display Name</Label>
                    <Input 
                      id="username" 
                      value={profileData.username} 
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      placeholder="Your display name" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input 
                      id="avatar" 
                      value={profileData.avatar_url} 
                      onChange={(e) => setProfileData({...profileData, avatar_url: e.target.value})}
                      placeholder="https://example.com/avatar.jpg" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={user?.email || ""} 
                      disabled 
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email address
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleProfileUpdate}>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure which notifications you receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="plant-reminders" className="text-base">Plant Care Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminders about plant care and maintenance
                      </p>
                    </div>
                    <Switch 
                      id="plant-reminders" 
                      checked={notificationSettings.plantReminders}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, plantReminders: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="new-features" className="text-base">New Features</Label>
                      <p className="text-sm text-muted-foreground">
                        Stay updated about new FloraFind features
                      </p>
                    </div>
                    <Switch 
                      id="new-features" 
                      checked={notificationSettings.newFeatures}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newFeatures: checked})}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control your data and privacy preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="share-garden" className="text-base">Share Garden Publicly</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to view your garden collection
                      </p>
                    </div>
                    <Switch 
                      id="share-garden" 
                      checked={privacySettings.shareGardenPublicly}
                      onCheckedChange={(checked) => setPrivacySettings({...privacySettings, shareGardenPublicly: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="anon-data" className="text-base">Anonymous Usage Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow FloraFind to collect anonymous usage data to improve the service
                      </p>
                    </div>
                    <Switch 
                      id="anon-data" 
                      checked={privacySettings.allowAnonymousData}
                      onCheckedChange={(checked) => setPrivacySettings({...privacySettings, allowAnonymousData: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Data Management</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">Export My Data</Button>
                      <Button variant="outline" className="w-full text-destructive hover:text-destructive">Delete My Account</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Deleting your account will permanently remove all your data
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Privacy Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 