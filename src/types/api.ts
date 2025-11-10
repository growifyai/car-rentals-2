export type UserRole = "customer" | "admin";

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  createdAt?: string;
}

export interface ApiCar {
  _id: string;
  name: string;
  carName?: string; // Legacy field
  model: string;
  brand: string;
  year: number;
  type: "normal" | "premium" | "luxury";
  gearType: "auto" | "manual";
  fuelType: "petrol" | "diesel" | "cng" | "hybrid" | "ev";
  seatingCapacity: number;
  pricing: {
    price12hr: number;
    price24hr: number;
    price36hr: number;
    price48hr: number;
    price60hr: number;
    price72hr: number;
  };
  securityDeposit: number;
  driverAvailable: boolean;
  driverChargesPerDay: number;
  description?: string;
  features: string[];
  imageUrl?: string;
  registrationNumber?: string;
  available: boolean;
  createdAt?: string;
  // Legacy fields for backward compatibility
  pricePerHour?: number;
}

export interface ApiBookingSummary {
  _id: string;
  carId: ApiCar;
  customerId: ApiUser;
  status:
    | "pending"
    | "accepted"
    | "declined"
    | "payment_pending"
    | "paid"
    | "active"
    | "completed"
    | "cancelled";
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  createdAt?: string;
  updatedAt?: string;
}

