"use client";

import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface MegaSaleBannerProps {
  title: string;
  subtext: string;
  buttonText: string;
  href: string;
  image?: string;
  mobileImage?: string;
  desktopImage?: string;
}

export default function MegaSaleBanner({
  title,
  subtext,
  buttonText,
  href,
  image,
  mobileImage,
  desktopImage,
}: MegaSaleBannerProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Determine which image to display
  const displayImage = isMobile
    ? mobileImage || image
    : desktopImage || image;
  return (
    <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl p-8 mb-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-white z-10 mb-6 md:mb-0">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-white/80 mb-4">{subtext}</p>
          <Link
            href={href}
            className="bg-white text-blue-700 px-6 py-2 rounded-md font-semibold inline-block hover:bg-gray-100 transition-colors"
          >
            {buttonText}
          </Link>
        </div>
        <div className="relative z-10">
          <Image
            src={displayImage || '/images/brand/default-sale-banner.jpg'}
            alt={title}
            width={200}
            height={160}
            className="object-contain"
            onError={(e) => {
              console.error("Mega sale banner image failed to load:", e.currentTarget.src);
              e.currentTarget.src = '/images/brand/default-sale-banner.jpg';
            }}
          />
        </div>
      </div>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400 rounded-full opacity-20 -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400 rounded-full opacity-20 -ml-10 -mb-10"></div>
    </div>
  );
}
