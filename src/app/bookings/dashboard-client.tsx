"use client";

import { useEffect, useState, useCallback } from "react";

import { useRouter } from "next/navigation";
import { Calendar, Clock, IndianRupee, Car, ChevronRight } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BookingSummary } from "@/types/bookings";
import { toast } from "sonner";

import { fetchMyBookings } from "@/lib/bookings";

export function BookingsDashboardClient() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!token) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching bookings with token:", token ? "Token present" : "No token");
      const data = await fetchMyBookings(token);
      console.log("Bookings fetched:", data);
      if (Array.isArray(data)) {
        console.log(`Setting ${data.length} bookings to state`);
        setBookings(data);
        if (data.length === 0) {
          console.log("No bookings returned from API");
        }
      } else {
        console.error("Invalid bookings data received:", data);
        setError("Invalid data received from server");
        toast.error("Invalid data received from server");
      }
    } catch (err: unknown) {
      console.error("Error loading bookings:", err);
      const errorMessage = err instanceof Error ? err.message : "Unable to load bookings";
      const apiError = err && typeof err === 'object' && 'status' in err ? err as { status: number; details?: unknown } : null;
      console.error("Error details:", {
        message: errorMessage,
        status: apiError?.status,
        details: apiError?.details
      });
      setError(errorMessage);
      toast.error(errorMessage);
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "paid":
      case "active":
        return "default";
      case "payment_pending":
        return "secondary";
      case "pending":
        return "outline";
      case "declined":
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Sort bookings by date (newest first)
  const sortedBookings = [...bookings].sort((a, b) => {
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  if (!token) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>You need to sign in to view your bookings.</p>
          <Button className="mt-4" onClick={() => router.push("/auth/login")}>
            Login to continue
          </Button>
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
        <CardContent className="p-6 space-y-4">
          <p className="text-red-400 font-medium">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadBookings}>
              Retry
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bookings.length && !isLoading && !error) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-muted-foreground">
          <h3 className="text-xl font-semibold text-card-foreground">No bookings found</h3>
          <p className="mt-2">
            {error 
              ? "There was an error loading your bookings. Please try again."
              : "You haven't made any bookings yet. Explore our fleet and start your first reservation."}
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button variant="outline" onClick={loadBookings}>
              Refresh
            </Button>
            <Button onClick={() => router.push("/cars")}>
              Browse cars
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Bookings Grid - Square Blocks */}
      {sortedBookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No bookings found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-all duration-200 aspect-square flex flex-col">
              <CardContent className="p-6 flex flex-col h-full">
                {/* Top: Car Name & Status */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold flex-1 line-clamp-2">{booking.carName}</h3>
                  </div>
                  <Badge variant={getStatusBadgeVariant(booking.status)} className="text-xs">
                    {booking.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>

                {/* Middle: Booking Info */}
                <div className="flex-1 flex flex-col justify-center space-y-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Start Date</p>
                    </div>
                    <p className="text-sm font-semibold ml-6">{new Date(booking.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <p className="text-sm font-semibold ml-6">{booking.duration} hours</p>
                  </div>
                </div>

                {/* Bottom: Pricing & Action */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Total Rental</span>
                      <span className="text-lg font-bold flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        {booking.totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Deposit</span>
                      <span className="text-sm font-semibold flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {booking.depositAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                  >
                    View Details
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

