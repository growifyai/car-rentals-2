import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminDashboardOverview } from "@/components/admin/admin-dashboard-overview";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";

export const metadata = {
  title: "Admin Dashboard | Zion Car Rentals",
  description: "Comprehensive admin dashboard for managing car rental operations, bookings, and fleet.",
};

export default function AdminDashboardPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground">
              Monitor your car rental operations, track performance metrics, and manage bookings efficiently.
            </p>
          </div>
          
          <AdminDashboardOverview />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}

