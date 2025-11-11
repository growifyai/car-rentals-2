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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createBooking } from "@/lib/bookings";
import type { CarDetailData } from "@/types/cars";
import { toast } from "sonner";
import { CameraCapture } from "@/components/CameraCapture";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  CreditCard, 
  Upload,
  AlertCircle,
  CheckCircle,
  IndianRupee,
  Camera
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
  reference1Name: string;
  reference1Mobile: string;
  reference2Name: string;
  reference2Mobile: string;
  drivingLicenseNumber: string;
  licenseExpiryDate: string;
  depositType: "bike" | "cash" | "online";
  bikeDetails?: string;
  withDriver: boolean;
  homeDelivery: boolean;
  deliveryAddress?: string;
  deliveryDistance?: number;
  drivingLicense: FileList;
  aadharCard: FileList;
  livePhoto: FileList;
};

const defaultValues: Partial<BookingFormValues> = {
  duration: 12,
  guardianRelation: "S/o",
  depositType: "cash",
  withDriver: false,
  homeDelivery: false,
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const totalSteps = 5;

  const pricePerPeriod = useMemo(() => car.pricing.price12hr, [car.pricing.price12hr]);
  const depositAmount = useMemo(() => car.depositAmount, [car.depositAmount]);

  const duration = form.watch("duration") ?? 12;
  const withDriver = form.watch("withDriver");
  
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
  const homeDelivery = form.watch("homeDelivery");
  const depositType = form.watch("depositType");

  const handleSubmit = async (values: BookingFormValues) => {
    if (!token) {
      toast.error("Please login to complete your booking");
      return router.push("/auth/login");
    }

    // Validate all fields
    const errors: string[] = [];

    // Basic validations
    if (!values.startTime) errors.push("Start time is required");
    if (!validateFutureDate(values.startTime)) errors.push("Start time must be in the future");
    if (values.duration % 12 !== 0) errors.push("Duration must be in multiples of 12 hours");
    if (!validateName(values.fullName)) errors.push("Full name must be at least 2 characters and contain only letters");
    if (!validateName(values.guardianName)) errors.push("Guardian name must be at least 2 characters and contain only letters");
    if (!values.residentialAddress || values.residentialAddress.length < 10) errors.push("Residential address must be at least 10 characters");
    if (!validateEmail(values.email)) errors.push("Please enter a valid email address");
    if (!validateMobile(values.mobile)) errors.push("Please enter a valid 10-digit mobile number");
    if (!values.occupation || values.occupation.length < 2) errors.push("Occupation must be at least 2 characters");
    if (!validateName(values.reference1Name)) errors.push("Reference 1 name must be at least 2 characters and contain only letters");
    if (!validateMobile(values.reference1Mobile)) errors.push("Reference 1 mobile number must be valid");
    if (!validateName(values.reference2Name)) errors.push("Reference 2 name must be at least 2 characters and contain only letters");
    if (!validateMobile(values.reference2Mobile)) errors.push("Reference 2 mobile number must be valid");
    if (!validateLicenseNumber(values.drivingLicenseNumber)) errors.push("License number must be at least 5 characters and contain only uppercase letters and numbers");
    if (!values.licenseExpiryDate) errors.push("License expiry date is required");
    if (!validateFutureDate(values.licenseExpiryDate)) errors.push("License must not be expired");
    if (depositType === "bike" && (!values.bikeDetails || values.bikeDetails.length === 0)) errors.push("Bike details are required when deposit type is bike");
    if (homeDelivery) {
      if (!values.deliveryAddress || values.deliveryAddress.length === 0) errors.push("Delivery address is required for home delivery");
      if (values.deliveryDistance === undefined || values.deliveryDistance === null) {
        errors.push("Delivery distance is required for home delivery");
      } else {
        const numValue = Number(values.deliveryDistance);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
          errors.push("Please enter a valid delivery distance (0-100 km)");
        }
      }
    }

    if (errors.length > 0) {
      toast.error(errors[0]); // Show first error
      return;
    }

    const drivingLicenseFile = values.drivingLicense?.item(0);
    const aadharFile = values.aadharCard?.item(0);
    const livePhotoFile = values.livePhoto?.item(0);

    if (!drivingLicenseFile || !aadharFile || !livePhotoFile) {
      toast.error("Please upload all required documents");
      return;
    }

    const formData = new FormData();
    formData.append("carId", car.id);
    formData.append("startTime", new Date(values.startTime).toISOString());
    formData.append("duration", String(values.duration));
    formData.append("fullName", values.fullName);
    formData.append("guardianName", values.guardianName);
    formData.append("guardianRelation", values.guardianRelation);
    formData.append("residentialAddress", values.residentialAddress);
    formData.append("email", values.email);
    formData.append("mobile", values.mobile);
    formData.append("occupation", values.occupation);
    formData.append("reference1Name", values.reference1Name);
    formData.append("reference1Mobile", values.reference1Mobile);
    formData.append("reference2Name", values.reference2Name);
    formData.append("reference2Mobile", values.reference2Mobile);
    formData.append("drivingLicenseNumber", values.drivingLicenseNumber);
    formData.append("licenseExpiryDate", new Date(values.licenseExpiryDate).toISOString());
    formData.append("depositType", values.depositType);

    if (values.depositType === "bike" && values.bikeDetails) {
      formData.append("bikeDetails", values.bikeDetails);
    }

    formData.append("withDriver", String(values.withDriver));

    formData.append("homeDelivery", String(values.homeDelivery));
    if (values.homeDelivery && values.deliveryAddress) {
      formData.append("deliveryAddress", values.deliveryAddress);
      // Ensure deliveryDistance is a valid number, default to 0 if invalid
      let validDistance = 0;
      if (values.deliveryDistance !== undefined && values.deliveryDistance !== null) {
        const numValue = Number(values.deliveryDistance);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
          validDistance = numValue;
        }
      }
      // Always send a valid number, never NaN
      formData.append("deliveryDistance", String(validDistance));
    } else {
      // If home delivery is not selected, send 0 as default
      formData.append("deliveryDistance", "0");
    }

    formData.append("drivingLicense", drivingLicenseFile);
    formData.append("aadharCard", aadharFile);
    formData.append("livePhoto", livePhotoFile);

    setIsSubmitting(true);
    try {
      const response = await createBooking(formData, token);
      toast.success("Booking submitted successfully! Our team will review and notify you.");
      
      // Extract booking ID from response if available
      const bookingId = (response as any)?.booking?._id || (response as any)?.booking?.id || "";
      
      if (onBookingSuccess && bookingId) {
        onBookingSuccess(bookingId);
      } else {
        // Fallback to redirect if no callback provided
        router.push("/dashboard/bookings");
      }
    } catch (error) {
      console.error(error);
      const message = (error as { message?: string }).message ?? "Failed to submit booking.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      nextStep();
    }
  };

  const getFieldsForStep = (step: number): (keyof BookingFormValues)[] => {
    switch (step) {
      case 1: return ["startTime", "duration"];
      case 2: return ["fullName", "guardianName", "guardianRelation", "residentialAddress", "email", "mobile", "occupation"];
      case 3: return ["reference1Name", "reference1Mobile", "reference2Name", "reference2Mobile"];
      case 4: return ["drivingLicenseNumber", "licenseExpiryDate", "depositType", "bikeDetails", "homeDelivery", "deliveryAddress", "deliveryDistance"];
      case 5: return ["drivingLicense", "aadharCard", "livePhoto"];
      default: return [];
    }
  };

  const handleCameraCapture = async (file: File) => {
    // Create a FileList-like object
    const fileList = {
      length: 1,
      item: (index: number) => index === 0 ? file : null,
      0: file,
      [Symbol.iterator]: function* () {
        yield file;
      }
    } as FileList;
    
    form.setValue("livePhoto", fileList);
    await form.trigger("livePhoto");
    setIsCameraOpen(false);
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
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Booking Progress</h2>
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i + 1 <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>


      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Step 1: Booking Details */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Booking Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              {DURATIONS.map((duration) => (
                                <SelectItem key={duration} value={String(duration)}>
                                  {formatDuration(duration)}
                                </SelectItem>
                              ))}
                              <div className="px-2 py-1.5 text-xs text-muted-foreground border-t border-border mt-1">
                                Need longer than 3 days? Contact support@zionrentals.com
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
              </CardContent>
            </Card>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          )}

          {/* Step 3: References */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>References</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please provide two references who can vouch for you. These should be people who know you well.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Reference 1</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="reference1Name"
                        rules={{ 
                          required: "Reference 1 name is required",
                          validate: (value) => validateName(value) || "Reference name must be at least 2 characters and contain only letters"
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter reference name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="reference1Mobile"
                        rules={{ 
                          required: "Reference 1 mobile is required",
                          validate: (value) => validateMobile(value) || "Please enter a valid 10-digit mobile number"
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Reference 2</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="reference2Name"
                        rules={{ 
                          required: "Reference 2 name is required",
                          validate: (value) => validateName(value) || "Reference name must be at least 2 characters and contain only letters"
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter reference name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="reference2Mobile"
                        rules={{ 
                          required: "Reference 2 mobile is required",
                          validate: (value) => validateMobile(value) || "Please enter a valid 10-digit mobile number"
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: License & Deposit */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>License & Deposit Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <SelectItem value="bike">Bike as Security</SelectItem>
                          <SelectItem value="online">Online Payment</SelectItem>
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
                      required: depositType === "bike" ? "Bike details are required" : false,
                      minLength: { value: 5, message: "Bike details must be at least 5 characters" }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bike Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={3} 
                            placeholder="Enter bike registration number, model, and other details" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="homeDelivery"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Home Delivery Required</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Check this if you need the car delivered to your location
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                {homeDelivery && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      rules={{ 
                        required: homeDelivery ? "Delivery address is required" : false,
                        minLength: { value: 10, message: "Delivery address must be at least 10 characters" }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={3} 
                              placeholder="Enter delivery address" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="deliveryDistance"
                      rules={{ 
                        required: homeDelivery ? "Delivery distance is required" : false,
                        validate: (value) => {
                          if (homeDelivery) {
                            if (value === undefined || value === null) {
                              return "Delivery distance is required";
                            }
                            const numValue = Number(value);
                            if (isNaN(numValue)) {
                              return "Please enter a valid number";
                            }
                            if (numValue < 0) {
                              return "Distance cannot be negative";
                            }
                            if (numValue > 100) {
                              return "Maximum delivery distance is 100km";
                            }
                          }
                          return true;
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance from Hub (km)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              min="0" 
                              max="100"
                              placeholder="e.g. 4.5" 
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  field.onChange(undefined);
                                } else {
                                  const numValue = Number(value);
                                  if (!isNaN(numValue)) {
                                    field.onChange(numValue);
                                  }
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Document Upload */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Document Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please upload clear, readable images of all required documents. File size should be less than 5MB each.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <UploadField
                    form={form}
                    name="drivingLicense"
                    label="Driving License"
                    description="Upload front and back of your driving license (any file type)"
                  />
                  
                  <UploadField
                    form={form}
                    name="aadharCard"
                    label="Aadhar Card"
                    description="Upload front and back of your Aadhar card (any file type)"
                  />
                  
                  <UploadField
                    form={form}
                    name="livePhoto"
                    label="Live Photo"
                    description="Take a live photo holding your ID (any file type)"
                    onCameraClick={() => setIsCameraOpen(true)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={validateCurrentStep}
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Booking"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
      
      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}

function UploadField({
  form,
  name,
  label,
  description,
  onCameraClick,
}: {
  form: UseFormReturn<BookingFormValues>;
  name: keyof Pick<BookingFormValues, "drivingLicense" | "aadharCard" | "livePhoto">;
  label: string;
  description: string;
  onCameraClick?: () => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileList = e.dataTransfer.files;
      form.setValue(name, fileList);
      await form.trigger(name);
      const file = fileList[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      form.setValue(name, e.target.files);
      await form.trigger(name);
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };
  
  const handleRemove = async () => {
    form.setValue(name, undefined as any);
    await form.trigger(name);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };
  
  const files = form.watch(name);
  const file = files?.item(0);
  
  // Update preview when file changes
  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);
  
  // For live photo, only show camera button
  if (name === "livePhoto") {
    return (
      <FormField
        control={form.control}
        name={name}
        rules={{ required: `${label} is required` }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="border-2 border-dashed rounded-lg p-6 text-center border-muted-foreground/25">
                {file ? (
                  <div className="space-y-3">
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Live photo preview"
                          className="w-full h-48 object-contain rounded-lg border border-border"
                        />
                      </div>
                    ) : (
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    )}
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemove}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-sm font-medium">Take a live photo</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    {onCameraClick && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCameraClick}
                        className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
  
  // For driving license and aadhar card, show file upload with preview
  return (
    <FormField
      control={form.control}
      name={name}
      rules={{ required: `${label} is required` }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-3">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt={`${label} preview`}
                        className="w-full h-48 object-contain rounded-lg border border-border"
                      />
                    </div>
                  ) : (
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                  )}
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemove}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id={`upload-${name}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`upload-${name}`)?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}