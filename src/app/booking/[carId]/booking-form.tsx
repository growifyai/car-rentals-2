"use client";

import { useMemo, useState, useEffect } from "react";
import * as React from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createBooking, createRazorpayOrder, verifyRazorpayPayment } from "@/lib/bookings";
import type { CarDetailData } from "@/types/cars";
import { getApiBaseUrl } from "@/lib/env";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  IndianRupee
} from "lucide-react";

const DURATIONS = [12, 24, 36, 48, 60, 72]; // Maximum 3 days (72 hours)
const GUARDIAN_RELATIONS: Array<{ label: string; value: "S/o" | "W/o" | "D/o" }> = [
  { label: "S/o (Son of)", value: "S/o" },
  { label: "W/o (Wife of)", value: "W/o" },
  { label: "D/o (Daughter of)", value: "D/o" },
];

type BookingFormValues = {
  startTime: string;
  duration: number;
  fullName: string;
  guardianName: string;
  guardianRelation: "S/o" | "W/o" | "D/o";
  residentialAddress: string;
  email: string;
  mobile: string;
  occupation: string;
  drivingLicenseNumber: string;
  licenseExpiryDate: string;
  depositType: "bike" | "cash";
  bikeDetails?: string;
  withDriver: boolean;
};

const defaultValues: Partial<BookingFormValues> = {
  duration: 12,
  guardianRelation: "S/o",
  depositType: "cash",
  withDriver: false,
};

interface BookingFormProps {
  car: CarDetailData;
  onBookingSuccess?: (bookingId: string) => void;
  initialWithDriver?: boolean;
}

// Custom validation functions
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMobile = (mobile: string) => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

const validateName = (name: string) => {
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(name) && name.length >= 2;
};

const validateLicenseNumber = (license: string) => {
  const licenseRegex = /^[A-Z0-9]+$/;
  return licenseRegex.test(license) && license.length >= 5;
};

const validateFutureDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

