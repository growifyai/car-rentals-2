"use client";

import { useEffect, useState, useCallback } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookingSummary } from "@/types/bookings";
import { toast } from "sonner";

import { fetchMyBookings, createPaymentOrder, verifyPayment } from "@/lib/bookings";
import { loadRazorpayScript } from "@/lib/razorpay";

export function BookingsDashboardClient() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!token) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMyBookings(token);
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load bookings");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    loadBookings();
  }, [token, loadBookings]);

  const handlePayment = async (booking: BookingSummary) => {
    if (!token) {
      toast.error("Login required to make payments");
      return router.push("/auth/login");
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Unable to load Razorpay checkout. Please try again later.");
      return;
    }

    setPayingBookingId(booking.id);
    try {
      const orderResponse = await createPaymentOrder(booking.id, token);
      const key = orderResponse.razorpayKeyId;
      if (!key) {
        throw new Error("Missing Razorpay key");
      }

      const options = {
        key,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: "Zion Car Rentals",
        description: `Booking payment for ${booking.carName}`,
        order_id: orderResponse.order.id,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            await verifyPayment({
              bookingId: booking.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }, token);
            toast.success("Payment successful. Your booking is confirmed!");
            await loadBookings();
          } catch (verificationError) {
            console.error(verificationError);
            toast.error("Payment verification failed. Contact support if amount was deducted.");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#ff6b00",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        toast.error("Payment failed or was cancelled.");
      });
      razorpay.open();
    } catch (paymentError) {
      console.error(paymentError);
      const message = (paymentError as { message?: string }).message ?? "Unable to initiate payment.";
      toast.error(message);
    } finally {
      setPayingBookingId(null);
    }
  };

  if (!token) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>You need to sign in to view your bookings.</p>
          <Button className="mt-4" onClick={() => router.push("/auth/login")}>Login to continue</Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-muted/40" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="p-6 text-red-400">{error}</CardContent>
      </Card>
    );
  }

  if (!bookings.length) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-muted-foreground">
          <h3 className="text-xl font-semibold text-card-foreground">No bookings yet</h3>
          <p className="mt-2">Explore our fleet and start your first reservation.</p>
          <Button className="mt-4" onClick={() => router.push("/cars")}>Browse cars</Button>
        </CardContent>
      </Card>
    );
  }

  return (
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
                Starts: {new Date(booking.startTime).toLocaleString()} · Duration: {booking.duration} hrs
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Total rental: ₹{booking.totalPrice.toLocaleString()}</p>
              <p>Deposit: ₹{booking.depositAmount.toLocaleString()}</p>
              <p>Payment status: {booking.paymentStatus}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
              >
                View details
              </Button>
              {booking.status === "payment_pending" ? (
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => handlePayment(booking)}
                  disabled={payingBookingId === booking.id}
                >
                  {payingBookingId === booking.id ? "Processing..." : "Make payment"}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

