"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BookingDetail } from "@/types/bookings";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";

import { fetchBookingDetail } from "@/lib/bookings";
import { getApiBaseUrl } from "@/lib/env";
import type { ApiClientError } from "@/lib/api-client";

interface BookingDetailClientProps {
  bookingId: string;
}

export function BookingDetailClient({ bookingId }: BookingDetailClientProps) {
  const { token } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReceipt = async () => {
    if (!token) {
      toast.error("Please login to download receipt");
      return;
    }

    setIsDownloading(true);
    try {
      const receiptUrl = `${getApiBaseUrl()}/api/bookings/${bookingId}/receipt`;
      
      const response = await fetch(receiptUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to download receipt' }));
        throw new Error(errorData.error || 'Failed to download receipt');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Receipt downloaded successfully");
    } catch (error: unknown) {
      console.error("Error downloading receipt:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to download receipt";
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please login to view booking details");
      router.push("/auth/login");
      return;
    }

    const loadBooking = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const detail = await fetchBookingDetail(bookingId, token);
        if (!detail || !detail.id) {
          setError("Invalid booking data received");
          return;
        }
        setBooking(detail);
      } catch (err: unknown) {
        console.error("Error fetching booking detail:", err);
        let errorMessage = "Unable to load booking details";
        if (err && typeof err === 'object' && 'status' in err) {
          const apiError = err as ApiClientError;
          if (apiError.status === 404) {
            errorMessage = "Booking not found. It may have been deleted or you don't have access to it.";
          } else if (apiError.status === 401 || apiError.status === 403) {
            errorMessage = "You don't have permission to view this booking. Please login again.";
          } else if (apiError.status === 0) {
            errorMessage = "Network error: Unable to connect to the server. Please check your internet connection.";
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "string") {
          errorMessage = err;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, token, router]);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />;
  }

  if (error || !booking) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="p-6 space-y-4">
          <p className="text-red-400 font-medium">{error ?? "Booking not found"}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/bookings")}>
              Back to bookings
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/80">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl">{booking.carName}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant={booking.status === "completed" ? "default" : booking.status === "active" ? "default" : "outline"}>
                {booking.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Start Time</p>
              <p className="font-medium">{new Date(booking.startTime).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">End Time</p>
              <p className="font-medium">{new Date(booking.endTime).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Duration</p>
              <p className="font-medium">{booking.duration} hours</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Rental</p>
              <p className="font-medium text-lg">₹{booking.totalPrice.toLocaleString()}</p>
            </div>
            {booking.advanceAmount && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Advance Paid</p>
                <p className="font-medium text-green-600">₹{booking.advanceAmount.toLocaleString()}</p>
              </div>
            )}
            {booking.advanceAmount && booking.totalPrice && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Remaining Amount</p>
                <p className="font-medium text-orange-600">₹{(booking.totalPrice - booking.advanceAmount).toLocaleString()}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Deposit</p>
              <p className="font-medium">₹{booking.depositAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Deposit Type</p>
              <p className="font-medium">{booking.depositType === "bike" ? "Two Wheeler" : (booking.depositType ?? "Cash").charAt(0).toUpperCase() + (booking.depositType ?? "Cash").slice(1)}</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Primary Guest</p>
              <p className="font-medium">{booking.fullName ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Contact</p>
              <p className="font-medium">
                {booking.email ?? "—"}
                {booking.mobile ? ` / ${booking.mobile}` : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Address</p>
              <p className="font-medium">{booking.residentialAddress ?? "—"}</p>
            </div>
            {booking.guardianName && booking.guardianRelation ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Guardian</p>
                <p className="font-medium">
                  {booking.guardianName} ({booking.guardianRelation})
                </p>
              </div>
            ) : null}
            {booking.occupation ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Occupation</p>
                <p className="font-medium">{booking.occupation}</p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Home Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Home delivery is also available after booking. Contact - 91xxxxx, charges will be applicable.
          </p>
        </CardContent>
      </Card>

      {booking.advancePaymentStatus === 'completed' && (
        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-4" />
              Payment Receipt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download your advance payment receipt. The remaining amount must be paid at the time of vehicle pickup.
            </p>
            <Button
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
              className="w-full sm:w-auto"
            >
              <Download className="size-4 mr-2" />
              {isDownloading ? "Downloading..." : "Download Receipt PDF"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
    </div>
  );
}

