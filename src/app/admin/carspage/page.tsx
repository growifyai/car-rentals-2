import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminCarspageManagement } from "@/components/admin/admin-carspage-management";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";

export const metadata = {
    title: "Cars Page Management | Zion Car Rentals Admin",
    description: "Manage the promotional banner displayed on the cars page.",
};

export default function AdminCarspagePage() {
    return (
        <AdminRouteGuard>
            <AdminLayout>
                <AdminCarspageManagement />
            </AdminLayout>
        </AdminRouteGuard>
    );
}

