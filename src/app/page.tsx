"use client";
import { VideoHero } from "@/components/VideoHero";
import { OfferBannerSection } from "@/components/OfferBanner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AUTOMATIC_FONT_OPTIMIZATION_MANIFEST } from "next/dist/shared/lib/constants";
import { m } from "motion/react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ margin: 0, padding: 0 }}>
      <SiteHeader />
      <main className="flex-1">
        <VideoHero viewCarsHref="/cars" />
        <OfferBannerSection />
      </main>
      <SiteFooter />
      {/* <h1 style={{top: "50%", left: "30%", fontSize: "100px", position: "absolute", transformOrigin: "center"}}>Text me +917989838534</h1> */}
    </div>
  );
}
