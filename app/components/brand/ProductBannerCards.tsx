"use client";

import Link from "next/link";
import Image from "next/image";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface BannerCard {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  url: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  desktopImageUrl?: string;
}

interface ProductBannerCardsProps {
  bannerCards: BannerCard[];
}

export default function ProductBannerCards({
  bannerCards,
}: ProductBannerCardsProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Helper function to get the appropriate image URL based on screen size
  const getImageUrl = (card: BannerCard) => {
    if (isMobile && card.mobileImageUrl) {
      return card.mobileImageUrl;
    }
    if (!isMobile && card.desktopImageUrl) {
      return card.desktopImageUrl;
    }
    return card.imageUrl || '/images/brand/default-banner-card.jpg';
  };
  return (
    <section className="py-10 md:py-16">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {bannerCards.map((card) => (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-xl bg-white flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-semibold mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-700 mb-4">{card.description}</p>
                <Link
                  href={card.url}
                  className="inline-block bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-primary-dark transition w-max"
                >
                  {card.buttonText}
                </Link>
              </div>
              <div className="md:w-1/2 h-48 md:h-auto relative">
                <Image
                  src={getImageUrl(card)}
                  alt={card.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.error("Banner card image failed to load:", e.currentTarget.src);
                    e.currentTarget.src = '/images/brand/default-banner-card.jpg';
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
