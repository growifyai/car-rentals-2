import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FAQContent } from "./faq-content";

export const metadata = {
  title: "FAQ | Zion Car Rentals",
  description: "Frequently Asked Questions about car rentals, bookings, payments, and more",
};

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about our car rental services
            </p>
          </div>
          <FAQContent />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

