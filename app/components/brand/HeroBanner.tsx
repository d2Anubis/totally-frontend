"use client";

import Image from "next/image";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface HeroBannerProps {
  imageUrl?: string;
  mobileImageUrl?: string;
  desktopImageUrl?: string;
  brandName: string;
  tagline?: string;
}

export default function HeroBanner({
  imageUrl,
  mobileImageUrl,
  desktopImageUrl,
  brandName,
  tagline,
}: HeroBannerProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Determine which image to display
  const displayImageUrl = isMobile
    ? mobileImageUrl || imageUrl
    : desktopImageUrl || imageUrl;
  return (
    <div className="relative w-full h-[400px] md:h-[500px]">
      <Image
        src={displayImageUrl || '/images/brand/default-banner.jpg'}
        alt={`${brandName} banner`}
        fill
        priority
        className="object-cover"
        onError={(e) => {
          console.error("Hero banner image failed to load:", e.currentTarget.src);
          e.currentTarget.src = '/images/brand/default-banner.jpg';
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{brandName}</h1>
          {tagline && <p className="text-lg md:text-xl">{tagline}</p>}
        </div>
      </div>
    </div>
  );
}
