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
  pending: "Pending review",
  accepted: "Accepted",
  payment_pending: "Awaiting payment",
  paid: "Paid",
  active: "Active",
  completed: "Completed",
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

export async function reviewBooking(
  bookingId: string,
  action: "accept" | "decline",
  token: string,
  adminNotes?: string,
) {
  return apiFetch<{ message: string }>(`/api/bookings/${bookingId}/review`, {
    method: "PUT",
    json: { action, adminNotes },
    token,
  });
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

