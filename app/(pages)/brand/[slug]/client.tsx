"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import CustomerReviews from "@/app/components/product/CustomerReviews";
import BrandHero from "@/app/components/brand/BrandHero";
import ProductBanners from "@/app/components/brand/ProductBanners";
import ProductCard from "@/app/components/home/ProductCard";
import Link from "next/link";
import { Brand } from "./data";

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

interface BrandPageClientContentProps {
  slug: string;
  brandData: Brand;
  groupedProducts: Record<string, Product[]>;
  productBanners: {
    id: number;
    alt: string;
    image: string;
  }[];
}

export function BrandPageClientContent({
  slug,
  brandData,
  groupedProducts,
  productBanners,
}: BrandPageClientContentProps) {
  // State for active category
  const [activeCategory, setActiveCategory] = useState("pharmaceuticals");

  // Ref for swipable tabs container
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Touch event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartXRef.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndX;

    // Minimum swipe distance (px)
    const minSwipeDistance = 50;

    if (Math.abs(diffX) < minSwipeDistance) return;

    const currentIndex = categories.findIndex(
      (cat) => cat.id === activeCategory
    );
    if (diffX > 0 && currentIndex < categories.length - 1) {
      // Swipe left, go to next category
      setActiveCategory(categories[currentIndex + 1].id);
    } else if (diffX < 0 && currentIndex > 0) {
      // Swipe right, go to previous category
      setActiveCategory(categories[currentIndex - 1].id);
    }

    touchStartXRef.current = null;
  };

  // Category tabs
  const categories = [
    { id: "pharmaceuticals", name: "Pharmaceuticals" },
    { id: "personal-care", name: "Personal Care" },
    { id: "baby-care", name: "Baby Care" },
    { id: "mens-wellness", name: "Men's Wellness" },
    { id: "womens-wellness", name: "Women's Wellness" },
    { id: "body-care", name: "Body Care" },
    { id: "oral-health", name: "Oral Health" },
  ];

  // Scroll to the active tab when it changes
  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeTabElement = tabsContainerRef.current.querySelector(
        `button[data-id="${activeCategory}"]`
      );

      if (activeTabElement) {
        const containerWidth = tabsContainerRef.current.offsetWidth;
        const tabLeft = (activeTabElement as HTMLElement).offsetLeft;
        const tabWidth = (activeTabElement as HTMLElement).offsetWidth;

        // Center the active tab
        tabsContainerRef.current.scrollTo({
          left: tabLeft - containerWidth / 2 + tabWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeCategory]);

  // Get available categories that have products for this brand
  const availableCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        groupedProducts[category.id] && groupedProducts[category.id].length > 0
    );
  }, [groupedProducts]);

  // Set active category to first available category by default
  useEffect(() => {
    if (
      availableCategories.length > 0 &&
      !groupedProducts[activeCategory]?.length
    ) {
      setActiveCategory(availableCategories[0].id);
    }
  }, [availableCategories, groupedProducts, activeCategory]);

  // Get current products based on active category
  const currentProducts = groupedProducts[activeCategory] || [];

  // Check if any products exist for this brand
  const hasBrandProducts = Object.values(groupedProducts).some(
    (products) => products.length > 0
  );

  // If no products found for this brand, show a message
  if (!hasBrandProducts) {
    // Fall back to displaying some products even if this brand doesn't have specific products
    return (
      <div className="py-4">
        {/* Brand Banner Section */}
        <BrandHero name={brandData.name} bannerUrl={brandData.bannerImage} />

        <div className="bg-white rounded-xl p-6 mb-6 text-center">
          <h2 className="title-2 text-blue-00 mb-4">
            No products found for {brandData.name}
          </h2>
          <p className="title-4-medium text-gray-10 mb-8">
            We&apos;re currently updating our catalog. Please check back soon
            for products from {brandData.name}.
          </p>
          <Link
            href="/"
            className="bg-blue-00 text-white py-3 px-6 rounded-md small-semibold hover:bg-blue-10 transition-colors duration-300 inline-block"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Product Banners */}
        <ProductBanners banners={productBanners} />
      </div>
    );
  }

  // Render content for the brand page
  const renderProductsContent = () => {
    if (currentProducts.length === 0) {
      return (
        <div className="bg-white rounded-xl p-6 text-center">
          <p className="title-3-medium text-gray-10">
            No products found in this category for {brandData.name}.
          </p>
          <p className="small-medium text-gray-80 mt-2">
            Please try another category or check back later.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {currentProducts.map((product: Product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              imageUrl={product.imageUrl}
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discount}
              url={product.url}
              brand={product.brand}
              rating={product.rating}
              isQuickShip={product.isQuickShip}
              isSale={product.isSale}
            />
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Link
            href={`/brand/${slug}/category/${activeCategory}`}
            className="bg-blue-100 text-blue-00 px-5 py-2 rounded-lg button hover:bg-blue-00 hover:text-white transition-colors"
          >
            View All
          </Link>
        </div>
      </>
    );
  };

  return (
    <div className="py-0 md:py-4">
      {/* Brand Banner Section */}
      <BrandHero name={brandData.name} bannerUrl={brandData.bannerImage} />

      <div className="">
        {/* Tab navigation with full-width underline */}
        <div className="bg-white rounded-xl p-3 md:p-6 mb-6">
          <div className="relative">
            <div
              ref={tabsContainerRef}
              className="flex justify-left md:justify-center overflow-x-auto scrollbar-hide mb-6 bg-white gap-2 md:gap-6"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {availableCategories.length > 0 ? (
                availableCategories.map((category) => (
                  <button
                    key={category.id}
                    data-id={category.id}
                    className={`whitespace-nowrap px-2 md:px-4 py-2 title-4-medium relative ${
                      activeCategory === category.id
                        ? "text-blue-00"
                        : "text-gray-80"
                    }`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                    {activeCategory === category.id && (
                      <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-00 z-10"></span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-gray-80 title-4-medium">
                  No categories available
                </div>
              )}
            </div>
            {/* Full width gray line */}
            <div className="absolute bottom-[1.5px] left-0 right-0 h-[2px] bg-blue-100"></div>
          </div>

          {/* Products Grid using ProductCard */}
          <div className="mt-8 mb-4">{renderProductsContent()}</div>
        </div>

        {/* Product Banners */}
        <ProductBanners banners={productBanners} />

        {/* Customer Reviews Section */}
        <CustomerReviews productId={slug} reviewCount={brandData.reviewCount} />
      </div>
    </div>
  );
}
