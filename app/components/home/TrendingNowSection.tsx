"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import {
  getTrendingCategoriesWithProducts,
  CategoryWithProducts,
  Product,
} from "@/app/lib/services/collectionService";

const TrendingNowSection = () => {
  const [trendingCategories, setTrendingCategories] = useState<
    CategoryWithProducts[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to determine screen size and products to show
  const getProductsToShow = () => {
    if (typeof window === "undefined") return 2; // SSR fallback

    const width = window.innerWidth;
    if (width >= 1536) return 6; // 2xl: show 6 products
    if (width >= 1280) return 5; // xl: show 5 products
    if (width >= 1024) return 4; // lg: show 4 products
    if (width >= 768) return 3; // md: show 3 products
    return 2; // mobile: show 2 products
  };

  const [productsToShow, setProductsToShow] = useState(2);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setProductsToShow(getProductsToShow());
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch trending categories and products on component mount
  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setLoading(true);
        const data = await getTrendingCategoriesWithProducts();

        if (data && data.length > 0) {
          setTrendingCategories(data);
        } else {
          setError("No trending categories found");
        }
      } catch (err) {
        console.error("Error fetching trending data:", err);
        setError("Failed to load trending categories");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  // Transform API Product to ProductCard props - now uses optimized backend data
  const transformProduct = (product: Product) => {
    const slug = product.page_url || product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    return {
      id: product.id,
      title: product.title,
      imageUrl: product.image_url || "/images/common/new_arrival.png", // Backend now provides image_url directly
      price: product.price || 0, // Handle null price
      originalPrice: product.compare_price || undefined, // Backend handles compare_price logic
      discount: product.discount || undefined, // Backend calculates discount
      url: `/product/${slug}/?productid=${product.id}`,
      brand: product.brand,
      rating: 0, // Placeholder rating (Product type doesn't have rating)
      isQuickShip: product.in_stock, // Backend calculates in_stock
      isSale: product.is_sale, // Backend calculates is_sale
      variant_id: product.variant_id || undefined, // Include variant_id from backend
      option_values: (product as Product & { option_values?: { [key: string]: string } }).option_values || undefined, // Include variant option values
    };
  };

  // Show loading state
  if (loading) {
    return (
      <section className="mb-6 md:mb-8 bg-white rounded-2xl px-4 md:px-6 py-4 md:py-6">
        <div className="text-center mb-4 md:mb-6">
          <h2 className="title-1-semibold md:heading-1-semibold text-blue-00">
            What&apos;s Trending Now
          </h2>
          <p className="hidden md:block body-medium md:title-2-semibold text-black">
            Your One-Stop Destination for Online Shopping from India
          </p>
        </div>
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-500">Loading trending products...</p>
        </div>
      </section>
    );
  }

  // Don't render the section if there's an error or no trending categories
  if (error || trendingCategories.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 md:mb-8 bg-white rounded-2xl px-4 md:px-6 py-4 md:py-6">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="title-1-semibold md:heading-1-semibold text-blue-00">
          What&apos;s Trending Now
        </h2>
        <p className="hidden md:block body-medium md:title-2-semibold text-black">
          Your One-Stop Destination for Online Shopping from India
        </p>
      </div>

      {/* Limit to first 6 categories */}
      {trendingCategories.slice(0, 6).map((category) => (
        <div key={category.id} className="mb-4 md:mb-8">
          <div className="flex gap-2 md:gap-4 items-center justify-between mb-3 md:mb-4">
            <h3 className="title-2 md:title-1">{category.title}</h3>
            <Link
              href={`/category/${category.title
                .toLowerCase()
                .replace(/\s+/g, "-")}/all?id=${
                category.id
              }&subcategory=${encodeURIComponent(category.title)}&type=category&trending=true`}
              className="hidden md:flex items-center body-medium md:body-large-semibold text-blue-00 hover:underline bg-blue-110 rounded-lg px-2 md:px-4 py-1"
            >
              <span className="">View All</span>
              <FontAwesomeIcon icon={faArrowRight} className="ml-1 md:ml-2" />
            </Link>
          </div>

          {/* Responsive single row - products limited by screen size */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-3">
            {category.products
              .slice(0, productsToShow) // Only render the number of products that fit in one row
              .map((product) => {
                const transformedProduct = transformProduct(product);

                return (
                  <ProductCard
                    key={product.id}
                    id={transformedProduct.id}
                    title={transformedProduct.title}
                    imageUrl={transformedProduct.imageUrl}
                    price={transformedProduct.price}
                    originalPrice={transformedProduct.originalPrice}
                    discount={transformedProduct.discount}
                    url={transformedProduct.url}
                    brand={transformedProduct.brand}
                    rating={transformedProduct.rating}
                    isQuickShip={transformedProduct.isQuickShip}
                    isSale={transformedProduct.isSale}
                    variant_id={transformedProduct.variant_id}
                    option_values={transformedProduct.option_values}
                  />
                );
              })}
          </div>

          <Link
            href={`/category/${category.title
              .toLowerCase()
              .replace(/\s+/g, "-")}?id=${
              category.id
            }&category=${encodeURIComponent(category.title)}&trending=true`}
            className="w-full text-blue-00 bg-blue-100 body-large-bold flex md:hidden justify-center items-center rounded-lg py-2"
          >
            <div className="stack relative flex mr-2">
              <Image
                src="/images/common/see_all.png"
                height={20}
                width={20}
                alt="see all"
                className="object-cover rounded-full border-2 border-blue-00 w-8 h-8"
              />
              <Image
                src="/images/common/see_all.png"
                height={20}
                width={20}
                alt="see all"
                className="object-cover rounded-full border-2 border-blue-00 w-8 h-8 -ml-5"
              />
              <Image
                src="/images/common/see_all.png"
                height={20}
                width={20}
                alt="see all"
                className="object-cover rounded-full border-2 border-blue-00 w-8 h-8 -ml-5"
              />
            </div>
            <span>See all Products</span>
            <FontAwesomeIcon icon={faChevronRight} className="ml-1 md:ml-2" />
          </Link>
        </div>
      ))}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default TrendingNowSection;