export function BookingForm({ car, onBookingSuccess, initialWithDriver = false }: BookingFormProps) {
  const form = useForm<BookingFormValues>({ 
    defaultValues: {
      ...defaultValues,
      withDriver: initialWithDriver,
    },
    mode: "onChange"
  });
  
  const { token, user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nonRefundableAccepted, setNonRefundableAccepted] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState<{ available: boolean; nextAvailableStartTime?: string; maxDurationHours?: number } | null>(null);

  const pricePerPeriod = useMemo(() => car.pricing.price12hr, [car.pricing.price12hr]);
  const depositAmount = useMemo(() => car.depositAmount, [car.depositAmount]);

  const duration = form.watch("duration") ?? 12;
  const withDriver = form.watch("withDriver");
  const depositType = form.watch("depositType");
  
  // Calculate base price based on duration using the pricing tiers
  let totalRental = 0;
  if (duration === 12) {
    totalRental = car.pricing.price12hr;
  } else if (duration === 24) {
    totalRental = car.pricing.price24hr;
  } else if (duration === 36) {
    totalRental = car.pricing.price36hr;
  } else if (duration === 48) {
    totalRental = car.pricing.price48hr;
  } else if (duration === 60) {
    totalRental = car.pricing.price60hr;
  } else if (duration === 72) {
    totalRental = car.pricing.price72hr;
  } else {
    // For durations beyond 72 hours, calculate based on 24hr rate
    const days = Math.ceil(duration / 24);
    totalRental = car.pricing.price24hr * days;
  }
  
  // Add driver charges if selected
  if (withDriver && car.driverAvailable) {
    const days = Math.ceil(duration / 24);
    totalRental += car.driverChargesPerDay * days;
  }

  const handleSubmit = async (values: BookingFormValues) => {
    if (!token) {
      toast.error("Please login to complete your booking");
      return router.push("/auth/login");
    }

    // Validate all fields since all steps are visible
    const errors: string[] = [];

    // Step 1 validations
    if (!values.startTime) errors.push("Start time is required");
    if (!validateFutureDate(values.startTime)) errors.push("Start time must be in the future");
    if (values.duration % 12 !== 0) errors.push("Duration must be in multiples of 12 hours");
    
    // Step 2 validations
    if (!validateName(values.fullName)) errors.push("Full name must be at least 2 characters and contain only letters");
    if (!validateName(values.guardianName)) errors.push("Guardian name must be at least 2 characters and contain only letters");
    if (!values.residentialAddress || values.residentialAddress.length < 10) errors.push("Residential address must be at least 10 characters");
    if (!validateEmail(values.email)) errors.push("Please enter a valid email address");
    if (!validateMobile(values.mobile)) errors.push("Please enter a valid 10-digit mobile number");
    if (!values.occupation || values.occupation.length < 2) errors.push("Occupation must be at least 2 characters");
    
    // Step 3 validations
    if (!validateLicenseNumber(values.drivingLicenseNumber)) errors.push("License number must be at least 5 characters and contain only uppercase letters and numbers");
    if (!values.licenseExpiryDate) errors.push("License expiry date is required");
    if (!validateFutureDate(values.licenseExpiryDate)) errors.push("License must not be expired");
    if (depositType === "bike" && (!values.bikeDetails || values.bikeDetails.length === 0)) errors.push("Two wheeler details are required when deposit type is two wheeler");

    // Step 4 validations
    if (!nonRefundableAccepted) {
      errors.push("Please accept the non-refundable terms before proceeding with payment");
    }

    if (!availabilityInfo?.available) {
      errors.push("Car is not available for the selected time. Please select a different time.");
    }

    if (errors.length > 0) {
      toast.error(errors[0]); // Show first error
      // Scroll to first error field if possible
      return;
    }

    // Final availability check before payment
    if (!availabilityInfo || !availabilityInfo.available) {
      toast.error("Car is not available for the selected time. Please check availability and try again.");
      return;
    }

      // Double-check availability with current values
      try {
        const finalCheck = await fetch(`${getApiBaseUrl()}/api/cars/${car.id}/check-availability`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            startTime: new Date(values.startTime).toISOString(),
            duration: values.duration
          })
        });

        const finalCheckData = await finalCheck.json();
        if (!finalCheckData.available) {
          toast.error(`Car is no longer available. Next available: ${finalCheckData.nextAvailableStartTime ? new Date(finalCheckData.nextAvailableStartTime).toLocaleString() : 'N/A'}`);
          setAvailabilityInfo(finalCheckData);
          return;
        }
      } catch (error) {
        console.error('Final availability check error:', error);
        toast.error('Failed to verify availability. Please try again.');
        return;
      }

      setIsSubmitting(true);
      try {
        // Step 1: Create Razorpay order
        const advanceAmount = car.advanceAmount || 500;
        const orderResponse = await createRazorpayOrder(
          car.id,
          new Date(values.startTime).toISOString(),
          values.duration,
          advanceAmount,
          token
        );

        if (!orderResponse.success || !orderResponse.orderId) {
          throw new Error("Failed to create payment order. Please try again.");
        }

        // Step 2: Open Razorpay checkout
        const options = {
          key: orderResponse.keyId,
          amount: orderResponse.amount,
          currency: orderResponse.currency,
          name: "Zion Car Rentals",
          description: `Advance payment for ${car.name || 'car rental'}`,
          order_id: orderResponse.orderId,
          // Ensure Razorpay modal appears above everything
          config: {
            display: {
              blocks: {
                banks: {
                  name: "All payment methods",
                  instruments: [
                    {
                      method: "card",
                    },
                    {
                      method: "netbanking",
                    },
                    {
                      method: "wallet",
                    },
                    {
                      method: "upi",
                    },
                  ],
                },
              },
              sequence: ["block.banks"],
              preferences: {
                show_default_blocks: true,
              },
            },
          },
          handler: async function (razorpayResponse: any) {
            try {
              // Step 3: Verify payment
              const verificationResponse = await verifyRazorpayPayment(
                razorpayResponse.razorpay_order_id,
                razorpayResponse.razorpay_payment_id,
                razorpayResponse.razorpay_signature,
                car.id,
                new Date(values.startTime).toISOString(),
                values.duration,
                advanceAmount,
                token!
              );

              if (!verificationResponse.success || verificationResponse.paymentStatus !== 'completed') {
                throw new Error("Payment verification failed. Please contact support.");
              }

              // Step 4: Create booking after successful payment verification
              const bookingData = {
                carId: car.id,
                startTime: new Date(values.startTime).toISOString(),
                duration: values.duration,
                fullName: values.fullName,
                guardianName: values.guardianName,
                guardianRelation: values.guardianRelation,
                residentialAddress: values.residentialAddress,
                email: values.email,
                mobile: values.mobile,
                occupation: values.occupation,
                drivingLicenseNumber: values.drivingLicenseNumber,
                licenseExpiryDate: new Date(values.licenseExpiryDate).toISOString(),
                depositType: values.depositType,
                bikeDetails: values.depositType === "bike" && values.bikeDetails ? values.bikeDetails : null,
                withDriver: values.withDriver,
                homeDelivery: false,
                deliveryDistance: 0,
                paymentId: verificationResponse.paymentId,
                paymentStatus: verificationResponse.paymentStatus
              };

              const bookingResponse = await createBooking(bookingData, token!);
              toast.success("Booking confirmed! Your advance payment has been processed and the car is now blocked for your selected time.");
              
              // Extract booking ID from response if available
              const bookingId = (bookingResponse as any)?.booking?._id || (bookingResponse as any)?.booking?.id || "";
              
              if (onBookingSuccess && bookingId) {
                onBookingSuccess(bookingId);
              } else {
                // Fallback to redirect if no callback provided
                router.push("/bookings");
              }
            } catch (error) {
              console.error("Payment verification/booking creation error:", error);
              const message = (error as { message?: string }).message ?? "Failed to verify payment or create booking.";
              toast.error(message);
            } finally {
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: values.fullName,
            email: values.email,
            contact: values.mobile,
          },
          theme: {
            color: "#f97316",
          },
          modal: {
            ondismiss: function() {
              setIsSubmitting(false);
              toast.error("Payment cancelled");
            },
            // Ensure modal is accessible
            animation: true,
          },
        };

        // Open Razorpay checkout
        const razorpayWindow = (window as any).Razorpay;
        if (!razorpayWindow) {
          throw new Error("Razorpay SDK not loaded. Please refresh the page.");
        }
        
        const razorpayInstance = new razorpayWindow(options);
        
        // Set high z-index for Razorpay modal after opening
        razorpayInstance.on('payment.failed', function(response: any) {
          console.error('Payment failed:', response);
          setIsSubmitting(false);
          toast.error("Payment failed. Please try again.");
        });
        
        razorpayInstance.open();
        
        // Force Razorpay modal to have highest z-index and ensure it's clickable
        const fixRazorpayZIndex = () => {
          const razorpayIframe = document.querySelector('iframe[name="razorpay-checkout-frame"]') as HTMLIFrameElement;
          if (razorpayIframe) {
            razorpayIframe.style.zIndex = '999999';
            razorpayIframe.style.pointerEvents = 'auto';
            razorpayIframe.style.cursor = 'default';
            
            // Find and fix all parent containers
            let parent: HTMLElement | null = razorpayIframe.parentElement;
            let depth = 0;
            while (parent && depth < 10) {
              if (parent.style) {
                parent.style.zIndex = '999999';
                parent.style.pointerEvents = 'auto';
                parent.style.cursor = 'default';
              }
              parent = parent.parentElement;
              depth++;
            }
          } else {
            // Retry if iframe not found yet
            setTimeout(fixRazorpayZIndex, 50);
          }
        };
        
        // Fix z-index immediately and retry if needed
        setTimeout(fixRazorpayZIndex, 50);
        setTimeout(fixRazorpayZIndex, 200);
        setTimeout(fixRazorpayZIndex, 500);
      } catch (error) {
        console.error(error);
        const message = (error as { message?: string }).message ?? "Failed to initiate payment. Please try again.";
        toast.error(message);
        setIsSubmitting(false);
      }
  };

  // Check availability when startTime or duration changes
  useEffect(() => {
    const startTime = form.watch("startTime");
    const duration = form.watch("duration");
    
    // Debounce the check to avoid too many API calls
    const timeoutId = setTimeout(() => {
      if (startTime && duration) {
        checkAvailability();
      }
    }, 500); // Wait 500ms after user stops typing/selecting

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("startTime"), form.watch("duration")]);

  const checkAvailability = async () => {
    const startTime = form.getValues("startTime");
    const duration = form.getValues("duration");
    
    if (!startTime || !duration) {
      return;
    }

    setCheckingAvailability(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/cars/${car.id}/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          startTime: new Date(startTime).toISOString(),
          duration: duration
        })
      });

      const data = await response.json();
      setAvailabilityInfo(data);
      
      if (!data.available) {
        toast.error(`Car is not available for the selected time. Next available: ${data.nextAvailableStartTime ? new Date(data.nextAvailableStartTime).toLocaleString() : 'N/A'}`);
      }
    } catch (error) {
      console.error('Availability check error:', error);
      toast.error('Failed to check availability. Please try again.');
    } finally {
      setCheckingAvailability(false);
    }
  };


  if (!user) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Sign in to Reserve</h3>
          <p className="text-muted-foreground mb-6">
            You need an account to submit the booking agreement and documents.
          </p>
          <Button onClick={() => router.push("/auth/login")} size="lg">
            Login or Register
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
            <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold mb-2">Booking Form</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Fill out all sections below to complete your booking
            </p>
          </div>
          <div className="flex space-x-1 sm:space-x-2 lg:space-x-3 xl:space-x-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-1.5 sm:h-2 lg:h-2.5 xl:h-3 rounded-full bg-primary/30"
              />
            ))}
          </div>
        </CardContent>
      </Card>


      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Step 1: Booking Details */}
          <div>
            <Card>
              <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10 pb-3 sm:pb-4 lg:pb-6 xl:pb-8">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg lg:text-xl xl:text-2xl">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-primary" />
                  <span>Booking Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10 p-4 sm:p-6 lg:p-8 xl:p-10 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
                  <FormField
                    control={form.control}
                    name="startTime"
                    rules={{ 
                      required: "Start time is required",
                      validate: (value) => validateFutureDate(value) || "Start time must be in the future"
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date & Time</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="datetime-local"
                              {...field}
                              min={new Date().toISOString().slice(0, 16)}
                              className="pr-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    rules={{ 
                      required: "Duration is required",
                      validate: (value) => value % 12 === 0 || "Duration must be in multiples of 12 hours"
                    }}
                    render={({ field }) => {
                      const formatDuration = (hours: number) => {
                        if (hours < 24) {
                          return `${hours} hours`;
                        } else if (hours === 24) {
                          return "24 hours (1 day)";
                        } else {
                          const days = hours / 24;
                          return `${days} ${days === 1 ? 'day' : 'days'}`;
                        }
                      };

                      const selectedValue = field.value ? formatDuration(field.value) : null;

                      return (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration">
                                  {selectedValue || "Select duration"}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DURATIONS.map((durationOption) => {
                                // Disable duration options that exceed maxDurationHours if available
                                const isDisabled = availabilityInfo !== null && 
                                                  !availabilityInfo.available && 
                                                  availabilityInfo.maxDurationHours !== null &&
                                                  availabilityInfo.maxDurationHours !== undefined &&
                                                  durationOption > availabilityInfo.maxDurationHours;
                                
                                return (
                                  <SelectItem 
                                    key={durationOption} 
                                    value={String(durationOption)}
                                    disabled={!!isDisabled}
                                    className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                                  >
                                    {formatDuration(durationOption)}
                                    {isDisabled && " (Not available)"}
                                  </SelectItem>
                                );
                              })}
                              <div className="px-2 py-1.5 text-xs text-muted-foreground border-t border-border mt-1">
                                {availabilityInfo && !availabilityInfo.available && availabilityInfo.maxDurationHours ? (
                                  <span className="text-orange-600 dark:text-orange-400">
                                    Maximum available duration: {availabilityInfo.maxDurationHours} hours
                                  </span>
                                ) : (
                                  "Need longer than 3 days? Contact support@zionrentals.com"
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                {car.driverAvailable && (
                  <FormField
                    control={form.control}
                    name="withDriver"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            Include professional driver
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Driver charges (₹{car.driverChargesPerDay.toLocaleString()}/day) included in pricing
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                {/* Availability Status in Step 1 */}
                {availabilityInfo !== null && (
                  <div className="mt-4">
                    {checkingAvailability ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4 animate-spin" />
                        <AlertDescription>Checking availability...</AlertDescription>
                      </Alert>
                    ) : availabilityInfo.available ? (
                      <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          ✓ Car is available for the selected time slot
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <p className="font-semibold mb-2">Car is not available for the selected time.</p>
                          {availabilityInfo.nextAvailableStartTime && (
                            <p className="text-sm">Next available: {new Date(availabilityInfo.nextAvailableStartTime).toLocaleString()}</p>
                          )}
                          {availabilityInfo.maxDurationHours !== null && availabilityInfo.maxDurationHours !== undefined && availabilityInfo.maxDurationHours > 0 && (
                            <p className="text-sm">Maximum duration available: {availabilityInfo.maxDurationHours} hours</p>
                          )}
                          {availabilityInfo.maxDurationHours === 0 && (
                            <p className="text-sm">No duration available at this time. Please select a different start time.</p>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Personal Information */}
          <div>
            <Card>
              <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10 pb-3 sm:pb-4 lg:pb-6 xl:pb-8">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg lg:text-xl xl:text-2xl">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10 p-4 sm:p-6 lg:p-8 xl:p-10 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
                  <FormField
                    control={form.control}
                    name="fullName"
                    rules={{ 
                      required: "Full name is required",
                      validate: (value) => validateName(value) || "Name must be at least 2 characters and contain only letters"
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guardianName"
                    rules={{ 
                      required: "Guardian name is required",
                      validate: (value) => validateName(value) || "Guardian name must be at least 2 characters and contain only letters"
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guardian Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter guardian name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guardianRelation"
                    rules={{ required: "Guardian relation is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relation to Guardian</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select relation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GUARDIAN_RELATIONS.map((relation) => (
                              <SelectItem key={relation.value} value={relation.value}>
                                {relation.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mobile"
                    rules={{ 
                      required: "Mobile number is required",
                      validate: (value) => validateMobile(value) || "Please enter a valid 10-digit mobile number"
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 10-digit mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ 
                      required: "Email is required",
                      validate: (value) => validateEmail(value) || "Please enter a valid email address"
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="occupation"
                    rules={{ 
                      required: "Occupation is required",
                      minLength: { value: 2, message: "Occupation must be at least 2 characters" }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your occupation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="residentialAddress"
                  rules={{ 
                    required: "Residential address is required",
                    minLength: { value: 10, message: "Address must be at least 10 characters" }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residential Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3} 
                          placeholder="Enter your complete residential address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Step 3: License & Deposit */}
          <div>
            <Card>
              <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10 pb-3 sm:pb-4 lg:pb-6 xl:pb-8">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg lg:text-xl xl:text-2xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
                  <span>License & Deposit Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10 p-4 sm:p-6 lg:p-8 xl:p-10 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
                  <FormField
                    control={form.control}
                    name="drivingLicenseNumber"
                    rules={{ 
                      required: "Driving license number is required",
                      validate: (value) => validateLicenseNumber(value) || "License number must be at least 5 characters and contain only uppercase letters and numbers"
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driving License Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter license number" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="licenseExpiryDate"
                    rules={{ 
                      required: "License expiry date is required",
                      validate: (value) => validateFutureDate(value) || "License must not be expired"
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Expiry Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="date"
                              {...field}
                              min={new Date().toISOString().split('T')[0]}
                              className="pr-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="depositType"
                  rules={{ required: "Deposit type is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select deposit type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash Deposit (₹{depositAmount.toLocaleString()})</SelectItem>
                          <SelectItem value="bike">Two Wheeler as Security</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {depositType === "bike" && (
                  <FormField
                    control={form.control}
                    name="bikeDetails"
                    rules={{ 
                      required: depositType === "bike" ? "Two wheeler details are required" : false,
                      minLength: { value: 5, message: "Two wheeler details must be at least 5 characters" }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Two Wheeler Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={3} 
                            placeholder="Enter two wheeler registration number, model, and other details" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Home delivery is also available after booking. Contact - 9100664083, charges will be applicable.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Step 4: Advance Payment */}
          <div>
            <Card>
              <CardHeader className="p-4 sm:p-6 lg:p-8 xl:p-10 pb-3 sm:pb-4 lg:pb-6 xl:pb-8">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg lg:text-xl xl:text-2xl">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-primary" />
                  <span>Pay Advance Fee to Block Car</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8 lg:space-y-10 xl:space-y-12 p-4 sm:p-6 lg:p-8 xl:p-10 pt-0">
                {checkingAvailability ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Checking availability...</p>
                  </div>
                ) : availabilityInfo && !availabilityInfo.available ? (
                  <Alert variant="destructive" className="my-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Car is not available for the selected time.</p>
                      {availabilityInfo.nextAvailableStartTime && (
                        <p>Next available: {new Date(availabilityInfo.nextAvailableStartTime).toLocaleString()}</p>
                      )}
                      {availabilityInfo.maxDurationHours && (
                        <p>Maximum duration available: {availabilityInfo.maxDurationHours} hours</p>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {/* Advance Amount Section */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-6 sm:p-8 lg:p-10 xl:p-12 rounded-xl border-2 border-primary/20 space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        <div>
                          <span className="font-semibold text-lg sm:text-xl lg:text-2xl xl:text-3xl text-foreground block mb-1">
                            Advance Amount
                          </span>
                          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                            To block your selected time slot
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary flex items-center gap-1 sm:gap-2">
                            <IndianRupee className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9" />
                            {(car.advanceAmount || 500).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Important Terms Section */}
                    <div className="space-y-6 sm:space-y-8">
                      <Alert variant="destructive" className="flex flex-col gap-3" style={{ position: 'static', zIndex: 'auto' }}>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-6 w-6 flex-shrink-0" />
                          <AlertTitle className="text-lg sm:text-xl lg:text-2xl font-bold m-0">
                            Important: Non-Refundable Terms
                          </AlertTitle>
                        </div>
                        <AlertDescription className="text-base sm:text-lg lg:text-xl leading-relaxed m-0">
                          <span>The advance fee is <strong className="font-bold">NON-REFUNDABLE</strong> if your required documents (Aadhaar card + valid driving license) are missing or expired during physical verification when you arrive to pick up the car.</span>
                        </AlertDescription>
                      </Alert>

                      <div className="flex items-start gap-3 sm:gap-4 py-2">
                        <Checkbox
                          id="non-refundable-accept"
                          checked={nonRefundableAccepted}
                          onCheckedChange={(checked) => setNonRefundableAccepted(checked === true)}
                          className="mt-1 flex-shrink-0 h-6 w-6 sm:h-7 sm:w-7"
                        />
                        <label
                          htmlFor="non-refundable-accept"
                          className="text-base sm:text-lg lg:text-xl leading-relaxed cursor-pointer flex-1 font-medium"
                        >
                          I understand that the advance fee is non-refundable if my required documents 
                          (Aadhaar card + valid driving license) are missing or expired during verification. 
                          I have checked everything.
                        </label>
                      </div>
                    </div>

                    {/* What Happens Next Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 p-6 sm:p-8 lg:p-10 xl:p-12 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                          <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                        </div>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">
                          What happens next?
                        </p>
                      </div>
                      <ul className="space-y-3 sm:space-y-4 lg:space-y-5 text-base sm:text-lg lg:text-xl text-blue-900 dark:text-blue-100 mb-6">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <span>After payment, your booking will be created with status <strong>"Advance Paid"</strong></span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <span>The car will be immediately blocked for your selected time slot</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <span>When you arrive, admin will verify your documents</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <span>If documents are valid, the car will be handed over</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <span>If documents are missing/expired, the booking will be rejected and advance will not be refunded</span>
                        </li>
                      </ul>
                      <div className="pt-4 border-t border-blue-200 dark:border-blue-700">
                        <p className="text-base sm:text-lg lg:text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                          Need help? Contact us for any queries:
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-base sm:text-lg lg:text-xl">
                          <a 
                            href="tel:9100664083" 
                            className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:underline transition-colors"
                          >
                            <Phone className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                            <span>9100664083</span>
                          </a>
                          <a 
                            href="mailto:Zioncarrentals90@gmail.com" 
                            className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:underline transition-colors"
                          >
                            <Mail className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                            <span>Zioncarrentals90@gmail.com</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submit Button - Show at bottom of all steps */}
          <Card className="border-2">
            <CardContent className="p-6 sm:p-8 lg:p-10 xl:p-12 space-y-4">
              <Button
                type="submit"
                disabled={
                  isSubmitting || 
                  !nonRefundableAccepted || 
                  !availabilityInfo?.available ||
                  checkingAvailability
                }
                className="w-full text-base sm:text-lg lg:text-xl font-semibold py-10 sm:py-12 lg:py-14 h-auto shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Pay & Confirm Booking"
                )}
              </Button>
              {!nonRefundableAccepted && (
                <p className="text-base sm:text-lg text-muted-foreground text-center py-2">
                  Please accept the non-refundable terms in Step 4 to proceed
                </p>
              )}
              {!availabilityInfo?.available && availabilityInfo !== null && (
                <p className="text-base sm:text-lg text-destructive text-center py-2">
                  Car is not available for the selected time. Please adjust your booking details.
                </p>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
