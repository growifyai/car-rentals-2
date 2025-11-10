import { About } from "@/components/About";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata = {
  title: "About Zion Car Rentals",
  description: "Discover our story, mission, and what sets Zion Car Rentals apart in the luxury mobility space.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <About />
      </main>
      <SiteFooter />
    </div>
  );
}

