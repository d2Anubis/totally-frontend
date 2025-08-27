"use client";

import { Category } from "@/app/data/categories";
import Image from "next/image";
import Link from "next/link";

interface CategoryHeaderProps {
  category: Category;
  relatedCategories?: any[]; // API categories for super category pages
  categoryType?: "category" | "super-category";
  categorySlug?: string;
}

// Fallback categories for regular category pages
const fallbackCategories = [
  {
    name: "Ayurveda",
    description: "Description 1",
    image: "/images/category/category-1.png",
    slug: "ayurveda",
  },
  {
    name: "Health Supplements",
    description: "Description 2",
    image: "/images/category/category-2.png",
    slug: "health-supplements",
  },
  {
    name: "Hair Care",
    description: "Description 3",
    image: "/images/category/category-3.png",
    slug: "hair-care",
  },
  {
    name: "Women's Health Care",
    description: "Description 4",
    image: "/images/category/category-4.png",
    slug: "womens-health-care",
  },
  {
    name: "Homeopathy",
    description: "Description 5",
    image: "/images/category/category-5.png",
  },
  {
    name: "Pure Herbs",
    description: "Description 6",
    image: "/images/category/category-6.png",
  },
];

export default function CategoryHeader({ 
  category, 
  relatedCategories = [], 
  categoryType = "category",
  categorySlug = ""
}: CategoryHeaderProps) {
  // Use API categories for super categories, fallback for regular categories
  const categoriesToShow = categoryType === "super-category" && relatedCategories.length > 0 
    ? relatedCategories 
    : fallbackCategories;

  // Calculate responsive grid classes based on number of categories
  const getGridClasses = (count: number) => {
    if (count <= 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 3) return "grid-cols-2 md:grid-cols-3";
    if (count <= 4) return "grid-cols-2 md:grid-cols-4";
    if (count <= 5) return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-6";
  };

  const gridClasses = getGridClasses(categoriesToShow.length);

  return (
    <div className="mb-6">

      {/* Category Title and Description */}
      <div className="bg-white rounded-xl p-4 w-full">
        {/* desktop version */}
        <div className="hidden md:flex flex-row gap-4 w-full">
          <div className="ads w-full">
            <Image
              src="/images/category/ads-1.png"
              alt="ads"
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="ads flex flex-col justify-between w-full">
            <Image
              src="/images/category/ads-2.png"
              alt="ads"
              width={100}
              height={100}
              className="w-full h-auto object-cover"
            />
            <Image
              src="/images/category/ads-2-2.png"
              alt="ads"
              width={100}
              height={100}
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="ads w-full">
            <Image
              src="/images/category/ads-3.png"
              alt="ads"
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="ads w-full">
            <Image
              src="/images/category/ads-4.png"
              alt="ads"
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* mobile version */}
        <div className="md:hidden grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="ads w-full">
            <Image
              src="/images/category/ads-1.png"
              alt="ads"
              width={100}
              height={60}
              className="w-full h-28 object-cover rounded-lg"
            />
          </div>
          <div className="ads w-full">
            <Image
              src="/images/category/ads-2.png"
              alt="ads"
              width={100}
              height={60}
              className="w-full h-28 object-cover rounded-lg"
            />
          </div>
          <div className="ads w-full">
            <Image
              src="/images/category/ads-3.png"
              alt="ads"
              width={100}
              height={60}
              className="w-full h-28 object-cover rounded-lg"
            />
          </div>
          <div className="ads w-full">
            <Image
              src="/images/category/ads-4.png"
              alt="ads"
              width={100}
              height={60}
              className="w-full h-28 object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Categories Section - Desktop */}
        <div className={`category hidden md:grid ${gridClasses} gap-4 mt-5`}>
          {categoriesToShow.map((item) => {
            // Handle both API and fallback category formats
            const categoryName = item.title || item.name;
            const categoryImage = item.image_url || item.image;
            const categorySlugName = item.slug || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            // Create appropriate link based on category type
            // For super-category, redirect to subcategory page (SubcategoryContent.tsx) to avoid showing CategoryHeader
            const linkHref = categoryType === "super-category" 
              ? `/category/${categorySlugName}/all?subcategory=${encodeURIComponent(categoryName)}&id=${item.id}&type=category`
              : `/category/${category.slug}/${categorySlugName}`;

            return (
              <Link
                href={linkHref}
                key={item.id || item.name}
                className="block w-full"
              >
                <div className="w-full h-[150px] relative rounded-xl overflow-hidden">
                  {categoryImage ? (
                    <Image
                      src={categoryImage}
                      alt={categoryName}
                      width={300}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <span className="text-blue-400 text-4xl">📂</span>
                    </div>
                  )}
                  {/* Category Name with Bottom Gradient Overlay */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-3"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                      height: '60px'
                    }}
                  >
                    <span className="text-white font-semibold text-sm md:text-base text-center truncate px-2">
                      {categoryName}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Categories Section - Mobile */}
        <div className="category grid md:hidden grid-cols-3 gap-3 mt-5">
          {categoriesToShow.map((item) => {
            // Handle both API and fallback category formats
            const categoryName = item.title || item.name;
            const categoryImage = item.image_url || item.image;
            const categorySlugName = item.slug || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            // Create appropriate link based on category type
            // For super-category, redirect to subcategory page (SubcategoryContent.tsx) to avoid showing CategoryHeader
            const linkHref = categoryType === "super-category" 
              ? `/category/${categorySlugName}/all?subcategory=${encodeURIComponent(categoryName)}&id=${item.id}&type=category`
              : `/category/${category.slug}/${categorySlugName}`;

            return (
              <Link
                href={linkHref}
                key={item.id || item.name}
                className="block w-full"
              >
                <div className="w-full">
                  <div className="aspect-square relative rounded-xl overflow-hidden mb-2">
                    {categoryImage ? (
                      <Image
                        src={categoryImage}
                        alt={categoryName}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <span className="text-blue-400 text-2xl">📂</span>
                      </div>
                    )}
                    {/* Category Name with Bottom Gradient Overlay for Mobile */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-2"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                        height: '40px'
                      }}
                    >
                      <span className="text-white font-semibold text-xs text-center truncate px-1">
                        {categoryName}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
