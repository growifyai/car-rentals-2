"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Car, 
  IndianRupee, 
  Image as ImageIcon,
  Trash2,
  Settings,
  Users,
  Fuel,
  Shield,
  User
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { AddCarDialog } from "./add-car-dialog";
import { EditCarDialog } from "./edit-car-dialog";

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
  advanceAmount?: number;
  driverAvailable?: boolean;
  driverChargesPerDay?: number;
  description?: string;
  features: string[];
  imageUrl?: string;
  images?: string[];
  registrationNumber?: string;
  available: boolean;
  createdAt: string;
}

export function AdminCarsManagement() {
  const { token } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCars = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch<{ cars: Car[] }>("/api/cars", { token });
      setCars(response.cars);
    } catch (err) {
      console.error("Failed to load cars:", err);
      setError("Unable to load cars");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const handleCarAdded = () => {
    loadCars();
  };

  const handleCarUpdated = () => {
    loadCars();
  };

  const handleDeleteCar = async (carId: string) => {
    if (!confirm("Are you sure you want to delete this car? This action cannot be undone.")) {
      return;
    }

    try {
      await apiFetch(`/api/cars/${carId}`, {
        method: "DELETE",
        token,
      });
      loadCars();
    } catch (err) {
      console.error("Failed to delete car:", err);
      setError("Failed to delete car");
    }
  };

  const getTypeColor = (type: string) => {
    return type === "premium" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";
  };

  // Helper functions to handle both old and new pricing formats
  const getPrice24hr = (car: Car) => {
    return car.pricing?.price24hr || car.price24Hours || (car.pricePerHour ? car.pricePerHour * 24 : 0);
  };

  const getPrice12hr = (car: Car) => {
    return car.pricing?.price12hr || car.price12Hours || (car.pricePerHour ? car.pricePerHour * 12 : 0);
  };

  const getPrice48hr = (car: Car) => {
    return car.pricing?.price48hr || (car.pricePerHour ? car.pricePerHour * 48 : 0);
  };

  const getSecurityDeposit = (car: Car) => {
    return car.securityDeposit || 0;
  };

  const getDriverAvailable = (car: Car) => {
    return car.driverAvailable || false;
  };

  const getDriverChargesPerDay = (car: Car) => {
    return car.driverChargesPerDay || 0;
  };


  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cars Management</h1>
          <p className="text-muted-foreground">
            Manage your fleet of rental cars, add new vehicles, and update existing ones.
          </p>
        </div>
        <div className="flex space-x-2">
          <AddCarDialog onCarAdded={handleCarAdded} />
        </div>
      </div>

      {/* Cars Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Card key={car._id} className="overflow-hidden border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
                    {car.carName || car.name || "Unknown Car"}
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                    {car.brand || "Unknown Brand"} {car.model || "Unknown Model"} • {car.year || "Unknown Year"}
                  </p>
                </div>
                <div className="flex flex-col space-y-1.5 shrink-0">
                  <Badge className={`${getTypeColor(car.type)} text-xs px-2 py-0.5`}>
                    {car.type}
                  </Badge>
                  <Badge 
                    variant={car.available ? "default" : "secondary"} 
                    className={`text-xs px-2 py-0.5 ${car.available ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : ""}`}
                  >
                    {car.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Pricing Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2 mb-4">
                  <IndianRupee className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">Pricing</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <span className="text-sm text-slate-700 dark:text-slate-300">12 Hours</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">₹{getPrice12hr(car).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <span className="text-sm text-slate-700 dark:text-slate-300">24 Hours</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">₹{getPrice24hr(car).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <span className="text-sm text-slate-700 dark:text-slate-300">48 Hours</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">₹{getPrice48hr(car).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">Specifications</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                      <Settings className="h-3.5 w-3.5" />
                      <span>Transmission</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white capitalize ml-5">{car.gearType || "Manual"}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                      <Fuel className="h-3.5 w-3.5" />
                      <span>Fuel Type</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white capitalize ml-5">{car.fuelType || "Petrol"}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                      <Users className="h-3.5 w-3.5" />
                      <span>Seating</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white ml-5">{car.seatingCapacity || 5} seats</p>
                  </div>
                  {getSecurityDeposit(car) > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                        <Shield className="h-3.5 w-3.5" />
                        <span>Deposit</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white ml-5">₹{getSecurityDeposit(car).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {getDriverAvailable(car) && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                        <User className="h-3.5 w-3.5" />
                        <span>Driver Available</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white ml-5">₹{getDriverChargesPerDay(car).toLocaleString()}/day</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {car.description && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Description</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {car.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {car.features.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {car.features.slice(0, 4).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-2 py-1">
                        {feature}
                      </Badge>
                    ))}
                    {car.features.length > 4 && (
                      <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-2 py-1">
                        +{car.features.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <EditCarDialog car={car} onCarUpdated={handleCarUpdated} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCar(car._id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 dark:hover:text-red-300 border-red-200 dark:border-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cars.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cars found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first rental car to the fleet.
            </p>
            <AddCarDialog onCarAdded={handleCarAdded} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
