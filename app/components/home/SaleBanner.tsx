"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { userBannerService, Banner } from "@/app/lib/services/bannerService";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const SaleBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Fetch sale banners from API using consolidated endpoint
  useEffect(() => {
    const fetchSaleBanners = async () => {
      try {
        setLoading(true);
        // Use consolidated API to get all home banners and extract sale banner
        const response = await userBannerService.getAllHomeBanners();
        if (response.success && response.data.banners["sale-banner"]) {
          // Filter only active banners
          const activeBanners = response.data.banners["sale-banner"].filter(
            (banner) => banner.is_active
          );
          setBanners(activeBanners);
        } else {
          setBanners([]);
        }
      } catch (err) {
        console.error("Error fetching sale banners:", err);
        // Check if it's an authentication error
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            console.log(
              "Banner API requires authentication, using fallback banners"
            );
          }
        }
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleBanners();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="hidden md:block relative mb-6">
        <div className="w-full h-[100px] bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
          <p className="text-gray-500">Loading banner...</p>
        </div>
      </div>
    );
  }

  // Don't render if no banners
  if (banners.length === 0) {
    return (
      <div className="hidden md:block relative mb-6">
        <Image
          src="/images/home/sale-banner.png"
          alt="Sale Banner"
          width={1000}
          height={1000}
          className="w-full h-auto rounded-xl"
        />
      </div>
    );
  }

  // Render the first active banner
  const banner = banners[0];
  const desktopImage = banner.images.desktop[0];
  const mobileImage = banner.images.mobile[0] || desktopImage;
  
  // Select the appropriate image based on screen size
  const imageToShow = isMobile ? mobileImage : desktopImage;

  // Handle banner click
  const handleBannerClick = () => {
    if (banner.url) {
      // Check if it's an external URL
      if (banner.url.startsWith('http://') || banner.url.startsWith('https://')) {
        window.open(banner.url, '_blank', 'noopener,noreferrer');
      } else {
        // Internal route - use Next.js router or window.location
        window.location.href = banner.url;
      }
    }
  };

  return (
    <div className="hidden md:block relative mb-6">
      <div 
        className={`w-full h-auto rounded-xl ${banner.url ? 'cursor-pointer' : ''}`}
        onClick={banner.url ? handleBannerClick : undefined}
      >
        <Image
            src={imageToShow}
            alt={banner.title}
            width={1000}
            height={1000}
            className="w-full h-auto rounded-xl"
            onError={(e) => {
              console.error(
                "Sale banner image failed to load:",
                e.currentTarget.src
              );
              e.currentTarget.src = "/images/home/sale-banner.png";
            }}
          />
      </div>
    </div>
  );
};

export default SaleBanner;
