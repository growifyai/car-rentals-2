import { Contact } from "@/components/Contact";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata = {
  title: "Contact Zion Car Rentals",
  description: "Get in touch with the Zion Car Rentals concierge team for bookings, support, and partnerships.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}

