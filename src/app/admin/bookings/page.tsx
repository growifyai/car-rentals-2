import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminBookingsManagement } from "@/components/admin/admin-bookings-management";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";

export const metadata = {
  title: "Bookings Management | Zion Car Rentals Admin",
  description: "Manage all customer bookings, review applications, and track rental status.",
};

export default function AdminBookingsPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminBookingsManagement />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
