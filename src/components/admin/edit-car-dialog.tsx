"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarForm } from "./car-form";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";

interface Car {
  _id: string;
  carName?: string;
  name?: string; // Legacy field
  model: string;
  brand: string;
  year: number;
  type: "normal" | "premium" | "luxury";
  gearType: "auto" | "manual";
  fuelType: "petrol" | "diesel" | "cng" | "hybrid" | "ev";
  seatingCapacity: number;
  pricing?: {
    price12hr: number;
    price24hr: number;
    price36hr: number;
    price48hr: number;
    price60hr: number;
    price72hr: number;
  };
  // Legacy pricing fields for backward compatibility
  pricePerHour?: number;
  price12Hours?: number;
  price24Hours?: number;
  securityDeposit?: number;
  driverAvailable?: boolean;
  driverChargesPerDay?: number;
  description?: string;
  features: string[];
  imageUrl?: string;
  registrationNumber?: string;
  available: boolean;
  createdAt: string;
}

interface EditCarDialogProps {
  car: Car;
  onCarUpdated: () => void;
}

export function EditCarDialog({ car, onCarUpdated }: EditCarDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  // Transform legacy car data to new format for the form
  const transformCarData = (car: Car) => {
    return {
      ...car,
      carName: car.carName || car.name || "",
      pricing: car.pricing || {
        price12hr: car.price12Hours || (car.pricePerHour ? car.pricePerHour * 12 : 0),
        price24hr: car.price24Hours || (car.pricePerHour ? car.pricePerHour * 24 : 0),
        price36hr: car.pricePerHour ? car.pricePerHour * 36 : 0,
        price48hr: car.pricePerHour ? car.pricePerHour * 48 : 0,
        price60hr: car.pricePerHour ? car.pricePerHour * 60 : 0,
        price72hr: car.pricePerHour ? car.pricePerHour * 72 : 0,
      },
      securityDeposit: car.securityDeposit || 0,
      driverAvailable: car.driverAvailable || false,
      driverChargesPerDay: car.driverChargesPerDay || 0,
      gearType: car.gearType || "manual",
      fuelType: car.fuelType || "petrol",
      seatingCapacity: car.seatingCapacity || 5,
      features: car.features || [],
      description: car.description || "",
      imageUrl: car.imageUrl || "",
      registrationNumber: car.registrationNumber || "",
    };
  };

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      await apiFetch(`/api/cars/${car._id}`, {
        method: "PUT",
        token,
        json: formData,
      });
      
      setOpen(false);
      onCarUpdated();
    } catch (error) {
      console.error("Failed to update car:", error);
      throw error; // Re-throw to let CarForm handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
      
      {/* Standalone dialog implementation */}
      {open && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ 
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)'
          }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            onClick={() => setOpen(false)}
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Dialog Content */}
          <div 
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-4 flex flex-col overflow-hidden border border-slate-700/50"
            style={{ 
              zIndex: 10000,
              pointerEvents: 'auto',
              position: 'relative',
              maxHeight: '95vh',
              height: '95vh',
              width: '60%'
            }}
          >
            {/* Header - Fixed */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <h2 className="text-xl font-semibold dark:text-white">Edit Car - {car.carName || car.name || "Unknown Car"}</h2>
              <button 
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto p-6 bg-black [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              style={{ flex: '1 1 auto', minHeight: 0 }}
            >
              <CarForm
                initialData={transformCarData(car)}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
                submitLabel="Update Car"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
