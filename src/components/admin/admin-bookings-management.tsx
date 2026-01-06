"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Play,
  Square,
  Calendar,
  User,
  Car,
  DollarSign,
  Clock,
  FileText,
  Download,
  Plus,
  Trash2,
  Phone,
  Share2
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchAdminBookings, verifyBooking, startBooking, completeBooking } from "@/lib/admin";
import { apiFetch } from "@/lib/api-client";
import { getApiBaseUrl } from "@/lib/env";
import { toast } from "sonner";

interface BookingDetail {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    mobile: string;
  };
  carId: {
    _id: string;
    name?: string;
    carName?: string;
    model?: string;
    type?: string;
  } | string | null;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  fullName: string;
  guardianName: string;
  guardianRelation: string;
  residentialAddress: string;
  email: string;
  mobile: string;
  occupation: string;
  reference1Name: string;
  reference1Mobile: string;
  reference2Name: string;
  reference2Mobile: string;
  drivingLicenseNumber: string;
  licenseExpiryDate: string;
  drivingLicenseImage: string;
  aadharCardImage: string;
  livePhoto: string;
  depositType: string;
  bikeDetails?: string;
  homeDelivery: boolean;
  deliveryAddress?: string;
  deliveryDistance?: number;
  vehicleName?: string;
  vehicleNumber?: string;
  startOdometer?: number;
  endOdometer?: number;
  actualReturnTime?: string;
  lateReturnFee?: number;
  lateHours?: number;
  adminNotes?: string;
  receiptPdfUrl?: string;
  advanceAmount?: number;
  advancePaymentStatus?: string;
  createdAt: string;
}

