import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { fetchCarById } from "@/lib/cars";
import type { CarDetailData } from "@/types/cars";

import { BookingPageClient } from "./booking-page-client";

interface BookingPageProps {
  params: {
    carId: string;
  };
}

export async function generateMetadata({ params }: BookingPageProps) {
  let title = "Reserve your ride | Zion Car Rentals";
  let description = "Complete your Zion Car Rentals booking with secure forms and payments.";

  try {
    const car = await fetchCarById(params.carId);
    title = `${car.name} | Zion Booking`;
    description = car.description ?? description;
  } catch (error) {
    // swallow
  }

  return {
    title,
    description,
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto space-y-12 px-4 py-12">
          <BookingPageClient car={car} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

