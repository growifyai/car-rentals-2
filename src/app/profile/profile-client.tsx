"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  LogOut,
  CreditCard,
  MapPin
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function ProfileClient() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'bookings'>('personal');
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground text-center mb-6">
              Please log in to view and manage your profile
            </p>
            <Button asChild className="w-full">
              <a href="/auth/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name,
      email: user.email,
      phone: "+1 (555) 123-4567",
      address: "123 Main Street",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
    toast.success("Logged out successfully");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20 bg-orange-500">
            <AvatarImage src="" alt={user.name} />
            <AvatarFallback className="text-lg text-white bg-orange-500">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Button onClick={handleLogout} variant="destructive" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </Card>

      {/* Vertical Navigation Menu */}
      <Card className="p-0">
        <div className="space-y-0">
          <button 
            onClick={() => setActiveTab('personal')}
            className={`w-full flex items-center space-x-3 px-6 py-4 text-left hover:bg-muted/50 transition-colors ${
              activeTab === 'personal' ? 'bg-muted/30 border-r-2 border-primary' : ''
            }`}
          >
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground font-medium">Personal</span>
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center space-x-3 px-6 py-4 text-left hover:bg-muted/50 transition-colors ${
              activeTab === 'bookings' ? 'bg-muted/30 border-r-2 border-primary' : ''
            }`}
          >
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground font-medium">Bookings</span>
          </button>
        </div>
      </Card>

      {/* Content Area */}
      {activeTab === 'personal' && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-xl">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline" className="border-muted-foreground">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    value={isEditing ? formData.name : user.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? formData.email : user.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!isEditing}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    disabled={!isEditing}
                    placeholder="New York"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    disabled={!isEditing}
                    placeholder="NY"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-medium">ZIP/Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    disabled={!isEditing}
                    placeholder="10001"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    disabled={!isEditing}
                    placeholder="United States"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'bookings' && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <CreditCard className="h-5 w-5 mr-2" />
              Booking History
            </CardTitle>
            <CardDescription>
              View and manage your car rental bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No bookings found</p>
              <p className="text-sm text-muted-foreground mb-6">
                Your booking history will appear here once you make a reservation.
              </p>
              <Button asChild>
                <a href="/cars">Browse Cars</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}