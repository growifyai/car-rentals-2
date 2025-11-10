export type BookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "payment_pending"
  | "paid"
  | "active"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface BookingSummary {
  id: string;
  carName: string;
  carType: string;
  carImage?: string;
  duration: number;
  startTime: string;
  endTime: string;
  totalPrice: number;
  depositAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt?: string;
  razorpayOrderId?: string;
}

export interface BookingDetail extends BookingSummary {
  fullName?: string;
  guardianName?: string;
  guardianRelation?: string;
  residentialAddress?: string;
  email?: string;
  mobile?: string;
  occupation?: string;
  references?: Array<{ name: string; mobile: string }>;
  depositType?: string;
  bikeDetails?: string | null;
  homeDelivery?: boolean;
  deliveryAddress?: string | null;
  deliveryDistance?: number | null;
  drivingLicenseImage?: string;
  aadharCardImage?: string;
  livePhoto?: string;
}

