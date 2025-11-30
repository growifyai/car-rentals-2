"use client";

import { useEffect, useState } from "react";
import { Video, Image as ImageIcon, Save } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getAdminHeroVideo,
  updateHeroVideo,
  getAdminOfferBanner,
  updateOfferBanner,
} from "@/lib/homepage";
import { toast } from "sonner";

export function AdminHomepageManagement() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hero Video State
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [heroVideoActive, setHeroVideoActive] = useState(true);
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // Offer Banner State
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
      const [videoData, bannerData] = await Promise.all([
        getAdminHeroVideo(token),
        getAdminOfferBanner(token),
      ]);

      if (videoData.heroVideo) {
        setHeroVideoUrl(videoData.heroVideo.videoUrl || "");
        setHeroVideoActive(videoData.heroVideo.active !== undefined ? videoData.heroVideo.active : true);
      }

      if (bannerData.banner) {
        setBannerData({
          imageUrl: bannerData.banner.imageUrl || "",
          title: bannerData.banner.title || "",
          description: bannerData.banner.description || "",
          linkUrl: bannerData.banner.linkUrl || "",
          active: bannerData.banner.active !== undefined ? bannerData.banner.active : true,
        });
      }
    } catch (err: unknown) {
      console.error("Failed to load homepage data", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load homepage data";
      setError(errorMessage);
      toast.error("Failed to load homepage data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVideo = async () => {
    if (!token || !heroVideoUrl.trim()) {
      toast.error("Please enter a video URL");
      return;
    }

    setIsSavingVideo(true);
    try {
      await updateHeroVideo(heroVideoUrl.trim(), heroVideoActive, token);
      toast.success("Hero video updated successfully");
    } catch (err: unknown) {
      console.error("Failed to update hero video", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update hero video";
      toast.error(errorMessage);
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!token || !bannerData.imageUrl.trim()) {
      toast.error("Please enter a banner image URL");
      return;
    }

    setIsSavingBanner(true);
    try {
      await updateOfferBanner(bannerData, token);
      toast.success("Offer banner updated successfully");
    } catch (err: unknown) {
      console.error("Failed to update offer banner", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update offer banner";
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
        <h1 className="text-3xl font-bold text-foreground">Homepage Management</h1>
        <p className="text-muted-foreground">
          Manage the hero video and offer banners displayed on the homepage.
        </p>
      </div>

      {/* Hero Video Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="size-5" />
            Hero Video
          </CardTitle>
          <CardDescription>
            Set the background video for the homepage hero section. The video should be in MP4 format and hosted online.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-video-url">Video URL</Label>
            <Input
              id="hero-video-url"
              type="url"
              value={heroVideoUrl}
              onChange={(e) => setHeroVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
            />
            <p className="text-sm text-muted-foreground">
              Enter the full URL to your video file (MP4 format recommended)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="hero-video-active"
              checked={heroVideoActive}
              onCheckedChange={(checked) => setHeroVideoActive(checked)}
            />
            <Label htmlFor="hero-video-active">Active (Show on homepage)</Label>
          </div>
          {heroVideoUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <video
                src={heroVideoUrl}
                controls
                className="w-full max-w-md rounded-lg"
                style={{ maxHeight: "300px" }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          <Button onClick={handleSaveVideo} disabled={isSavingVideo || isLoading}>
            <Save className="size-4 mr-2" />
            {isSavingVideo ? "Saving..." : "Save Video"}
          </Button>
        </CardContent>
      </Card>

      {/* Offer Banner Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            Offer Banner
          </CardTitle>
          <CardDescription>
            Upload a promotional banner image that will be displayed on the homepage. This should be a high-quality image (poster/festival style).
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
              placeholder="https://example.com/banner.jpg"
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
              placeholder="Special Offer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="banner-description">Description (Optional)</Label>
            <Textarea
              id="banner-description"
              value={bannerData.description}
              onChange={(e) => setBannerData({ ...bannerData, description: e.target.value })}
              placeholder="Limited time offer..."
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
              placeholder="https://example.com/offer"
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
            <Label htmlFor="banner-active">Active (Show on homepage)</Label>
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

