import { apiFetch } from "./api-client";

export interface HeroVideo {
  _id?: string;
  videoUrl: string | null;
  active?: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

export interface OfferBanner {
  _id?: string;
  imageUrl: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  active?: boolean;
}

export async function getHeroVideo(): Promise<{ videoUrl: string | null; active: boolean }> {
  return apiFetch<{ videoUrl: string | null; active: boolean }>("/api/hero-video");
}

export async function getOfferBanner(): Promise<{ banner: OfferBanner | null }> {
  return apiFetch<{ banner: OfferBanner | null }>("/api/offer-banner");
}

// Admin functions
export async function getAdminHeroVideo(token: string): Promise<{ heroVideo: HeroVideo | null }> {
  return apiFetch<{ heroVideo: HeroVideo | null }>("/api/admin/hero-video", { token });
}

export async function updateHeroVideo(
  videoUrl: string,
  active: boolean,
  token: string
): Promise<{ message: string; heroVideo: HeroVideo }> {
  return apiFetch<{ message: string; heroVideo: HeroVideo }>("/api/admin/hero-video", {
    method: "PUT",
    json: { videoUrl, active },
    token,
  });
}

export async function getAdminOfferBanner(token: string): Promise<{ banner: OfferBanner | null }> {
  return apiFetch<{ banner: OfferBanner | null }>("/api/admin/offer-banner", { token });
}

export async function updateOfferBanner(
  payload: {
    imageUrl: string;
    title?: string;
    description?: string;
    linkUrl?: string;
    active?: boolean;
  },
  token: string
): Promise<{ message: string; banner: OfferBanner }> {
  return apiFetch<{ message: string; banner: OfferBanner }>("/api/admin/offer-banner", {
    method: "PUT",
    json: payload,
    token,
  });
}

// Cars Banner types and functions
export interface CarsBanner {
  _id?: string;
  imageUrl: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  active?: boolean;
}

export async function getCarsBanner(): Promise<{ banner: CarsBanner | null }> {
  return apiFetch<{ banner: CarsBanner | null }>("/api/cars-banner");
}

export async function getAdminCarsBanner(token: string): Promise<{ banner: CarsBanner | null }> {
  return apiFetch<{ banner: CarsBanner | null }>("/api/admin/cars-banner", { token });
}

export async function updateCarsBanner(
  payload: {
    imageUrl: string;
    title?: string;
    description?: string;
    linkUrl?: string;
    active?: boolean;
  },
  token: string
): Promise<{ message: string; banner: CarsBanner }> {
  return apiFetch<{ message: string; banner: CarsBanner }>("/api/admin/cars-banner", {
    method: "PUT",
    json: payload,
    token,
  });
}

