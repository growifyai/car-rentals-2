"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Save } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    getAdminCarsBanner,
    updateCarsBanner,
} from "@/lib/homepage";
import { toast } from "sonner";

export function AdminCarspageManagement() {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cars Banner State
    const [bannerData, setBannerData] = useState({
        imageUrl: "",
        title: "",
        description: "",
        linkUrl: "",
        active: true,
    });
    const [isSavingBanner, setIsSavingBanner] = useState(false);

    useEffect(() => {
        if (!token) return;
        loadData();
    }, [token]);

    const loadData = async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);
        try {
            const data = await getAdminCarsBanner(token);

            if (data.banner) {
                setBannerData({
                    imageUrl: data.banner.imageUrl || "",
                    title: data.banner.title || "",
                    description: data.banner.description || "",
                    linkUrl: data.banner.linkUrl || "",
                    active: data.banner.active !== undefined ? data.banner.active : true,
                });
            }
        } catch (err: unknown) {
            console.error("Failed to load cars page banner data", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to load cars page banner data";
            setError(errorMessage);
            toast.error("Failed to load cars page banner data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveBanner = async () => {
        if (!token || !bannerData.imageUrl.trim()) {
            toast.error("Please enter a banner image URL");
            return;
        }

        setIsSavingBanner(true);
        try {
            await updateCarsBanner(bannerData, token);
            toast.success("Cars page banner updated successfully");
        } catch (err: unknown) {
            console.error("Failed to update cars page banner", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to update cars page banner";
            toast.error(errorMessage);
        } finally {
            setIsSavingBanner(false);
        }
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Cars Page Management</h1>
                <p className="text-muted-foreground">
                    Manage the hero section displayed at the top of the cars page.
                </p>
            </div>

            {/* Cars Page Banner Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="size-5" />
                        Hero Section Background
                    </CardTitle>
                    <CardDescription>
                        Change the background image and text for the main hero banner on the cars page. This is the large banner shown below the page title.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="banner-image-url">Banner Image URL *</Label>
                        <Input
                            id="banner-image-url"
                            type="url"
                            value={bannerData.imageUrl}
                            onChange={(e) => setBannerData({ ...bannerData, imageUrl: e.target.value })}
                            placeholder="https://example.com/cars-banner.jpg"
                        />
                        <p className="text-sm text-muted-foreground">
                            Enter the full URL to your banner image
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="banner-title">Title (Optional)</Label>
                        <Input
                            id="banner-title"
                            value={bannerData.title}
                            onChange={(e) => setBannerData({ ...bannerData, title: e.target.value })}
                            placeholder="Explore Our Fleet"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="banner-description">Description (Optional)</Label>
                        <Textarea
                            id="banner-description"
                            value={bannerData.description}
                            onChange={(e) => setBannerData({ ...bannerData, description: e.target.value })}
                            placeholder="Find the perfect car for your journey..."
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="banner-link-url">Link URL (Optional)</Label>
                        <Input
                            id="banner-link-url"
                            type="url"
                            value={bannerData.linkUrl}
                            onChange={(e) => setBannerData({ ...bannerData, linkUrl: e.target.value })}
                            placeholder="https://example.com/special-offer"
                        />
                        <p className="text-sm text-muted-foreground">
                            If provided, clicking the banner will navigate to this URL
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="banner-active"
                            checked={bannerData.active}
                            onCheckedChange={(checked) => setBannerData({ ...bannerData, active: checked })}
                        />
                        <Label htmlFor="banner-active">Active (Show on cars page)</Label>
                    </div>
                    {bannerData.imageUrl && (
                        <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Preview:</p>
                            <img
                                src={bannerData.imageUrl}
                                alt="Banner preview"
                                className="w-full max-w-2xl rounded-lg border"
                                style={{ maxHeight: "400px", objectFit: "contain" }}
                            />
                        </div>
                    )}
                    <Button onClick={handleSaveBanner} disabled={isSavingBanner || isLoading}>
                        <Save className="size-4 mr-2" />
                        {isSavingBanner ? "Saving..." : "Save Banner"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