const STATUS_FILTERS = [
  { label: "All Bookings", value: "all" },
  { label: "Advance Paid", value: "advance_paid" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  // Legacy statuses for backward compatibility
  { label: "Pending Review", value: "pending" },
  { label: "Payment Pending", value: "payment_pending" },
  { label: "Paid", value: "paid" },
  { label: "Declined", value: "declined" },
];

// Helper function to safely get car name
function getCarName(carId: BookingDetail['carId']): string {
  if (!carId) return "Car not found";
  if (typeof carId === 'string') return "Car not found";
  if (typeof carId === 'object') {
    return carId.name || carId.carName || "Car not found";
  }
  return "Car not found";
}

// Helper function to safely get car model
function getCarModel(carId: BookingDetail['carId']): string {
  if (!carId || typeof carId === 'string') return "N/A";
  if (typeof carId === 'object') {
    return carId.model || "N/A";
  }
  return "N/A";
}

export function AdminBookingsManagement() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"verify" | "start" | "complete" | "view">("view");

  useEffect(() => {
    if (!token) return;

    const loadBookings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFetch<{ bookings: BookingDetail[] }>("/api/bookings", { token });
        console.log("Admin bookings API response:", response);
        if (response.bookings && response.bookings.length > 0) {
          console.log("Sample booking carId:", response.bookings[0].carId);
          console.log("CarId type:", typeof response.bookings[0].carId);
        }
        setBookings(response.bookings);
        setFilteredBookings(response.bookings);
      } catch (err) {
        console.error("Failed to load bookings:", err);
        setError("Unable to load bookings");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [token]);

  useEffect(() => {
    let filtered = bookings;

    // Filter by status
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => {
        const carName = getCarName(booking.carId).toLowerCase();
        return booking.customerId.name.toLowerCase().includes(query) ||
          carName.includes(query) ||
          booking.fullName.toLowerCase().includes(query) ||
          booking.email.toLowerCase().includes(query) ||
          booking.mobile.includes(query);
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "accepted": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
      case "payment_pending": return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800";
      case "paid": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      case "active": return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
      case "declined": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const handleAction = (booking: BookingDetail, action: "view" | "verify" | "start" | "complete") => {
    setSelectedBooking(booking);
    setModalType(action);
    setIsModalOpen(true);
  };

  const handleVerify = async (action: "accept" | "reject", rejectionReason?: string, adminNotes?: string) => {
    if (!selectedBooking || !token) return;

    try {
      await verifyBooking(selectedBooking._id, action, token, rejectionReason, adminNotes);
      toast.success(`Booking ${action === "accept" ? "verified and accepted" : "rejected"}`);
      setIsModalOpen(false);
      // Refresh bookings
      const response = await apiFetch<{ bookings: BookingDetail[] }>("/api/bookings", { token });
      setBookings(response.bookings);
    } catch (err) {
      console.error("Failed to verify booking:", err);
      toast.error("Failed to update booking status");
    }
  };

  const handleStart = async (vehicleName: string, vehicleNumber: string, startOdometer: number) => {
    if (!selectedBooking || !token) return;

    try {
      await startBooking(selectedBooking._id, { vehicleName, vehicleNumber, startOdometer }, token);
      toast.success("Rental started successfully");
      setIsModalOpen(false);
      // Refresh bookings
      const response = await apiFetch<{ bookings: BookingDetail[] }>("/api/bookings", { token });
      setBookings(response.bookings);
    } catch (err) {
      console.error("Failed to start rental:", err);
      toast.error("Failed to start rental");
    }
  };

  const handleComplete = async (endOdometer: number, actualReturnTime?: string) => {
    if (!selectedBooking || !token) return;

    try {
      await completeBooking(selectedBooking._id, { endOdometer, actualReturnTime }, token);
      toast.success("Rental completed successfully");
      setIsModalOpen(false);
      // Refresh bookings
      const response = await apiFetch<{ bookings: BookingDetail[] }>("/api/bookings", { token });
      setBookings(response.bookings);
    } catch (err) {
      console.error("Failed to complete rental:", err);
      toast.error("Failed to complete rental");
    }
  };


  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bookings Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage all customer bookings, review applications, and track rental status.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
            {filteredBookings.length} bookings
          </Badge>
        </div>
      </div>

      {/* Filters Section */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
              <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
                <Filter className="h-5 w-5" />
                <span>Filters & Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search by customer name, car, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="z-[10001]" style={{ zIndex: 10001 }}>
                    {STATUS_FILTERS.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
              <CardTitle className="text-slate-800 dark:text-slate-200">All Bookings</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-0">
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800">
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">Customer</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">Car</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">Duration</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">Start Time</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">Total Price</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">Status</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking._id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="py-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">{booking.customerId.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 break-words">{booking.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {getCarName(booking.carId)}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {getCarModel(booking.carId)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                            {booking.duration} hours
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-slate-600 dark:text-slate-400">
                          {new Date(booking.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ₹{booking.totalPrice.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(booking, "view")}
                              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {booking.status === "advance_paid" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleAction(booking, "verify")}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {booking.status === "verified" && (
                              <Button
                                size="sm"
                                onClick={() => handleAction(booking, "start")}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {booking.status === "active" && (
                              <Button
                                size="sm"
                                onClick={() => handleAction(booking, "complete")}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <Square className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>

              {filteredBookings.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No bookings found</h3>
                  <p className="text-slate-500 dark:text-slate-500">
                    {searchQuery || statusFilter !== "all"
                      ? "No bookings match your current filters."
                      : "No bookings have been created yet."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

      {/* Action Modals */}
      <BookingActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
        type={modalType}
        onVerify={handleVerify}
        onStart={handleStart}
        onComplete={handleComplete}
      />
    </div>
  );
}

// Modal component for booking actions
function BookingActionModal({
  isOpen,
  onClose,
  booking,
  type,
  onVerify,
  onStart,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetail | null;
  type: "verify" | "start" | "complete" | "view";
  onVerify: (action: "accept" | "reject", rejectionReason?: string, adminNotes?: string) => void;
  onStart: (vehicleName: string, vehicleNumber: string, startOdometer: number) => void;
  onComplete: (endOdometer: number, actualReturnTime?: string) => void;
}) {
  const [adminNotes, setAdminNotes] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [startOdometer, setStartOdometer] = useState(0);
  const [endOdometer, setEndOdometer] = useState(0);
  const [actualReturnTime, setActualReturnTime] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const { token } = useAuth();

  const handleDownloadReceipt = async (bookingId: string) => {
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

  const handleShareReceiptWhatsApp = async (bookingId: string) => {
    if (!token) {
      toast.error("Please login to share receipt");
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
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch receipt' }));
        throw new Error(errorData.error || 'Failed to fetch receipt');
      }

      const blob = await response.blob();
      const file = new File([blob], `receipt-${bookingId}.pdf`, { type: 'application/pdf' });

      // Check if Web Share API is supported (works on mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Booking Receipt',
          text: `Receipt for booking ${bookingId}`,
        });
        toast.success("Receipt shared successfully");
      } else {
        // Fallback for desktop: Download the PDF first, then open WhatsApp
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${bookingId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Wait a moment for download to start, then open WhatsApp
        setTimeout(() => {
          const phoneNumber = booking?.mobile || '';
          const message = encodeURIComponent(`Hi! I'm sharing the receipt for booking #${bookingId}. The PDF has been downloaded to your device. Please attach it to this chat.`);
          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
          window.open(whatsappUrl, '_blank');
          toast.success("Receipt downloaded! Opening WhatsApp - please attach the downloaded PDF.");
        }, 500);
      }
    } catch (error: unknown) {
      console.error("Error sharing receipt:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to share receipt";
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!booking) return null;

  const renderContent = () => {
    switch (type) {
      case "view":
        return (
          <div className="space-y-6">
            {/* Customer Information & Booking Details */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center space-x-2 text-white">
                    <User className="h-5 w-5" />
                    <span>Customer Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Full Name</p>
                      <p className="text-sm font-medium text-white">{booking.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Email</p>
                      <p className="text-sm font-medium text-white break-words">{booking.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Mobile</p>
                      <p className="text-sm font-medium text-white">{booking.mobile}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Occupation</p>
                      <p className="text-sm font-medium text-white">{booking.occupation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Residential Address</p>
                      <p className="text-sm font-medium text-white break-words">{booking.residentialAddress}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center space-x-2 text-white">
                    <Car className="h-5 w-5" />
                    <span>Booking Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Vehicle</p>
                      <p className="text-sm font-medium text-white">
                        {`${getCarName(booking.carId)} ${getCarModel(booking.carId) !== "N/A" ? getCarModel(booking.carId) : ""}`.trim()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Duration</p>
                      <p className="text-sm font-medium text-white">{booking.duration} hours</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Start Time</p>
                      <p className="text-sm font-medium text-white">{new Date(booking.startTime).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">End Time</p>
                      <p className="text-sm font-medium text-white">{new Date(booking.endTime).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Total Price</p>
                      <p className="text-lg font-bold text-green-400">₹{booking.totalPrice.toLocaleString()}</p>
                    </div>
                    {booking.advanceAmount && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Advance Paid</p>
                        <p className="text-sm font-medium text-green-500">₹{booking.advanceAmount.toLocaleString()}</p>
                      </div>
                    )}
                    {booking.advanceAmount && booking.totalPrice && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Remaining Amount</p>
                        <p className="text-sm font-medium text-orange-400">₹{(booking.totalPrice - booking.advanceAmount).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Receipt Download */}
            {booking.advancePaymentStatus === 'completed' && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center space-x-2 text-white">
                    <FileText className="h-5 w-5" />
                    <span>Payment Receipt</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-300">
                    Download the advance payment receipt. The remaining amount must be paid at the time of vehicle pickup.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownloadReceipt(booking._id)}
                      disabled={isDownloading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-2 border-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isDownloading ? "Downloading..." : "Download Receipt PDF"}
                    </Button>
                    <Button
                      onClick={() => handleShareReceiptWhatsApp(booking._id)}
                      disabled={isDownloading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white border-2 border-white"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share on WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* License Information */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2 text-white">
                  <FileText className="h-5 w-5" />
                  <span>License Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Driving License Number</p>
                      <p className="text-sm font-medium text-white">{booking.drivingLicenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">License Expiry Date</p>
                      <p className="text-sm font-medium text-white">{new Date(booking.licenseExpiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {booking.status === "advance_paid" && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-white">Verify Documents & Hand Over Car</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-blue-900 border-blue-700">
                    <AlertDescription className="text-blue-100">
                      <strong>Check the following:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Aadhaar card is present and valid</li>
                        <li>Driving license is valid (not expired)</li>
                        <li>Deposit type (bike or cash) is provided</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Label htmlFor="adminNotes" className="text-white mb-2 block">Admin Notes (Optional)</Label>
                    <Textarea
                      id="adminNotes"
                      placeholder="Add notes about the verification..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <Button
                      onClick={() => onVerify("accept", undefined, adminNotes)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept & Hand Over
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => onVerify("reject", adminNotes || "Documents missing or expired", adminNotes)}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject (Non-Refundable)
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Note: If rejected, the advance payment will NOT be refunded and the time slot will be released.
                  </p>
                </CardContent>
              </Card>
            )}

            {booking.status === "verified" && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-white">Start Rental</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => onStart(vehicleName, vehicleNumber, startOdometer)}
                    disabled={!vehicleName || !vehicleNumber}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Rental
                  </Button>
                </CardContent>
              </Card>
            )}

            {booking.status === "active" && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-white">Complete Rental</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => onComplete(endOdometer, actualReturnTime || undefined)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Complete Rental
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "verify":
        return (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-900">
                <strong>Check the following:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Aadhaar card is present and valid</li>
                  <li>Driving license is valid (not expired)</li>
                  <li>Deposit type (bike or cash) is provided</li>
                </ul>
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                placeholder="Add notes about the verification..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => onVerify("accept", undefined, adminNotes)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept & Hand Over
              </Button>
              <Button variant="destructive" onClick={() => onVerify("reject", adminNotes || "Documents missing or expired", adminNotes)}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject (Non-Refundable)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: If rejected, the advance payment will NOT be refunded and the time slot will be released.
            </p>
          </div>
        );

      case "start":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="vehicleName">Vehicle Name</Label>
              <Input
                id="vehicleName"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                placeholder="Enter vehicle name"
              />
            </div>
            <div>
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input
                id="vehicleNumber"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="Enter vehicle registration number"
              />
            </div>
            <div>
              <Label htmlFor="startOdometer">Start Odometer Reading</Label>
              <Input
                id="startOdometer"
                type="number"
                value={startOdometer}
                onChange={(e) => setStartOdometer(Number(e.target.value))}
                placeholder="Enter odometer reading"
              />
            </div>
            <Button
              onClick={() => onStart(vehicleName, vehicleNumber, startOdometer)}
              disabled={!vehicleName || !vehicleNumber}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Rental
            </Button>
          </div>
        );

      case "complete":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="endOdometer">End Odometer Reading</Label>
              <Input
                id="endOdometer"
                type="number"
                value={endOdometer}
                onChange={(e) => setEndOdometer(Number(e.target.value))}
                placeholder="Enter final odometer reading"
              />
            </div>
            <div>
              <Label htmlFor="actualReturnTime">Actual Return Time</Label>
              <Input
                id="actualReturnTime"
                type="datetime-local"
                value={actualReturnTime}
                onChange={(e) => setActualReturnTime(e.target.value)}
              />
            </div>
            <Button onClick={() => onComplete(endOdometer, actualReturnTime || undefined)}>
              <Square className="h-4 w-4 mr-2" />
              Complete Rental
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    if (type === "view") return "Booking Details";
    if (type === "verify") return "Verify Documents & Hand Over Car";
    if (type === "start") return "Start Rental";
    if (type === "complete") return "Complete Rental";
    return "Booking Details";
  };

  return (
    <>
      {/* Standalone dialog implementation */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'auto',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.95)'
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          onClick={onClose}
          style={{ pointerEvents: 'auto' }}
        />

        {/* Dialog Content */}
        <div
          className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-4 flex flex-col overflow-hidden border border-slate-700/50"
          style={{
            zIndex: 10000,
            pointerEvents: 'auto',
            position: 'relative',
            maxHeight: '95vh',
            height: '95vh',
            width: '90%',
            maxWidth: '60rem'
          }}
        >
          {/* Header - Fixed */}
          <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <h2 className="text-xl font-semibold dark:text-white">{getModalTitle()}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content */}
          <div
            className="overflow-y-auto p-6 bg-black [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ flex: '1 1 auto', minHeight: 0 }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}

// Document Viewer Component
function DocumentViewer({ title, fileUrl, fileName }: { title: string; fileUrl?: string; fileName: string }) {
  const { token } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const getFullFileUrl = (url?: string) => {
    if (!url) return null;

    // If it's already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Normalize the URL by removing leading/trailing whitespace
    const normalizedUrl = url.trim();

    // If it already contains 'uploads' (either /uploads/ or uploads/), 
    // just prepend the API base URL
    if (normalizedUrl.includes('uploads')) {
      // Ensure it starts with / for proper URL construction
      const path = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
      return `${getApiBaseUrl()}${path}`;
    }

    // If it starts with /, it's already a path, just prepend API base URL
    if (normalizedUrl.startsWith('/')) {
      return `${getApiBaseUrl()}${normalizedUrl}`;
    }

    // Otherwise, it's just a filename, add /uploads/
    return `${getApiBaseUrl()}/uploads/${normalizedUrl}`;
  };

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (['pdf'].includes(extension || '')) {
      return 'pdf';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return 'document';
    }
    return 'unknown';
  };

  const handleView = () => {
    const fullUrl = getFullFileUrl(fileUrl);
    if (!fullUrl) return;

    // Try to open in new tab
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    const fullUrl = getFullFileUrl(fileUrl);
    if (!fullUrl) return;

    setIsDownloading(true);
    try {
      // Fetch the file with proper headers
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Get the blob
      const blob = await response.blob();

      // Create a blob URL and download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;

      // Extract filename from URL or use provided fileName
      const urlParts = fullUrl.split('/');
      const urlFileName = urlParts[urlParts.length - 1];
      const fileExtension = urlFileName.split('.').pop() || 'file';
      link.download = `${fileName}-${Date.now()}.${fileExtension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file. Trying direct download...');

      // Fallback: try direct download
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = `${fileName}.${fullUrl.split('.').pop() || 'file'}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  const fullFileUrl = getFullFileUrl(fileUrl);
  const fileType = fullFileUrl ? getFileType(fullFileUrl) : 'unknown';

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm text-white">{title}</h4>
      <div className="border border-slate-700 rounded-lg p-3 bg-slate-800">
        {fullFileUrl ? (
          <div className="space-y-3">
            {fileType === 'image' && !imageError ? (
              <div className="relative">
                <img
                  src={fullFileUrl}
                  alt={title}
                  className="w-full h-40 object-contain rounded border border-slate-600 bg-slate-900"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setIsLoading(false);
                  }}
                  crossOrigin="anonymous"
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 rounded">
                    <div className="text-sm text-gray-400">Loading...</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-40 flex items-center justify-center bg-slate-900 rounded border border-slate-600">
                {isLoading ? (
                  <div className="text-sm text-gray-400">Loading...</div>
                ) : fileType === 'pdf' ? (
                  <div className="text-center">
                    <FileText className="h-10 w-10 text-red-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">PDF Document</p>
                  </div>
                ) : fileType === 'document' ? (
                  <div className="text-center">
                    <FileText className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Document</p>
                  </div>
                ) : imageError ? (
                  <div className="text-center">
                    <FileText className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Unable to load image</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">File</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                onClick={handleView}
                disabled={isLoading}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                onClick={handleDownload}
                disabled={isLoading || isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Clock className="h-4 w-4 mr-1 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-1" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No file uploaded</p>
          </div>
        )}
      </div>
    </div>
  );
}
