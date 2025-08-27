"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { userBannerService, Banner } from "@/app/lib/services/bannerService";

const SaleSection = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch deals banners from API
  useEffect(() => {
    const fetchDealsBanners = async () => {
      try {
        setLoading(true);
        const response = await userBannerService.getDealsBanner();
        if (response.success && response.data.banners.length > 0) {
          // Filter only active banners
          const activeBanners = response.data.banners.filter(
            (banner) => banner.is_active
          );
          setBanners(activeBanners);
        } else {
          setBanners([]);
        }
      } catch (err) {
        console.error("Error fetching deals banners:", err);
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

    fetchDealsBanners();
  }, []);

  // Create banner items from API data or fallback to default
  const saleBanners =
    banners.length > 0
      ? banners.flatMap((banner) =>
          banner.images.desktop.map((desktopImage, index) => ({
            id: `${banner.id}-${index}`,
            alt: banner.title,
            url: "/collections/deals",
            imageUrl: desktopImage,
            mobileImageUrl:
              banner.images.mobile[index] ||
              banner.images.mobile[0] ||
              desktopImage,
          }))
        )
      : [
          {
            id: "default-1",
            alt: "New Season Sale - Up to 30% off",
            url: "/collections/new-season",
            imageUrl: "/images/home/sale/banner_one.png",
            mobileImageUrl: "/images/home/sale/banner_one.png",
          },
          {
            id: "default-2",
            alt: "Fashion and Accessories Special Sale - Flat 10% off",
            url: "/collections/fashion-sale",
            imageUrl: "/images/home/sale/banner_two.png",
            mobileImageUrl: "/images/home/sale/banner_two.png",
          },
          {
            id: "default-3",
            alt: "Mega Sale - Up to 70% off",
            url: "/collections/mega-sale",
            imageUrl: "/images/home/sale/banner_three.png",
            mobileImageUrl: "/images/home/sale/banner_three.png",
          },
          {
            id: "default-4",
            alt: "Big Deals Special Event - Up to 50% off",
            url: "/collections/big-deals",
            imageUrl: "/images/home/sale/banner_four.png",
            mobileImageUrl: "/images/home/sale/banner_four.png",
          },
        ];

  // Show loading state
  if (loading) {
    return (
      <section className="mb-8 bg-white rounded-2xl px-3 md:px-6 py-3 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={`loading-${index}`}
              className="relative overflow-hidden rounded-lg md:rounded-2xl h-28 md:h-56 bg-gray-200 animate-pulse"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading...</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 bg-white rounded-2xl px-3 md:px-6 py-3 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {saleBanners.map((banner, index) => (
          <Link
            key={banner.id}
            href={banner.url}
            className="block relative overflow-hidden rounded-lg md:rounded-2xl transition-shadow h-auto"
          >
            <picture>
              <source
                media="(max-width: 768px)"
                srcSet={banner.mobileImageUrl}
              />
              <Image
                src={banner.imageUrl}
                alt={banner.alt}
                width={1000}
                height={1000}
                className="object-cover rounded-lg md:rounded-2xl"
                priority={index === 0}
                onError={(e) => {
                  console.error(
                    "Sale banner image failed to load:",
                    e.currentTarget.src
                  );
                  // Fallback to default image based on index
                  const fallbackImages = [
                    "/images/home/sale/banner_one.png",
                    "/images/home/sale/banner_two.png",
                    "/images/home/sale/banner_three.png",
                    "/images/home/sale/banner_four.png",
                  ];
                  e.currentTarget.src =
                    fallbackImages[index] || fallbackImages[0];
                }}
              />
            </picture>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SaleSection;
