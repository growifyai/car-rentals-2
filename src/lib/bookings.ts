import type { ApiBookingSummary, ApiCar, ApiUser } from "@/types/api";
import type { BookingSummary, BookingDetail } from "@/types/bookings";

import { apiFetch } from "./api-client";
import { calculateDeposit, mapApiCarToCard } from "./cars";
import { getApiBaseUrl } from "./env";

function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  // If already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // If relative path starting with /, prepend backend base URL
  if (url.startsWith('/')) {
    return `${getApiBaseUrl()}${url}`;
  }
  // Otherwise, assume it's a relative path and prepend backend URL with /uploads
  return `${getApiBaseUrl()}/${url}`;
}

interface CreateBookingResponse {
  message: string;
  booking: {
    _id?: string;
    id?: string;
  };
}

interface MyBookingsResponse {
  bookings: (ApiBookingSummary | {
    _id: string;
    carId: ApiCar | string | null;
    customerId: ApiUser;
    status: string;
    startTime: string;
    endTime: string;
    duration: number;
    totalPrice: number;
    paymentStatus: string;
    createdAt?: string;
    updatedAt?: string;
  })[];
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

export async function createBooking(formData: FormData, token: string) {
  return apiFetch<CreateBookingResponse>("/api/bookings", {
    method: "POST",
    body: formData,
    token,
    isFormData: true,
  });
}

function mapBookingSummary(apiBooking: ApiBookingSummary): BookingSummary {
  // Add null checks for carId
  if (!apiBooking.carId) {
    throw new Error("Booking data is missing car information");
  }

  // Handle case where carId might be null or incomplete
  if (!apiBooking.carId._id) {
    console.warn("Car ID is missing in booking data:", apiBooking);
    throw new Error("Invalid car data in booking");
  }

  const car = mapApiCarToCard(apiBooking.carId);
  const carType = apiBooking.carId.type || "normal";
  const depositAmount = calculateDeposit(carType);
  const totalPrice = apiBooking.totalPrice ?? (car.pricePerHour ? car.pricePerHour * apiBooking.duration : 0);

  return {
    id: apiBooking._id || "",
    carName: car.name || "Unknown Car",
    carType: car.type || carType,
    carImage: car.imageUrl,
    duration: apiBooking.duration || 0,
    startTime: apiBooking.startTime || new Date().toISOString(),
    endTime: apiBooking.endTime || new Date().toISOString(),
    totalPrice: totalPrice || 0,
    depositAmount: depositAmount || 0,
    status: apiBooking.status || "pending",
    paymentStatus: apiBooking.paymentStatus || "pending",
    createdAt: apiBooking.createdAt,
    // razorpayOrderId: apiBooking.razorpayOrderId, // Property does not exist on ApiBookingSummary
  };
}

export async function fetchMyBookings(token: string): Promise<BookingSummary[]> {
  try {
    const data = await apiFetch<MyBookingsResponse>("/api/bookings/my-bookings", { token });
    
    console.log("API Response:", data);
    
    if (!data) {
      console.error("No data received from API");
      return [];
    }

    if (!data.bookings) {
      console.error("Invalid response structure - missing bookings array:", data);
      return [];
    }

    if (!Array.isArray(data.bookings)) {
      console.error("Bookings is not an array:", data.bookings);
      return [];
    }

    console.log(`Received ${data.bookings.length} bookings from API`);
    console.log("Raw bookings data sample:", data.bookings[0]);
    
    // Log status distribution
    const statusCounts = data.bookings.reduce((acc: Record<string, number>, booking: any) => {
      const status = booking.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    console.log("Booking status distribution:", statusCounts);
    
    // Log carId types to debug population issues
    const carIdTypes = data.bookings.reduce((acc: Record<string, number>, booking: any) => {
      const type = booking.carId ? (typeof booking.carId) : "null/undefined";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    console.log("CarId type distribution:", carIdTypes);

    // Process ALL bookings - don't filter by status or missing data
    // Show all bookings regardless of status (pending, cancelled, completed, etc.)
    console.log(`Processing ALL ${data.bookings.length} bookings from API (including cancelled, declined, etc.)`);

    // Process ALL bookings - show everything regardless of status
    const processedBookings = data.bookings.map((booking) => {
      if (!booking || !booking._id) {
        console.warn("Skipping invalid booking (missing _id):", booking);
        return null;
      }
      
      // Log each booking status to ensure we're processing all
      console.log(`Processing booking ${booking._id} with status: ${booking.status}`);

      try {
        // Handle case where carId might not be populated or is a string
        if (!booking.carId) {
          console.warn("Booking has no carId, creating fallback:", booking._id);
          return {
            id: booking._id,
            carName: "Car Information Unavailable",
            carType: "normal",
            carImage: undefined,
            duration: booking.duration || 0,
            startTime: booking.startTime || new Date().toISOString(),
            endTime: booking.endTime || new Date().toISOString(),
            totalPrice: booking.totalPrice || 0,
            depositAmount: calculateDeposit("normal"),
            status: booking.status || "pending",
            paymentStatus: booking.paymentStatus || "pending",
            createdAt: booking.createdAt,
          };
        }

        // If carId is a string (not populated), we need to handle it differently
        if (typeof booking.carId === 'string') {
          console.warn("Booking carId is not populated (string), creating fallback:", booking._id);
          return {
            id: booking._id,
            carName: "Car Information Unavailable",
            carType: "normal",
            carImage: undefined,
            duration: booking.duration || 0,
            startTime: booking.startTime || new Date().toISOString(),
            endTime: booking.endTime || new Date().toISOString(),
            totalPrice: booking.totalPrice || 0,
            depositAmount: calculateDeposit("normal"),
            status: booking.status || "pending",
            paymentStatus: booking.paymentStatus || "pending",
            createdAt: booking.createdAt,
          };
        }

        // If carId is an object but missing _id, try to use what we have
        if (typeof booking.carId === 'object' && !booking.carId._id) {
          console.warn("Booking carId object is incomplete, using available data:", booking._id, booking.carId);
          // Try to create a valid ApiCar object from what we have
          // Use a generated ID or the booking's carId reference if available
          const carIdValue = (booking.carId as any)._id || (booking as any).carId?.toString() || "unknown";
          const partialCar: ApiCar = {
            _id: carIdValue,
            name: (booking.carId as any).name || (booking.carId as any).carName || "Unknown Car",
            carName: (booking.carId as any).carName || (booking.carId as any).name,
            model: (booking.carId as any).model || "",
            brand: (booking.carId as any).brand || "",
            year: (booking.carId as any).year || new Date().getFullYear(),
            type: (booking.carId as any).type || "normal",
            gearType: (booking.carId as any).gearType || "manual",
            fuelType: (booking.carId as any).fuelType || "petrol",
            seatingCapacity: (booking.carId as any).seatingCapacity || 5,
            pricing: (booking.carId as any).pricing || {
              price12hr: 0,
              price24hr: 0,
              price36hr: 0,
              price48hr: 0,
              price60hr: 0,
              price72hr: 0,
            },
            securityDeposit: (booking.carId as any).securityDeposit || calculateDeposit((booking.carId as any).type || "normal"),
            driverAvailable: (booking.carId as any).driverAvailable || false,
            driverChargesPerDay: (booking.carId as any).driverChargesPerDay || 0,
            features: (booking.carId as any).features || [],
            imageUrl: (booking.carId as any).imageUrl,
            available: (booking.carId as any).available !== undefined ? (booking.carId as any).available : true,
          };
          
          const apiBookingWithCar: ApiBookingSummary = {
            _id: booking._id,
            carId: partialCar,
            customerId: booking.customerId,
            status: booking.status as ApiBookingSummary['status'],
            startTime: booking.startTime,
            endTime: booking.endTime,
            duration: booking.duration,
            totalPrice: booking.totalPrice,
            paymentStatus: booking.paymentStatus as ApiBookingSummary['paymentStatus'],
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
          };
          
          return mapBookingSummary(apiBookingWithCar);
        }

        // Normal case - carId is properly populated
        // Type guard to ensure booking is ApiBookingSummary
        if (typeof booking.carId === 'object' && booking.carId !== null && booking.carId._id) {
          return mapBookingSummary(booking as ApiBookingSummary);
        }
        // Fallback if somehow carId is still invalid
        throw new Error("Invalid car data in booking");
      } catch (error: any) {
        console.error("Error mapping booking:", error, booking);
        // Return a fallback booking summary instead of filtering out
        const carId = booking.carId as any;
        return {
          id: booking._id || "",
          carName: carId?.name || carId?.carName || "Unknown Car",
          carType: carId?.type || "normal",
          carImage: carId?.imageUrl,
          duration: booking.duration || 0,
          startTime: booking.startTime || new Date().toISOString(),
          endTime: booking.endTime || new Date().toISOString(),
          totalPrice: booking.totalPrice || 0,
          depositAmount: calculateDeposit(carId?.type || "normal"),
          status: booking.status || "pending",
          paymentStatus: booking.paymentStatus || "pending",
          createdAt: booking.createdAt,
        };
      }
    }).filter((booking): booking is BookingSummary => booking !== null); // Only filter out nulls, keep all valid bookings
    
    console.log(`Successfully processed ${processedBookings.length} bookings out of ${data.bookings.length} total`);
    console.log("Final booking statuses:", processedBookings.map(b => ({ id: b.id, status: b.status })));
    
    return processedBookings;
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
}

export async function fetchBookingDetail(bookingId: string, token: string): Promise<BookingDetail> {
  if (!bookingId || !token) {
    throw new Error("Booking ID and token are required");
  }

  // Try the main endpoint first
  let response: any;
  try {
    response = await apiFetch<any>(`/api/bookings/${bookingId}`, { token });
  } catch (error: any) {
    console.error("Error fetching booking detail:", error);
    // If 404 or 403, the booking might not exist or user doesn't have access
    if (error?.status === 404) {
      throw new Error("Booking not found. It may have been deleted or you don't have access to it.");
    } else if (error?.status === 403) {
      throw new Error("You don't have permission to view this booking.");
    } else if (error?.status === 401) {
      throw new Error("Please login again to view booking details.");
    }
    throw error;
  }
  
  // Handle both response formats: { booking: {...} } or direct booking object
  const bookingData = response.booking || response;
  
  console.log("Booking detail response:", bookingData);
  
  if (!bookingData || !bookingData._id) {
    console.error("Invalid booking data - missing _id:", bookingData);
    throw new Error("Invalid response from server: booking data is missing");
  }

  // Check if carId exists and is properly populated
  if (!bookingData.carId) {
    console.error("Booking data missing carId:", bookingData);
    throw new Error("Invalid booking data: car information is missing. The car may have been deleted.");
  }

  // If carId is a string/ObjectId (not populated), we need to fetch it separately
  if (typeof bookingData.carId === 'string') {
    console.warn("carId is not populated (string), attempting to handle):", bookingData.carId);
    throw new Error("Car information is not available. Please contact support.");
  }

  // If carId is an object but missing _id, it's incomplete
  if (typeof bookingData.carId === 'object' && !bookingData.carId._id) {
    console.error("carId object is incomplete:", bookingData.carId);
    throw new Error("Car information is incomplete. The car may have been deleted.");
  }

  try {
    // Ensure carId is properly formatted for mapping
    const apiBooking: ApiBookingSummary = {
      _id: bookingData._id,
      carId: bookingData.carId,
      customerId: bookingData.customerId || { _id: "", name: "", email: "", mobile: "", role: "customer" },
      status: bookingData.status,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      duration: bookingData.duration,
      totalPrice: bookingData.totalPrice,
      paymentStatus: bookingData.paymentStatus || "pending",
      createdAt: bookingData.createdAt,
      updatedAt: bookingData.updatedAt,
    };

    const summary = mapBookingSummary(apiBooking);
    const references = [
      bookingData.reference1Name && bookingData.reference1Mobile
        ? { name: bookingData.reference1Name, mobile: bookingData.reference1Mobile }
        : null,
      bookingData.reference2Name && bookingData.reference2Mobile
        ? { name: bookingData.reference2Name, mobile: bookingData.reference2Mobile }
        : null,
    ].filter(Boolean) as Array<{ name: string; mobile: string }>;

    return {
      ...summary,
      fullName: bookingData.fullName || "",
      guardianName: bookingData.guardianName || "",
      guardianRelation: bookingData.guardianRelation || "",
      residentialAddress: bookingData.residentialAddress || "",
      email: bookingData.email || "",
      mobile: bookingData.mobile || "",
      occupation: bookingData.occupation || "",
      references,
      depositType: bookingData.depositType || "cash",
      bikeDetails: bookingData.bikeDetails || null,
      homeDelivery: bookingData.homeDelivery ?? false,
      deliveryAddress: bookingData.deliveryAddress || null,
      deliveryDistance: bookingData.deliveryDistance || null,
      drivingLicenseImage: normalizeImageUrl(bookingData.drivingLicenseImage),
      aadharCardImage: normalizeImageUrl(bookingData.aadharCardImage),
      livePhoto: normalizeImageUrl(bookingData.livePhoto),
    };
  } catch (mappingError: any) {
    console.error("Error mapping booking data:", mappingError);
    console.error("Booking data received:", bookingData);
    throw new Error(`Failed to process booking data: ${mappingError?.message || "Unknown error"}`);
  }
}
