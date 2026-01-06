import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";
import { AdminCustomersManagement } from "@/components/admin/admin-customers-management";

export const metadata = {
  title: "Customers - Zion Car Rentals",
  description: "Manage customer database",
};

export default function AdminCustomersPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminCustomersManagement />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
