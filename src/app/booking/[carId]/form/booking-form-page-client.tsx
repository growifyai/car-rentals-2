"use client";

import { useRouter } from "next/navigation";

import type { CarDetailData } from "@/types/cars";

import { BookingForm } from "../booking-form";

interface BookingFormPageClientProps {
  car: CarDetailData;
  initialWithDriver?: boolean;
}

export function BookingFormPageClient({ car, initialWithDriver = false }: BookingFormPageClientProps) {
  const router = useRouter();

  const handleBookingSuccess = (bookingId: string) => {
    // Redirect to booking detail page after successful booking
    router.push(`/bookings/${bookingId}`);
  };

  return (
    <BookingForm 
      car={car} 
      onBookingSuccess={handleBookingSuccess} 
      initialWithDriver={initialWithDriver} 
    />
  );
}

