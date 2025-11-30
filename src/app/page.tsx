"use client";
import { VideoHero } from "@/components/VideoHero";
import { OfferBannerSection } from "@/components/OfferBanner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <VideoHero viewCarsHref="/cars" />
        <OfferBannerSection />
      </main>
      <SiteFooter />
    </div>
  );
}
