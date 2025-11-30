import type { CarCardData, CarDetailData } from "@/types/cars";
import type { ApiCar } from "@/types/api";

import { apiFetch } from "./api-client";

const PREMIUM_DEPOSIT = 35000;
const STANDARD_DEPOSIT = 25000;
const NORMAL_DEPOSIT = 20000;

function calculateDeposit(type: string) {
  if (type === "premium" || type === "luxury") return PREMIUM_DEPOSIT;
  if (type === "normal") return NORMAL_DEPOSIT;
  return STANDARD_DEPOSIT;
}

import { getApiBaseUrl } from "./env";

function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
}

function normalizeImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  // If already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // If relative path starting with /, prepend backend base URL
  if (url.startsWith('/')) {
    return `${getApiBaseUrl()}${url}`;
  }
  // Otherwise, assume it's a relative path and prepend backend URL with /uploads
  return `${getApiBaseUrl()}/uploads/${url}`;
}

export function mapApiCarToCard(car: ApiCar): CarCardData {
  if (!car) {
    throw new Error("Car data is null or undefined");
  }

  if (!car._id) {
    console.warn("Car _id is missing:", car);
    throw new Error("Car data is missing required _id field");
  }

  const carType = car.type || "normal";
  const defaultPricing = {
    price12hr: (car.pricePerHour || 0) * 12,
    price24hr: (car.pricePerHour || 0) * 24,
    price36hr: (car.pricePerHour || 0) * 36,
    price48hr: (car.pricePerHour || 0) * 48,
    price60hr: (car.pricePerHour || 0) * 60,
    price72hr: (car.pricePerHour || 0) * 72,
  };

  // Handle images array: normalize all image URLs
  const normalizedImages = car.images && Array.isArray(car.images) && car.images.length > 0
    ? car.images.map(img => normalizeImageUrl(img)).filter((img): img is string => img !== undefined)
    : [];
  
  // Fall back to imageUrl if images array is empty
  const normalizedImageUrl = normalizedImages.length > 0 
    ? normalizedImages[0] 
    : normalizeImageUrl(car.imageUrl);

  return {
    id: car._id,
    name: car.carName || car.name || "Unknown Car",
    model: car.model || "",
    brand: car.brand || "",
    year: car.year || new Date().getFullYear(),
    type: carType,
    pricing: car.pricing || defaultPricing,
    driverAvailable: car.driverAvailable || false,
    driverChargesPerDay: car.driverChargesPerDay || 0,
    imageUrl: normalizedImageUrl,
    images: normalizedImages.length > 0 ? normalizedImages : (normalizedImageUrl ? [normalizedImageUrl] : []),
    features: car.features ?? [],
    available: car.available !== undefined ? car.available : true,
    depositAmount: car.securityDeposit || calculateDeposit(carType),
    advanceAmount: car.advanceAmount,
    gearType: car.gearType || "manual",
    fuelType: car.fuelType || "petrol",
    seatingCapacity: car.seatingCapacity || 5,
    pricePerHour: car.pricePerHour || (car.pricing?.price12hr || defaultPricing.price12hr) / 12,
  };
}

export function mapApiCarToDetail(car: ApiCar): CarDetailData {
  return {
    ...mapApiCarToCard(car),
    description: car.description,
    createdAt: car.createdAt,
    registrationNumber: car.registrationNumber,
  };
}

interface CarsResponse {
  cars: ApiCar[];
}

interface CarResponse {
  car: ApiCar;
}

export async function fetchCars(token?: string | null): Promise<CarCardData[]> {
  const data = await apiFetch<CarsResponse>('/api/cars', { token });
  return data.cars.map(mapApiCarToCard);
}

export async function fetchCarById(carId: string, token?: string | null): Promise<CarDetailData> {
  const data = await apiFetch<CarResponse>(`/api/cars/${carId}`, { token });
  return mapApiCarToDetail(data.car);
}

export { calculateDeposit };

