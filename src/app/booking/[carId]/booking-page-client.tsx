"use client";

import { useRouter } from "next/navigation";

import { CarDetail } from "@/components/CarDetail";
import type { CarDetailData } from "@/types/cars";

interface BookingPageClientProps {
  car: CarDetailData;
}

export function BookingPageClient({ car }: BookingPageClientProps) {
  const router = useRouter();

  const handleBookNow = (driverSelected: boolean) => {
    // Navigate to form page with driver selection as query param
    const params = new URLSearchParams();
    if (driverSelected) {
      params.set("driver", "true");
    }
    router.push(`/booking/${car.id}/form?${params.toString()}`);
  };

  return (
    <div>
      <CarDetail car={car} onBookNow={handleBookNow} />
    </div>
  );
}
