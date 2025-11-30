import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminUpdatesManagement } from "@/components/admin/admin-updates-management";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";

export const metadata = {
  title: "Updates Management | Zion Car Rentals",
  description: "Manage site-wide updates and announcements for all users.",
};

export default function AdminUpdatesPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminUpdatesManagement />
      </AdminLayout>
    </AdminRouteGuard>
  );
}

