"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CarFormData {
  carName: string;
  model: string;
  brand: string;
  year: number;
  type: "normal" | "premium" | "luxury";
  gearType: "auto" | "manual";
  fuelType: "petrol" | "diesel" | "cng" | "hybrid" | "ev";
  seatingCapacity: number;
  pricing: {
    price12hr: number;
    price24hr: number;
    price36hr: number;
    price48hr: number;
    price60hr: number;
    price72hr: number;
  };
  securityDeposit: number;
  driverAvailable: boolean;
  driverChargesPerDay: number;
  description: string;
  features: string[];
  imageUrl: string;
  registrationNumber: string;
  available: boolean;
}

interface CarFormProps {
  initialData?: Partial<CarFormData>;
  onSubmit: (data: CarFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CarForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  submitLabel = "Save Car"
}: CarFormProps) {
  const [formData, setFormData] = useState<CarFormData>({
    carName: "",
    model: "",
    brand: "",
    year: new Date().getFullYear(),
    type: "normal",
    gearType: "manual",
    fuelType: "petrol",
    seatingCapacity: 5,
    pricing: {
      price12hr: 0,
      price24hr: 0,
      price36hr: 0,
      price48hr: 0,
      price60hr: 0,
      price72hr: 0,
    },
    securityDeposit: 0,
    driverAvailable: false,
    driverChargesPerDay: 0,
    description: "",
    features: [],
    imageUrl: "",
    registrationNumber: "",
    available: true,
    ...initialData,
  });

  const [featuresInput, setFeaturesInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.carName.trim()) newErrors.carName = "Car name is required";
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = "Please enter a valid year";
    }
    if (!formData.seatingCapacity || formData.seatingCapacity < 1 || formData.seatingCapacity > 20) {
      newErrors.seatingCapacity = "Please enter a valid seating capacity (1-20)";
    }
    if (!formData.pricing.price12hr || formData.pricing.price12hr < 0) {
      newErrors.price12hr = "12-hour price must be greater than 0";
    }
    if (!formData.pricing.price24hr || formData.pricing.price24hr < 0) {
      newErrors.price24hr = "24-hour price must be greater than 0";
    }
    if (!formData.pricing.price36hr || formData.pricing.price36hr < 0) {
      newErrors.price36hr = "36-hour price must be greater than 0";
    }
    if (!formData.pricing.price48hr || formData.pricing.price48hr < 0) {
      newErrors.price48hr = "48-hour price must be greater than 0";
    }
    if (!formData.pricing.price60hr || formData.pricing.price60hr < 0) {
      newErrors.price60hr = "60-hour price must be greater than 0";
    }
    if (!formData.pricing.price72hr || formData.pricing.price72hr < 0) {
      newErrors.price72hr = "72-hour price must be greater than 0";
    }
    if (!formData.securityDeposit || formData.securityDeposit < 0) {
      newErrors.securityDeposit = "Security deposit must be greater than or equal to 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const addFeature = () => {
    if (featuresInput.trim() && !formData.features.includes(featuresInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featuresInput.trim()]
      }));
      setFeaturesInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updatePricing = (field: keyof CarFormData['pricing'], value: number) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-full">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="carName">Car Name *</Label>
              <Input
                id="carName"
                value={formData.carName}
                onChange={(e) => setFormData(prev => ({ ...prev, carName: e.target.value }))}
                placeholder="e.g., Honda City"
                className={errors.carName ? "border-red-500" : ""}
              />
              {errors.carName && <p className="text-sm text-red-500">{errors.carName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g., City VX"
                className={errors.model ? "border-red-500" : ""}
              />
              {errors.model && <p className="text-sm text-red-500">{errors.model}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="e.g., Honda"
                className={errors.brand ? "border-red-500" : ""}
              />
              {errors.brand && <p className="text-sm text-red-500">{errors.brand}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                min="1900"
                max={new Date().getFullYear() + 1}
                className={errors.year ? "border-red-500" : ""}
              />
              {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                placeholder="e.g., KA01AB1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seatingCapacity">Seating Capacity *</Label>
              <Input
                id="seatingCapacity"
                type="number"
                value={formData.seatingCapacity}
                onChange={(e) => setFormData(prev => ({ ...prev, seatingCapacity: parseInt(e.target.value) || 0 }))}
                min="1"
                max="20"
                className={errors.seatingCapacity ? "border-red-500" : ""}
              />
              {errors.seatingCapacity && <p className="text-sm text-red-500">{errors.seatingCapacity}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the car features, condition, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://example.com/car-image.jpg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Car Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type">Car Type *</Label>
              <Select value={formData.type} onValueChange={(value: "normal" | "premium" | "luxury") => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10001]" style={{ zIndex: 10001 }}>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gearType">Gear Type *</Label>
              <Select value={formData.gearType} onValueChange={(value: "auto" | "manual") => setFormData(prev => ({ ...prev, gearType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10001]" style={{ zIndex: 10001 }}>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="auto">Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type *</Label>
              <Select value={formData.fuelType} onValueChange={(value: "petrol" | "diesel" | "cng" | "hybrid" | "ev") => setFormData(prev => ({ ...prev, fuelType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10001]" style={{ zIndex: 10001 }}>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="cng">CNG</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="ev">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing (₹)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price12hr">12 Hours *</Label>
              <Input
                id="price12hr"
                type="number"
                value={formData.pricing.price12hr}
                onChange={(e) => updatePricing('price12hr', parseInt(e.target.value) || 0)}
                min="0"
                className={errors.price12hr ? "border-red-500" : ""}
              />
              {errors.price12hr && <p className="text-sm text-red-500">{errors.price12hr}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price24hr">24 Hours *</Label>
              <Input
                id="price24hr"
                type="number"
                value={formData.pricing.price24hr}
                onChange={(e) => updatePricing('price24hr', parseInt(e.target.value) || 0)}
                min="0"
                className={errors.price24hr ? "border-red-500" : ""}
              />
              {errors.price24hr && <p className="text-sm text-red-500">{errors.price24hr}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price36hr">36 Hours *</Label>
              <Input
                id="price36hr"
                type="number"
                value={formData.pricing.price36hr}
                onChange={(e) => updatePricing('price36hr', parseInt(e.target.value) || 0)}
                min="0"
                className={errors.price36hr ? "border-red-500" : ""}
              />
              {errors.price36hr && <p className="text-sm text-red-500">{errors.price36hr}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price48hr">48 Hours *</Label>
              <Input
                id="price48hr"
                type="number"
                value={formData.pricing.price48hr}
                onChange={(e) => updatePricing('price48hr', parseInt(e.target.value) || 0)}
                min="0"
                className={errors.price48hr ? "border-red-500" : ""}
              />
              {errors.price48hr && <p className="text-sm text-red-500">{errors.price48hr}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price60hr">60 Hours *</Label>
              <Input
                id="price60hr"
                type="number"
                value={formData.pricing.price60hr}
                onChange={(e) => updatePricing('price60hr', parseInt(e.target.value) || 0)}
                min="0"
                className={errors.price60hr ? "border-red-500" : ""}
              />
              {errors.price60hr && <p className="text-sm text-red-500">{errors.price60hr}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price72hr">72 Hours *</Label>
              <Input
                id="price72hr"
                type="number"
                value={formData.pricing.price72hr}
                onChange={(e) => updatePricing('price72hr', parseInt(e.target.value) || 0)}
                min="0"
                className={errors.price72hr ? "border-red-500" : ""}
              />
              {errors.price72hr && <p className="text-sm text-red-500">{errors.price72hr}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="securityDeposit">Security Deposit (₹) *</Label>
              <Input
                id="securityDeposit"
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: parseInt(e.target.value) || 0 }))}
                min="0"
                className={errors.securityDeposit ? "border-red-500" : ""}
              />
              {errors.securityDeposit && <p className="text-sm text-red-500">{errors.securityDeposit}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-3">
            <Input
              value={featuresInput}
              onChange={(e) => setFeaturesInput(e.target.value)}
              placeholder="Add a feature (e.g., AC, GPS, Bluetooth)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              className="flex-1"
            />
            <Button type="button" onClick={addFeature} variant="outline">
              Add
            </Button>
          </div>

          {formData.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-md">
                  <span className="text-sm">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700 text-lg font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Driver Options and Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Options & Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white">Driver Options</h3>
              <Switch
                id="driverAvailable"
                checked={formData.driverAvailable}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, driverAvailable: checked }))}
                label="Driver Available"
              />

              {formData.driverAvailable && (
                <p className="text-xs text-gray-400 mt-2">Driver cost is included in the rental price</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white">Availability Status</h3>
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
                label="Car is available for rental"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} size="lg">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
