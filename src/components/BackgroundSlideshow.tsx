"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface BackgroundSlideshowProps {
  images: string[];
  interval?: number; // ms between transitions
  transitionDuration?: number; // ms
}

export default function BackgroundSlideshow({
  images,
  interval = 6000,
  transitionDuration = 1500,
}: BackgroundSlideshowProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: transitionDuration / 1000, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt="Background"
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
            unoptimized
          />
        </motion.div>
      </AnimatePresence>

      {/* Light overlay to keep text readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fdf2f5]/80 via-[#fdf2f5]/60 to-[#fdf2f5]/85 z-10" />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#fdf2f5_100%)] opacity-40 z-10" />
    </div>
  );
}
