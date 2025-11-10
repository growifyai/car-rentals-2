"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookingSummary } from "@/types/bookings";
import { toast } from "sonner";

import {
  fetchAdminStats,
  fetchAdminBookings,
  reviewBooking,
  startBooking,
  completeBooking,
} from "@/lib/admin";

const STATUS_FILTERS: Array<{ label: string; value?: string }> = [
  { label: "All", value: undefined },
  { label: "Pending", value: "pending" },
  { label: "Payment pending", value: "payment_pending" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

export function AdminDashboardClient() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAdminStats>> | null>(null);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsResponse, bookingsResponse] = await Promise.all([
          fetchAdminStats(token),
          fetchAdminBookings(token, statusFilter),
        ]);
        setStats(statsResponse);
        setBookings(bookingsResponse);
      } catch (err) {
        console.error(err);
        setError("Unable to load admin dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [token, statusFilter]);

  const refreshBookings = async () => {
    if (!token) {
      return;
    }
    try {
      const updated = await fetchAdminBookings(token, statusFilter);
      setBookings(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>Administrator access required.</p>
          <Button className="mt-4" onClick={() => router.push("/auth/login")}>Switch account</Button>
        </CardContent>
      </Card>
    );
  }


  if (error) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="p-6 text-red-400">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {stats ? (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total bookings" value={stats.totalBookings} subtitle={`${stats.completedBookings} completed`} />
          <StatCard
            title="Active rentals"
            value={stats.activeBookings}
            subtitle={`${stats.pendingBookings} pending review`}
          />
          <StatCard title="Revenue generated" value={`₹${stats.totalRevenue.toLocaleString()}`} subtitle="Completed rentals" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            variant={statusFilter === filter.value ? "default" : "outline"}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="space-y-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="border-border/70 bg-card/80">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg text-card-foreground">{booking.carName}</CardTitle>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{booking.status}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  {new Date(booking.startTime).toLocaleString()} · {booking.duration} hrs
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="grid gap-3 sm:grid-cols-3">
                <p>Total: ₹{booking.totalPrice.toLocaleString()}</p>
                <p>Deposit: ₹{booking.depositAmount.toLocaleString()}</p>
                <p>Payment: {booking.paymentStatus}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}>
                  View submission
                </Button>
                {booking.status === "pending" ? (
                  <>
                    <Button size="sm" onClick={() => handleReview(booking.id, "accept")}>Accept booking</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleReview(booking.id, "decline")}>
                      Decline
                    </Button>
                  </>
                ) : null}
                {booking.status === "paid" ? (
                  <Button size="sm" onClick={() => handleStart(booking.id)}>Mark as active</Button>
                ) : null}
                {booking.status === "active" ? (
                  <Button size="sm" onClick={() => handleComplete(booking.id)}>Complete booking</Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}

        {!bookings.length ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No bookings for the selected state.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );

  async function handleReview(bookingId: string, action: "accept" | "decline") {
    if (!token) return;
    const adminNotes = action === "decline" ? window.prompt("Reason for declining?") ?? "" : "";
    try {
      await reviewBooking(bookingId, action, token, adminNotes);
      toast.success(`Booking ${action === "accept" ? "accepted" : "declined"}.`);
      await refreshBookings();
    } catch (err) {
      console.error(err);
      toast.error("Unable to update booking status.");
    }
  }

  async function handleStart(bookingId: string) {
    if (!token) return;
    const vehicleName = window.prompt("Vehicle name");
    const vehicleNumber = window.prompt("Vehicle registration number");
    const startOdometer = Number(window.prompt("Starting odometer reading") ?? "0");
    if (!vehicleName || !vehicleNumber) {
      toast.error("Vehicle details are required");
      return;
    }
    try {
      await startBooking(bookingId, { vehicleName, vehicleNumber, startOdometer }, token);
      toast.success("Booking marked as active.");
      await refreshBookings();
    } catch (err) {
      console.error(err);
      toast.error("Unable to start booking.");
    }
  }

  async function handleComplete(bookingId: string) {
    if (!token) return;
    const endOdometer = Number(window.prompt("Ending odometer reading") ?? "0");
    const actualReturn = window.prompt("Actual return time (leave empty for now)");
    try {
      await completeBooking(
        bookingId,
        { endOdometer, actualReturnTime: actualReturn ? new Date(actualReturn).toISOString() : undefined },
        token,
      );
      toast.success("Booking completed and deposit marked for refund.");
      await refreshBookings();
    } catch (err) {
      console.error(err);
      toast.error("Unable to complete booking.");
    }
  }
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <CardTitle className="text-2xl text-card-foreground">{value}</CardTitle>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </CardHeader>
    </Card>
  );
}

