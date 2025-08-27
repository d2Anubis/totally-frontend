"use client";

import Image from "next/image";
import Link from "next/link";

export interface AdCardProps {
  id: string;
  imageUrl: string;
  alt: string;
  targetUrl: string;
}

export default function AdCard({ id, imageUrl, alt, targetUrl }: AdCardProps) {
  return (
    <div className="overflow-hidden flex flex-col relative" data-ad-id={id}>
      <Link
        href={targetUrl}
        className="relative block h-full w-full bg-blue-100 rounded-lg hover:opacity-90 transition-opacity"
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover rounded-lg h-full w-full"
          priority
        />
        <span className="absolute bottom-1 right-2 text-xs px-1.5 py-0.5 bg-white/70 rounded text-gray-600">
          Ad
        </span>
      </Link>
    </div>
  );
}
