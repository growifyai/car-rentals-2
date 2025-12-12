"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { getCarsBanner, type CarsBanner as CarsBannerType } from "@/lib/homepage";

// Default background image when no banner is set or inactive
const DEFAULT_BG_IMAGE = "https://images.unsplash.com/photo-1647340764627-11713b9d0f65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjBzaG93cm9vbSUyMGRlYWxlcnNoaXB8ZW58MXx8fHwxNzU5MDQ3NzAzfDA&ixlib=rb-4.1.0&q=80&w=1080";

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

    // Use banner image if available and active, otherwise use default
    const backgroundImage = (banner && banner.active && banner.imageUrl)
        ? banner.imageUrl
        : DEFAULT_BG_IMAGE;

    // Use banner title/description if available, otherwise use defaults
    const title = (banner && banner.active && banner.title)
        ? banner.title
        : "Premium Collection";
    const description = (banner && banner.active && banner.description)
        ? banner.description
        : "Handpicked luxury vehicles for every occasion";
    const linkUrl = (banner && banner.active) ? banner.linkUrl : null;

    const content = (
        <div className="relative rounded-2xl overflow-hidden">
            <img
                src={backgroundImage}
                alt={title}
                className="w-full h-64 lg:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <p className="text-sm opacity-90">{description}</p>
            </div>
        </div>
    );

    return (
        <motion.div
            className="mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
        >
            {linkUrl ? (
                <Link href={linkUrl} className="block">
                    {content}
                </Link>
            ) : (
                content
            )}
        </motion.div>
    );
}
