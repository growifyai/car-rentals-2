import type { ApiBookingSummary } from "@/types/api";
import type { BookingSummary } from "@/types/bookings";

import { apiFetch } from "./api-client";
import { calculateDeposit, mapApiCarToCard } from "./cars";

interface AdminStatsResponse {
  stats: {
    totalCars: number;
    availableCars: number;
    totalBookings: number;
    activeBookings: number;
    pendingBookings: number;
    completedBookings: number;
    totalRevenue: number;
  };
}

interface AdminBookingsResponse {
  bookings: ApiBookingSummary[];
}

const statusLabels: Record<string, string> = {
  advance_paid: "Advance Paid",
  verified: "Verified",
  rejected: "Rejected",
  active: "Active",
  completed: "Completed",
  // Legacy statuses for backward compatibility
  pending: "Pending review",
  accepted: "Accepted",
  payment_pending: "Awaiting payment",
  paid: "Paid",
  declined: "Declined",
  cancelled: "Cancelled",
};

function mapAdminBooking(apiBooking: ApiBookingSummary): BookingSummary {
  const summary = mapApiCarToCard(apiBooking.carId);
  const depositAmount = calculateDeposit(apiBooking.carId.type);

  // Calculate fallback price based on duration using the pricing structure
  let fallbackPrice = summary.pricing.price12hr;
  if (apiBooking.duration >= 72) {
    fallbackPrice = summary.pricing.price72hr;
  } else if (apiBooking.duration >= 60) {
    fallbackPrice = summary.pricing.price60hr;
  } else if (apiBooking.duration >= 48) {
    fallbackPrice = summary.pricing.price48hr;
  } else if (apiBooking.duration >= 24) {
    fallbackPrice = summary.pricing.price24hr;
  }

  const totalPrice = apiBooking.totalPrice ?? fallbackPrice;

  return {
    id: apiBooking._id,
    carName: apiBooking.carId.name,
    carType: apiBooking.carId.type,
    carImage: apiBooking.carId.imageUrl,
    duration: apiBooking.duration,
    startTime: apiBooking.startTime,
    endTime: apiBooking.endTime,
    totalPrice,
    depositAmount,
    status: apiBooking.status,
    paymentStatus: apiBooking.paymentStatus,
    createdAt: apiBooking.createdAt,
  };
}

export async function fetchAdminStats(token: string) {
  const data = await apiFetch<AdminStatsResponse>("/api/admin/stats", { token });
  return data.stats;
}

export async function fetchAdminBookings(token: string, status?: string) {
  const query = status ? `?status=${status}` : "";
  const data = await apiFetch<AdminBookingsResponse>(`/api/bookings${query}`, { token });
  return data.bookings.map(mapAdminBooking).map((booking) => ({
    ...booking,
    statusLabel: statusLabels[booking.status] ?? booking.status,
  }));
}

export async function verifyBooking(
  bookingId: string,
  action: "accept" | "reject",
  token: string,
  rejectionReason?: string,
  adminNotes?: string,
) {
  return apiFetch<{ message: string }>(`/api/bookings/${bookingId}/verify`, {
    method: "PUT",
    json: { action, rejectionReason, adminNotes },
    token,
  });
}

// Legacy function for backward compatibility
export async function reviewBooking(
  bookingId: string,
  action: "accept" | "decline",
  token: string,
  adminNotes?: string,
) {
  // Map old actions to new ones
  const newAction = action === "accept" ? "accept" : "reject";
  return verifyBooking(bookingId, newAction, token, action === "decline" ? adminNotes : undefined, adminNotes);
}

export async function startBooking(
  bookingId: string,
  payload: { vehicleName: string; vehicleNumber: string; startOdometer: number },
  token: string,
) {
  return apiFetch<{ message: string }>(`/api/bookings/${bookingId}/start`, {
    method: "PUT",
    json: payload,
    token,
  });
}

export async function completeBooking(
  bookingId: string,
  payload: { endOdometer: number; actualReturnTime?: string },
  token: string,
) {
  return apiFetch<{ message: string }>(`/api/bookings/${bookingId}/complete`, {
    method: "PUT",
    json: payload,
    token,
  });
}

// Admin Booking types for offline walk-in customers
export interface AdminBookingData {
  _id: string;
  customerName: string;
  customerMobile: string;
  carId: {
    _id: string;
    carName: string;
    model?: string;
    brand?: string;
    type?: string;
    imageUrl?: string;
  };
  startTime: string;
  endTime: string;
  amount?: number;
  notes?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface AdminOfflineBookingsResponse {
  bookings: AdminBookingData[];
}

// Fetch all admin bookings (offline walk-in customers)
export async function fetchAdminOfflineBookings(token: string): Promise<AdminBookingData[]> {
  const data = await apiFetch<AdminOfflineBookingsResponse>("/api/admin/bookings/offline", { token });
  return data.bookings || [];
}

// Create admin booking
export async function createAdminBooking(
  payload: {
    customerName: string;
    customerMobile: string;
    carId: string;
    startTime: string;
    endTime: string;
    amount?: number;
    notes?: string;
  },
  token: string,
): Promise<{ message: string; booking: AdminBookingData }> {
  return apiFetch<{ message: string; booking: AdminBookingData }>("/api/admin/bookings", {
    method: "POST",
    json: payload,
    token,
  });
}

// Delete admin booking
export async function deleteAdminBooking(bookingId: string, token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/bookings/offline/${bookingId}`, {
    method: "DELETE",
    token,
  });
}

