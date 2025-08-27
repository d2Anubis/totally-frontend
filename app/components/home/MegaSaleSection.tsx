"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { userBannerService, Banner } from "@/app/lib/services/bannerService";

const MegaSaleSection = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch mega sales banners from API using consolidated endpoint
  useEffect(() => {
    const fetchMegaSaleBanners = async () => {
      try {
        setLoading(true);
        // Use consolidated API to get all home banners and extract mega sales banners
        const response = await userBannerService.getAllHomeBanners();
        if (response.success && response.data.banners["mega-sales"]) {
          // Filter only active banners
          const activeBanners = response.data.banners["mega-sales"].filter(
            (banner) => banner.is_active
          );
          setBanners(activeBanners);
        } else {
          setBanners([]);
        }
      } catch (err) {
        console.error("Error fetching mega sale banners:", err);
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

    fetchMegaSaleBanners();
  }, []);

  // Create banner items from API data or fallback to default
  const megaSaleBanners =
    banners.length > 0
      ? banners.flatMap((banner) =>
          banner.images.desktop.map((desktopImage, index) => ({
            id: `${banner.id}-${index}`,
            alt: banner.title,
            url: banner.url || "/collections/mega-sale", // Use banner URL if available, fallback to default
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
            alt: "Sale 25% Off on Food Products",
            url: "/collections/food-sale",
            imageUrl: "/images/home/mega_sale/banner_one.png",
            mobileImageUrl: "/images/home/mega_sale/banner_one.png",
          },
          {
            id: "default-2",
            alt: "Invest in skincare today",
            url: "/collections/skincare",
            imageUrl: "/images/home/mega_sale/banner_two.png",
            mobileImageUrl: "/images/home/mega_sale/banner_two.png",
          },
          {
            id: "default-3",
            alt: "Black Friday Super Sale - 50% Off",
            url: "/collections/black-friday",
            imageUrl: "/images/home/mega_sale/banner_three.png",
            mobileImageUrl: "/images/home/mega_sale/banner_three.png",
          },
          {
            id: "default-4",
            alt: "Flavors of India - Sale up to 50%",
            url: "/collections/flavors-of-india",
            imageUrl: "/images/home/mega_sale/banner_four.png",
            mobileImageUrl: "/images/home/mega_sale/banner_four.png",
          },
          {
            id: "default-5",
            alt: "Super Sale - Up to 80% Off",
            url: "/collections/super-sale",
            imageUrl: "/images/home/mega_sale/banner_five.png",
            mobileImageUrl: "/images/home/mega_sale/banner_five.png",
          },
          {
            id: "default-6",
            alt: "Buy 1 Get 2 Natural Products",
            url: "/collections/natural-products",
            imageUrl: "/images/home/mega_sale/banner_six.png",
            mobileImageUrl: "/images/home/mega_sale/banner_six.png",
          },
        ];

  // Show loading state
  if (loading) {
    return (
      <section className="mb-8 bg-white rounded-2xl px-3 py-3 md:px-6 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div
              key={`loading-${index}`}
              className={`relative overflow-hidden rounded-lg md:rounded-2xl h-28 md:h-40 bg-gray-200 animate-pulse ${
                index >= 5 ? "hidden md:block" : ""
              }`}
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
    <section className="mb-8 bg-white rounded-2xl px-3 py-3 md:px-6 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
        {megaSaleBanners.map((banner, index) => (
          <Link
            key={banner.id}
            href={banner.url}
            className={`block relative overflow-hidden rounded-lg md:rounded-2xl transition-shadow h-auto ${
              index >= 4 ? "hidden md:block" : ""
            }`}
            target={banner.url.startsWith('http') ? '_blank' : '_self'}
            rel={banner.url.startsWith('http') ? 'noopener noreferrer' : undefined}
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
                className="object-cover rounded-lg md:rounded-2xl h-auto"
                priority={index === 0}
                onError={(e) => {
                  console.error(
                    "Mega sale banner image failed to load:",
                    e.currentTarget.src
                  );
                  // Fallback to default image based on index
                  const fallbackImages = [
                    "/images/home/mega_sale/banner_one.png",
                    "/images/home/mega_sale/banner_two.png",
                    "/images/home/mega_sale/banner_three.png",
                    "/images/home/mega_sale/banner_four.png",
                    "/images/home/mega_sale/banner_five.png",
                    "/images/home/mega_sale/banner_six.png",
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

export default MegaSaleSection;
