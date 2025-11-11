"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookingDetail } from "@/types/bookings";
import { toast } from "sonner";

import { fetchBookingDetail } from "@/lib/bookings";

interface BookingDetailClientProps {
  bookingId: string;
}

export function BookingDetailClient({ bookingId }: BookingDetailClientProps) {
  const { token } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      toast.error("Please login to view booking details");
      router.push("/auth/login");
      return;
    }

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const detail = await fetchBookingDetail(bookingId, token);
        setBooking(detail);
      } catch (err) {
        console.error(err);
        setError("Unable to load booking details");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [bookingId, token, router]);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />;
  }

  if (error || !booking) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="p-6 text-red-400">{error ?? "Booking not found"}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/80">
        <CardHeader className="space-y-2">
          <CardTitle>{booking.carName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Status: {booking.status} · Payment: {booking.paymentStatus}
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Start: {new Date(booking.startTime).toLocaleString()}</p>
            <p>End: {new Date(booking.endTime).toLocaleString()}</p>
            <p>Duration: {booking.duration} hours</p>
            <p>Total rental: ₹{booking.totalPrice.toLocaleString()}</p>
            <p>Deposit: ₹{booking.depositAmount.toLocaleString()}</p>
            <p>Deposit type: {booking.depositType ?? "Cash"}</p>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Primary guest: {booking.fullName}</p>
            <p>Contact: {booking.email} / {booking.mobile}</p>
            <p>Address: {booking.residentialAddress}</p>
            <p>
              Guardian: {booking.guardianName} ({booking.guardianRelation})
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">References</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {booking.references?.length ? (
            booking.references.map((ref, index) => (
              <p key={`${ref.name}-${index}`}>
                {ref.name} — {ref.mobile}
              </p>
            ))
          ) : (
            <p>No references recorded.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Delivery preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Home delivery: {booking.homeDelivery ? "Yes" : "No"}</p>
          {booking.homeDelivery ? (
            <>
              <p>Address: {booking.deliveryAddress ?? "—"}</p>
              <p>Distance: {booking.deliveryDistance ?? 0} km</p>
            </>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back to bookings
        </Button>
      </div>
    </div>
  );
}

