import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminCarsManagement } from "@/components/admin/admin-cars-management";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";

export const metadata = {
  title: "Cars Management | Zion Car Rentals Admin",
  description: "Manage your fleet of rental cars, add new vehicles, and update existing ones.",
};

export default function AdminCarsPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminCarsManagement />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
