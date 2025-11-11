import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { fetchCars } from "@/lib/cars";

import { CarsClient } from "./cars-client";
import type { CarCardData } from "@/types/cars";

export const metadata = {
  title: "Our Fleet | Zion Car Rentals",
  description: "Browse and filter the complete Zion Car Rentals luxury car fleet.",
};

export const dynamic = "force-dynamic";

export default async function CarsPage() {
  let cars: CarCardData[] = [];

  try {
    const response = await fetchCars();
    if (response.length) {
      cars = response;
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to load cars", error);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <CarsClient cars={cars} />
      </main>
      <SiteFooter />
    </div>
  );
}

