"use client";

import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const TopBrandsSection = () => {
  // Brand data with proper slugs for the new brand pages
  const brands = [
    {
      id: 1,
      name: "Haldiram's",
      logoUrl: "/images/home/brands/brand_one.png",
      slug: "haldirams",
    },
    {
      id: 2,
      name: "Patanjali",
      logoUrl: "/images/home/brands/brand_one.png",
      slug: "patanjali",
    },
    {
      id: 3,
      name: "Everest",
      logoUrl: "/images/home/brands/brand_one.png",
      slug: "everest",
    },
    {
      id: 4,
      name: "Jiva",
      logoUrl: "/images/home/brands/brand_one.png",
      slug: "jiva",
    },
    {
      id: 5,
      name: "Dabur",
      logoUrl: "/images/home/brands/brand_one.png",
      slug: "dabur",
    },
    {
      id: 6,
      name: "Vicco",
      logoUrl: "/images/home/brands/brand_one.png",
      slug: "vicco",
    },
    {
      id: 7,
      name: "Aadya Naturals",
      logoUrl: "/images/home/brands/brand_one.png",
      slug: "aadya-naturals",
    },
    {
      id: 8,
      name: "Baidyanath",
      logoUrl: "/images/home/brands/brand_one.png",
      slug: "baidyanath",
    },
    {
      id: 9,
      name: "Himalaya",
      logoUrl: "/images/home/brands/brand_one.png",
      slug: "himalaya",
    },
    {
      id: 10,
      name: "Organic India",
      logoUrl: "/images/home/brands/brand_one.png",
      slug: "organic-india",
    },
  ];

  return (
    <section className="mb-8 bg-white rounded-2xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="title-1-semibold text-center">Top Brands</h2>
        <Link
          href="/brands"
          className="flex items-center caption-semibold md:body-large-semibold text-blue-00 hover:underline bg-blue-110 rounded-lg px-4 py-1"
        >
          View All
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brand/${brand.slug}`}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative w-full mb-2 border border-gray-70 aspect-square rounded-lg">
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                fill
                className="object-contain"
              />
            </div>
            <span className="text-center caption-semibold md:body-large-semibold text-black">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TopBrandsSection;
