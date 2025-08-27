"use client";

import Image from "next/image";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface Certification {
  name: string;
  image?: string;
  mobileImage?: string;
  desktopImage?: string;
}

interface CertificationBannerProps {
  certifications: Certification[];
}

export default function CertificationBanner({
  certifications,
}: CertificationBannerProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <div className="mb-8 bg-white rounded-lg p-5">
      <div className="flex flex-wrap justify-center gap-10">
        {certifications.map((cert, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-16 h-16 relative">
              <Image
                src={
                  isMobile
                    ? cert.mobileImage || cert.image || '/images/brand/default-certification.png'
                    : cert.desktopImage || cert.image || '/images/brand/default-certification.png'
                }
                alt={cert.name}
                width={64}
                height={64}
                className="object-contain"
                onError={(e) => {
                  console.error("Certification image failed to load:", e.currentTarget.src);
                  e.currentTarget.src = '/images/brand/default-certification.png';
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
