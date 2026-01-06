import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";
import { AdminOfflineBookingsManagement } from "@/components/admin/admin-offline-bookings-management";

export const metadata = {
  title: "Admin Bookings - Zion Car Rentals",
  description: "Manage offline walk-in customer bookings",
};

export default function AdminBookingsPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminOfflineBookingsManagement />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
