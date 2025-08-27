"use client";

import Image from "next/image";

interface BrandHeroProps {
  name: string;
  bannerUrl: string;
}

export default function BrandHero({ name, bannerUrl }: BrandHeroProps) {
  return (
    <div className="w-full h-56 md:h-64 lg:h-72 relative mb-4 rounded-lg overflow-hidden">
      <Image
        src={bannerUrl}
        alt={name}
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
