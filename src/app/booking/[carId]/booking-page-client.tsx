"use client";

import { useState } from "react";

import { CarDetail } from "@/components/CarDetail";
import { BookingDetailClient } from "@/app/bookings/[id]/booking-detail-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CarDetailData } from "@/types/cars";

import { BookingForm } from "./booking-form";

interface BookingPageClientProps {
  car: CarDetailData;
}

type ModalState = "closed" | "form" | "summary";

export function BookingPageClient({ car }: BookingPageClientProps) {
  const [modalState, setModalState] = useState<ModalState>("closed");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [withDriver, setWithDriver] = useState(false);

  const handleBookNow = (driverSelected: boolean) => {
    setWithDriver(driverSelected);
    setModalState("form");
  };

  const handleBookingSuccess = (id: string) => {
    setBookingId(id);
    setModalState("summary");
  };

  const handleCloseModal = () => {
    setModalState("closed");
    if (modalState === "summary") {
      setBookingId(null);
    }
  };

  return (
    <>
      <CarDetail car={car} onBookNow={handleBookNow} />
      
      {modalState !== "closed" && (
        <Dialog open={true} onOpenChange={(open) => !open && handleCloseModal()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {modalState === "form" && (
              <>
                <DialogHeader>
                  <DialogTitle>Complete Your Booking</DialogTitle>
                </DialogHeader>
                <BookingForm car={car} onBookingSuccess={handleBookingSuccess} initialWithDriver={withDriver} />
              </>
            )}
            
            {modalState === "summary" && bookingId && (
              <>
                <DialogHeader>
                  <DialogTitle>Booking Summary</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <p className="text-muted-foreground mb-6">
                    Your booking has been submitted successfully. Review the details below.
                  </p>
                  <BookingDetailClient bookingId={bookingId} />
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

