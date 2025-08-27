"use client";

import Image from "next/image";

interface Certification {
  id: number;
  name: string;
  imageUrl: string;
}

interface CertificationSectionProps {
  certifications: Certification[];
  title?: string;
}

export default function CertificationSection({
  certifications,
  title = "Certifications & Awards",
}: CertificationSectionProps) {
  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="container px-4 mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">
          {title}
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="h-16 md:h-20 w-auto flex items-center justify-center bg-white p-3 rounded-lg"
            >
              <Image
                src={cert.imageUrl}
                alt={cert.name}
                width={80}
                height={60}
                className="h-auto w-auto max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
