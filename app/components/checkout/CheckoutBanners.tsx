"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { userBannerService, Banner } from "@/app/lib/services/bannerService";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const CheckoutBanners = () => {
  const [banners, setBanners] = useState<{
    "checkout-banner-one": Banner[];
    "checkout-banner-two": Banner[];
    "checkout-banner-three": Banner[];
    "checkout-banner-four": Banner[];
  }>({
    "checkout-banner-one": [],
    "checkout-banner-two": [],
    "checkout-banner-three": [],
    "checkout-banner-four": [],
  });
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Fetch checkout banners from API using consolidated endpoint
  useEffect(() => {
    const fetchCheckoutBanners = async () => {
      try {
        setLoading(true);

        // Use the new consolidated API to get all checkout banners in one call
        const response = await userBannerService.getAllCheckoutBanners();

        if (response.success) {
          // Filter only active banners for each section
          const filteredBanners = {
            "checkout-banner-one": (
              response.data.banners["checkout-banner-one"] || []
            ).filter((b) => b.is_active),
            "checkout-banner-two": (
              response.data.banners["checkout-banner-two"] || []
            ).filter((b) => b.is_active),
            "checkout-banner-three": (
              response.data.banners["checkout-banner-three"] || []
            ).filter((b) => b.is_active),
            "checkout-banner-four": (
              response.data.banners["checkout-banner-four"] || []
            ).filter((b) => b.is_active),
          };
          setBanners(filteredBanners);
        } else {
          setBanners({
            "checkout-banner-one": [],
            "checkout-banner-two": [],
            "checkout-banner-three": [],
            "checkout-banner-four": [],
          });
        }
      } catch (err) {
        console.error("Error fetching checkout banners:", err);
        // Check if it's an authentication error
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            console.log(
              "Banner API requires authentication, using fallback banners"
            );
          }
        }
        setBanners({
          "checkout-banner-one": [],
          "checkout-banner-two": [],
          "checkout-banner-three": [],
          "checkout-banner-four": [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutBanners();
  }, []);

  // Create banner items from API data or fallback to default
  const checkoutBannerItems = [
    {
      id: "checkout-1",
      banners: banners["checkout-banner-one"],
      fallbackSrc: "/images/brand/banner-one.png",
      alt: "Daily Dose of Wellness",
    },
    {
      id: "checkout-2",
      banners: banners["checkout-banner-two"],
      fallbackSrc: "/images/brand/banner-two.png",
      alt: "Boon for Bones",
    },
    {
      id: "checkout-3",
      banners: banners["checkout-banner-three"],
      fallbackSrc: "/images/brand/banner-three.png",
      alt: "Prince of Herbs",
    },
    {
      id: "checkout-4",
      banners: banners["checkout-banner-four"],
      fallbackSrc: "/images/brand/banner-four.png",
      alt: "Checkout Special Offer",
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div key={`loading-${index}`} className="rounded-lg overflow-hidden">
            <div className="w-full h-[190px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Loading banner...</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderBanner = (item: (typeof checkoutBannerItems)[0]) => {
    // Use API banner if available, otherwise use fallback
    if (item.banners.length > 0) {
      const banner = item.banners[0];
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
            // Internal route - use window.location
            window.location.href = banner.url;
          }
        }
      };

      return (
        <div key={item.id} className="rounded-lg overflow-hidden">
          <div 
            className={`w-full h-[190px] ${banner.url ? 'cursor-pointer' : ''}`}
            onClick={banner.url ? handleBannerClick : undefined}
          >
            <Image
                src={imageToShow}
                alt={banner.title}
                width={400}
                height={200}
                className="w-full rounded-lg h-[190px] object-cover"
                onError={(e) => {
                  console.error(
                    "Checkout banner image failed to load:",
                    e.currentTarget.src
                  );
                  e.currentTarget.src = item.fallbackSrc;
                }}
              />
          </div>
        </div>
      );
    }

    // Fallback to static image
    return (
      <div key={item.id} className="rounded-lg overflow-hidden">
        <Image
          src={item.fallbackSrc}
          alt={item.alt}
          width={400}
          height={200}
          className="w-full rounded-lg h-[190px] object-cover"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {checkoutBannerItems
        .filter((item, index) => index < 3) // Only show first 3 banners
        .map(renderBanner)}
    </div>
  );
};

export default CheckoutBanners;
