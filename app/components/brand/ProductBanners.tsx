"use client";

import Image from "next/image";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface Banner {
  id: number;
  alt: string;
  image?: string;
  mobileImage?: string;
  desktopImage?: string;
}

interface ProductBannersProps {
  banners: Banner[];
}

export default function ProductBanners({ banners }: ProductBannersProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Helper function to get the appropriate image URL based on screen size
  const getImageUrl = (banner: Banner) => {
    if (isMobile && banner.mobileImage) {
      return banner.mobileImage;
    }
    if (!isMobile && banner.desktopImage) {
      return banner.desktopImage;
    }
    return banner.image || '/images/brand/default-product-banner.jpg';
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white rounded-xl p-6">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="rounded-lg overflow-hidden relative h-auto w-full"
        >
          <Image
            src={getImageUrl(banner)}
            alt={banner.alt}
            width={120}
            height={120}
            className="object-contain w-full h-full"
            onError={(e) => {
              console.error("Product banner image failed to load:", e.currentTarget.src);
              e.currentTarget.src = '/images/brand/default-product-banner.jpg';
            }}
          />
        </div>
      ))}
    </div>
  );
}
