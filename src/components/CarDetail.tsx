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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

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

  // Get all images: prefer images array, fall back to imageUrl, then placeholder
  const getAllImages = (): string[] => {
    const images: string[] = [];

    // First, use images array if available
    if (car.images && Array.isArray(car.images) && car.images.length > 0) {
      car.images.forEach(img => {
        if (isValidImageUrl(img)) {
          images.push(img);
        }
      });
    }

    // If no images from array, try imageUrl
    if (images.length === 0 && car.imageUrl && isValidImageUrl(car.imageUrl)) {
      images.push(car.imageUrl);
    }

    // If still no images, use placeholder
    if (images.length === 0) {
      images.push(PLACEHOLDER_IMAGE);
    }

    return images;
  };

  const carImages = getAllImages();

  const shouldUnoptimize = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === "res.cloudinary.com";
    } catch {
      return false;
    }
  };

  const handleBookNow = () => {
    if (onBookNow) {
      // Premium cars always include driver
      const driverSelected = car.type === "premium" ? true : withDriver;
      onBookNow(driverSelected);
    }
  };

  return (
    <section className="space-y-8">
      {/* Car Image Gallery */}
      <motion.div
        className="relative overflow-hidden rounded-3xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {carImages.length > 1 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {carImages.map((imageSrc, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[400px] lg:h-[500px]">
                    <Image
                      src={imageSrc}
                      alt={`${car.name} - Image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      priority={index === 0}
                      unoptimized={shouldUnoptimize(imageSrc)}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        ) : (
          <div className="relative h-[400px] lg:h-[500px]">
            <Image
              src={carImages[0]}
              alt={car.name}
              fill
              className="object-cover"
              priority
              unoptimized={shouldUnoptimize(carImages[0])}
            />
          </div>
        )}
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
                  {car.available ? "Check for availability" : "Currently unavailable"}
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
              {car.type === "premium" ? (
                // Premium cars: Driver is mandatory/included
                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <UserCheck className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-primary">Driver Included</p>
                    <p className="text-sm text-muted-foreground">
                      Premium cars come with a professional driver at no extra charge
                    </p>
                  </div>
                  <Badge variant="default" className="ml-auto bg-primary">
                    Included
                  </Badge>
                </div>
              ) : (
                // Normal cars: Driver is optional
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
              )}
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
              Need assistance? Contact us at Zioncarrentals90@gmail.com
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}