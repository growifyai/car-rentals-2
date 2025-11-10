import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { NotificationsClient } from "./notifications-client";

export const metadata = {
  title: "Notifications | Zion Car Rentals",
  description: "View and manage your notifications",
};

export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <NotificationsClient />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

