"use client";

import { useState } from "react";

import { Search, Filter, Car as CarIcon } from "lucide-react";
import { motion } from "motion/react";

import { CarCard } from "./CarCard";
import { CarsBanner } from "./CarsBanner";
import type { CarCardData } from "@/types/cars";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface CarsProps {
  cars: CarCardData[];
  onBookNow?: (car: CarCardData) => void;
}

export function Cars({ cars, onBookNow }: CarsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");

  const carTypes = ["all", ...new Set(cars.map((car) => car.type))];

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesType = selectedType === "all" || car.type === selectedType;

    const pricePerPeriod = car.pricing.price12hr;
    const matchesPriceRange =
      selectedPriceRange === "all" ||
      (selectedPriceRange === "low" && pricePerPeriod < 25000) ||
      (selectedPriceRange === "medium" && pricePerPeriod >= 25000 && pricePerPeriod < 40000) ||
      (selectedPriceRange === "high" && pricePerPeriod >= 40000);

    return matchesSearch && matchesType && matchesPriceRange;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedPriceRange("all");
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 bg-primary/10 text-primary">Our Fleet</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Premium <span className="text-primary">Luxury</span> Cars
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our extensive collection of luxury vehicles. All cars are available
            for 12-hour rental periods with premium service included.
          </p>
        </motion.div>

        {/* Hero Image - Uses admin-editable background */}
        <CarsBanner />

        {/* Search and Filters */}
        <motion.div
          className="bg-card rounded-xl p-6 mb-8 border border-border"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Search & Filter</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Car Type" />
              </SelectTrigger>
              <SelectContent>
                {carTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">Under ₹25,000</SelectItem>
                <SelectItem value="medium">₹25,000 - ₹40,000</SelectItem>
                <SelectItem value="high">Above ₹40,000</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center space-x-2 text-muted-foreground">
            <CarIcon className="h-4 w-4" />
            <span>{filteredCars.length} cars available</span>
          </div>
          <div className="text-sm text-muted-foreground">
            All prices shown per 12-hour period
          </div>
        </motion.div>

        {/* Cars Grid */}
        {filteredCars.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <CarCard
                  car={car}
                  onBookNow={onBookNow}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No cars found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or clear the filters to see all available cars.
            </p>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </motion.div>
        )}

        {/* Additional Information */}
        <motion.div
          className="mt-16 grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center">
            <h4 className="font-semibold mb-2">12-Hour Flexibility</h4>
            <p className="text-sm text-muted-foreground">
              All our cars are available for convenient 12-hour rental periods,
              perfect for day trips or special events.
            </p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold mb-2">Premium Service</h4>
            <p className="text-sm text-muted-foreground">
              Every rental includes comprehensive insurance, 24/7 support,
              and professional vehicle preparation.
            </p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold mb-2">Instant Booking</h4>
            <p className="text-sm text-muted-foreground">
              Book online instantly with our secure payment system
              and get confirmation within minutes.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}