import type { ApiBookingSummary } from "@/types/api";
import type { BookingSummary, BookingDetail } from "@/types/bookings";

import { apiFetch } from "./api-client";
import { calculateDeposit, mapApiCarToCard } from "./cars";

interface CreateBookingResponse {
  message: string;
  booking: unknown;
}

interface MyBookingsResponse {
  bookings: ApiBookingSummary[];
}

interface BookingDetailResponse {
  booking: ApiBookingSummary & {
    fullName?: string;
    guardianName?: string;
    guardianRelation?: string;
    residentialAddress?: string;
    email?: string;
    mobile?: string;
    occupation?: string;
    reference1Name?: string;
    reference1Mobile?: string;
    reference2Name?: string;
    reference2Mobile?: string;
    depositType?: string;
    bikeDetails?: string | null;
    homeDelivery?: boolean;
    deliveryAddress?: string | null;
    deliveryDistance?: number | null;
    drivingLicenseImage?: string;
    aadharCardImage?: string;
    livePhoto?: string;
  };
}

interface CreateOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
  bookingDetails: {
    amount: number;
    carName: string;
    duration: number;
    depositAmount: number;
  };
  razorpayKeyId?: string;
}

interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
}

export async function createBooking(formData: FormData, token: string) {
  return apiFetch<CreateBookingResponse>("/api/bookings", {
    method: "POST",
    body: formData,
    token,
    isFormData: true,
  });
}

function mapBookingSummary(apiBooking: ApiBookingSummary): BookingSummary {
  const car = mapApiCarToCard(apiBooking.carId);
  const depositAmount = calculateDeposit(apiBooking.carId.type);
  const totalPrice = apiBooking.totalPrice ?? (car.pricePerHour ? car.pricePerHour * apiBooking.duration : 0);

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
    // razorpayOrderId: apiBooking.razorpayOrderId, // Property does not exist on ApiBookingSummary
  };
}

export async function fetchMyBookings(token: string): Promise<BookingSummary[]> {
  const data = await apiFetch<MyBookingsResponse>("/api/bookings/my-bookings", { token });
  return data.bookings.map(mapBookingSummary);
}

export async function fetchBookingDetail(bookingId: string, token: string): Promise<BookingDetail> {
  const data = await apiFetch<BookingDetailResponse>(`/api/bookings/${bookingId}`, { token });
  const summary = mapBookingSummary(data.booking);
  const references = [
    data.booking.reference1Name && data.booking.reference1Mobile
      ? { name: data.booking.reference1Name, mobile: data.booking.reference1Mobile }
      : null,
    data.booking.reference2Name && data.booking.reference2Mobile
      ? { name: data.booking.reference2Name, mobile: data.booking.reference2Mobile }
      : null,
  ].filter(Boolean) as Array<{ name: string; mobile: string }>;

  return {
    ...summary,
    fullName: data.booking.fullName,
    guardianName: data.booking.guardianName,
    guardianRelation: data.booking.guardianRelation,
    residentialAddress: data.booking.residentialAddress,
    email: data.booking.email,
    mobile: data.booking.mobile,
    occupation: data.booking.occupation,
    references,
    depositType: data.booking.depositType,
    bikeDetails: data.booking.bikeDetails,
    homeDelivery: data.booking.homeDelivery,
    deliveryAddress: data.booking.deliveryAddress,
    deliveryDistance: data.booking.deliveryDistance,
    drivingLicenseImage: data.booking.drivingLicenseImage,
    aadharCardImage: data.booking.aadharCardImage,
    livePhoto: data.booking.livePhoto,
  };
}

export async function createPaymentOrder(bookingId: string, token: string) {
  return apiFetch<CreateOrderResponse>("/api/payment/create-order", {
    method: "POST",
    json: { bookingId },
    token,
  });
}

export async function verifyPayment(payload: VerifyPaymentPayload, token: string) {
  return apiFetch<CreateBookingResponse>("/api/payment/verify", {
    method: "POST",
    json: payload,
    token,
  });
}
