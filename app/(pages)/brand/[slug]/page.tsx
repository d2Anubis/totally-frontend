import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BrandPageClientContent } from "./client";

// Import data
import {
  pharmaceuticals,
  personalCare,
  babyCare,
  mensWellness,
  womensWellness,
  bodyCare,
  oralHealth,
  brands,
  Brand,
} from "./data";

// Define product type
interface Product {
  id: number;
  title: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  brand: string;
  slug: string;
  rating: number;
  url: string;
  isQuickShip?: boolean;
  isSale?: boolean;
}

// Main page component
export default async function BrandPage({
  params,
}: {
  params: { slug: string };
}) {
  // Await the params object before accessing its properties
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!slug) {
    return notFound();
  }

  // Get brand data from slug
  const brandData: Brand | undefined = brands[slug];

  // If brand doesn't exist, return 404
  if (!brandData) {
    notFound();
  }

  // Group products by category
  const groupedProducts: Record<string, Product[]> = {
    pharmaceuticals: [],
    "personal-care": [],
    "baby-care": [],
    "mens-wellness": [],
    "womens-wellness": [],
    "body-care": [],
    "oral-health": [],
  };

  // Filter each category's products for the current brand
  pharmaceuticals
    .filter((product) => product.slug === slug)
    .forEach((product) => groupedProducts.pharmaceuticals.push(product));

  personalCare
    .filter((product) => product.slug === slug)
    .forEach((product) => groupedProducts["personal-care"].push(product));

  babyCare
    .filter((product) => product.slug === slug)
    .forEach((product) => groupedProducts["baby-care"].push(product));

  mensWellness
    .filter((product) => product.slug === slug)
    .forEach((product) => groupedProducts["mens-wellness"].push(product));

  womensWellness
    .filter((product) => product.slug === slug)
    .forEach((product) => groupedProducts["womens-wellness"].push(product));

  bodyCare
    .filter((product) => product.slug === slug)
    .forEach((product) => groupedProducts["body-care"].push(product));

  oralHealth
    .filter((product) => product.slug === slug)
    .forEach((product) => groupedProducts["oral-health"].push(product));

  // Product banners
  const productBanners = [
    {
      id: 1,
      alt: "PRINCE OF HERBS",
      image: "/images/brand/banner-one.png",
    },
    {
      id: 2,
      alt: "DAILY DOSE OF WELLNESS",
      image: "/images/brand/banner-two.png",
    },
    {
      id: 3,
      alt: "BOON FOR BONES",
      image: "/images/brand/banner-three.png",
    },
    {
      id: 4,
      alt: "BOON FOR BONES",
      image: "/images/brand/banner-four.png",
    },
  ];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrandPageClientContent
        slug={slug}
        brandData={brandData}
        groupedProducts={groupedProducts}
        productBanners={productBanners}
      />
    </Suspense>
  );
}
