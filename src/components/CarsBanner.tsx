"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCarsBanner, type CarsBanner as CarsBannerType } from "@/lib/homepage";

export function CarsBanner() {
    const [banner, setBanner] = useState<CarsBannerType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadBanner() {
            try {
                const data = await getCarsBanner();
                setBanner(data.banner);
            } catch (error) {
                console.error("Failed to load cars banner", error);
            } finally {
                setIsLoading(false);
            }
        }
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
                className="w-full h-auto object-cover rounded-lg shadow-lg"
                style={{ maxHeight: "280px" }}
            />
        </Link>
    ) : (
        <img
            src={banner.imageUrl}
            alt={banner.title || "Special Offer"}
            className="w-full h-auto object-cover rounded-lg shadow-lg"
            style={{ maxHeight: "280px" }}
        />
    );

    return (
        <div className="w-full mb-8">
            {content}
        </div>
    );
}

