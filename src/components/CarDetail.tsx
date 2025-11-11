"use client";

import Image from "next/image";

import { useState, useMemo } from "react";

import { IndianRupee, Shield, User, UserCheck, Settings, Fuel, Users, Calendar, FileText } from "lucide-react";
import { motion } from "motion/react";

import type { CarDetailData } from "@/types/cars";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

interface CarDetailProps {
  car: CarDetailData;
  onBookNow?: (withDriver: boolean) => void;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1080&q=80";

export function CarDetail({ car, onBookNow }: CarDetailProps) {
  const [withDriver, setWithDriver] = useState(false);
  const pricePerPeriod = useMemo(() => car.pricing.price12hr, [car.pricing.price12hr]);
  
  // Validate image URL - ensure it's a proper URL or use placeholder
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  };
  
  const getImageSrc = (): string => {
    if (car.imageUrl && isValidImageUrl(car.imageUrl)) {
      return car.imageUrl;
    }
    return PLACEHOLDER_IMAGE;
  };
  
  const imageSrc = getImageSrc();
  let shouldUnoptimize = false;
  try {
    const url = new URL(imageSrc);
    if (url.hostname === "res.cloudinary.com") {
      shouldUnoptimize = true;
    }
  } catch {
    // ignore
  }

  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow(withDriver);
    }
  };

  return (
    <section className="space-y-8">
      {/* Car Image */}
      <motion.div
        className="relative overflow-hidden rounded-3xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative h-[400px] lg:h-[500px]">
          <Image
            src={imageSrc}
            alt={car.name}
            fill
            className="object-cover"
            priority
            unoptimized={shouldUnoptimize}
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Pricing and Vehicle Description Side by Side */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pricing Section */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-2xl font-semibold">Pricing</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">12 Hours</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ₹{pricePerPeriod.toLocaleString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">24 Hours</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ₹{car.pricing.price24hr.toLocaleString()}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Security Deposit</span>
                </div>
                <p className="text-2xl font-bold">
                  ₹{car.depositAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Refundable upon return inspection</p>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Description */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Vehicle Description</h2>
                <Badge 
                  variant={car.available ? "default" : "secondary"}
                  className="bg-primary/90 text-primary-foreground text-sm px-4 py-1.5"
                >
                  {car.available ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {car.brand && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Brand</p>
                      <p className="text-foreground font-medium">{car.brand}</p>
                    </div>
                  )}
                  {car.model && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Model</p>
                      <p className="text-foreground font-medium">{car.model}</p>
                    </div>
                  )}
                  {car.year && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Year
                      </p>
                      <p className="text-foreground font-medium">{car.year}</p>
                    </div>
                  )}
                  {car.registrationNumber && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Registration
                      </p>
                      <p className="text-foreground font-medium">{car.registrationNumber}</p>
                    </div>
                  )}
                </div>
                
                {(car.gearType || car.fuelType || car.seatingCapacity) && (
                  <>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-3">
                      {car.gearType && (
                        <div className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Transmission</p>
                            <p className="text-sm font-medium capitalize">{car.gearType}</p>
                          </div>
                        </div>
                      )}
                      {car.fuelType && (
                        <div className="flex items-center gap-2">
                          <Fuel className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Fuel Type</p>
                            <p className="text-sm font-medium capitalize">{car.fuelType}</p>
                          </div>
                        </div>
                      )}
                      {car.seatingCapacity && (
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Seating</p>
                            <p className="text-sm font-medium">{car.seatingCapacity} seats</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {car.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {car.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Driver Option */}
        {car.driverAvailable && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">Driver Option</h2>
              <RadioGroup value={withDriver ? "with" : "without"} onValueChange={(value) => setWithDriver(value === "with")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="without" id="without" />
                  <Label htmlFor="without" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-5 w-5" />
                    <span>Without Driver</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="with" id="with" />
                  <Label htmlFor="with" className="flex items-center gap-2 cursor-pointer">
                    <UserCheck className="h-5 w-5" />
                    <span>With Driver</span>
                    <Badge variant="outline" className="ml-2">
                      +₹{car.driverChargesPerDay.toLocaleString()}/day
                    </Badge>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Book Now Button */}
        <Card>
          <CardContent className="p-6">
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleBookNow} 
              disabled={!car.available || !onBookNow}
            >
              {car.available ? "Book Now" : "Currently Unavailable"}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Need assistance? Contact us at support@zionrentals.com
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}