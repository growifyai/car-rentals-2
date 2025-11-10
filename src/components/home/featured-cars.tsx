"use client";

import { useRouter } from "next/navigation";

import { CarCard } from "@/components/CarCard";
import type { CarCardData } from "@/types/cars";
import { Button } from "@/components/ui/button";

interface FeaturedCarsProps {
  cars: CarCardData[];
}

export function FeaturedCars({ cars }: FeaturedCarsProps) {
  const router = useRouter();

  if (!cars.length) {
    return null;
  }

  return (
    <section id="fleet" className="bg-background py-16">
      <div className="container mx-auto space-y-6 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Featured Cars</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Choose from our premium collection of luxury vehicles, each maintained to the highest standards for your comfort
            and safety.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onBookNow={(selected) => router.push(`/booking/${selected.id}`)}
            />
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button size="lg" variant="outline" onClick={() => router.push("/cars")}>View Full Fleet</Button>
        </div>
      </div>
    </section>
  );
}

