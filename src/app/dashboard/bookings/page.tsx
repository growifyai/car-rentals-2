import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

import { BookingsDashboardClient } from "./dashboard-client";

export const metadata = {
  title: "My Bookings | Zion Car Rentals",
  description: "Manage your Zion Car Rentals reservations, payments, and trip information.",
};

export default function BookingsDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto space-y-8 px-4 py-10">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">My bookings</h1>
            <p className="text-sm text-muted-foreground">
              Track your luxury rentals, complete pending actions, and review trip summaries.
            </p>
          </header>

          <BookingsDashboardClient />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

