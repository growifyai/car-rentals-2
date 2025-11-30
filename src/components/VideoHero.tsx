"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { getHeroVideo } from "@/lib/homepage";

interface VideoHeroProps {
  viewCarsHref?: string;
}

export function VideoHero({ viewCarsHref = "/cars" }: VideoHeroProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const data = await getHeroVideo();
        setVideoUrl(data.videoUrl);
        setIsActive(data.active);
      } catch (error) {
        console.error("Failed to load hero video", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadVideo();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {videoUrl && isActive ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/50 via-background to-background" />
        )}
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      </div>

      {/* Content Overlay */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          className="space-y-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Drive the
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Extraordinary
            </span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Choose from premium vehicles and book instantly online. Experience luxury at every mile.
          </motion.p>
          <motion.div
            className="flex flex-col gap-4 sm:flex-row justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="px-8 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
              asChild
            >
              <Link href={viewCarsHref}>View Cars</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

