"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOfferBanner, type OfferBanner as OfferBannerType } from "@/lib/homepage";
import { motion } from "motion/react";

export function OfferBannerSection() {
  const [banner, setBanner] = useState<OfferBannerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBanner = async () => {
      try {
        const data = await getOfferBanner();
        setBanner(data.banner);
      } catch (error) {
        console.error("Failed to load offer banner", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBanner();
  }, []);

  if (isLoading || !banner || !banner.active) {
    return null;
  }

  const content = banner.linkUrl ? (
    <Link href={banner.linkUrl} className="block w-full">
      <img
        src={banner.imageUrl}
        alt={banner.title || "Special Offer"}
        className="w-full h-auto object-cover rounded-lg shadow-2xl"
      />
    </Link>
  ) : (
    <img
      src={banner.imageUrl}
      alt={banner.title || "Special Offer"}
      className="w-full h-auto object-cover rounded-lg shadow-2xl"
    />
  );

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {content}
        </motion.div>
      </div>
    </section>
  );
}

