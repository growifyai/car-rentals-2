import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

import { BookingDetailClient } from "./booking-detail-client";

interface BookingDetailPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "Booking detail | Zion Car Rentals",
};

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto space-y-8 px-4 py-10">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">Booking detail</h1>
            <p className="text-sm text-muted-foreground">
              Review reservation data, delivery preferences, and payment progress.
            </p>
          </header>

          <BookingDetailClient bookingId={params.id} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

