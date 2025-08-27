"use client";

import Image from "next/image";

interface Certification {
  name: string;
  image: string;
}

interface CertificationLogosProps {
  certifications: Certification[];
}

export default function CertificationLogos({
  certifications,
}: CertificationLogosProps) {
  return (
    <div className="mb-8 bg-white rounded-lg p-5">
      <div className="flex flex-wrap justify-center gap-10">
        {certifications.map((cert, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-16 h-16 relative">
              <Image
                src={cert.image}
                alt={cert.name}
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
