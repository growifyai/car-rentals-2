import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { fetchCarById } from "@/lib/cars";
import type { CarDetailData } from "@/types/cars";

import { BookingFormPageClient } from "./booking-form-page-client";

interface BookingFormPageProps {
  params: {
    carId: string;
  };
  searchParams: {
    driver?: string;
  };
}

export async function generateMetadata({ params }: BookingFormPageProps) {
  let title = "Complete Booking | Zion Car Rentals";
  let description = "Fill out the booking form to reserve your car.";

  try {
    const car = await fetchCarById(params.carId);
    title = `Complete Booking - ${car.name} | Zion Car Rentals`;
    description = `Complete your booking for ${car.name}.`;
  } catch (error) {
    // swallow
  }

  return {
    title,
    description,
  };
}

export default async function BookingFormPage({ params, searchParams }: BookingFormPageProps) {
  const { carId } = params;
  let car: CarDetailData | undefined;

  try {
    car = await fetchCarById(carId);
  } catch (error) {
    console.error("Failed to fetch car", error);
  }

  if (!car) {
    notFound();
  }

  const withDriver = searchParams.driver === "true";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto space-y-8 px-4 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Complete Your Booking</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Fill out the form below to reserve your car
            </p>
          </div>
          <BookingFormPageClient car={car} initialWithDriver={withDriver} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

