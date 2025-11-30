import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminHomepageManagement } from "@/components/admin/admin-homepage-management";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";

export const metadata = {
  title: "Homepage Management | Zion Car Rentals",
  description: "Manage homepage hero video and offer banners.",
};

export default function AdminHomepagePage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminHomepageManagement />
      </AdminLayout>
    </AdminRouteGuard>
  );
}

