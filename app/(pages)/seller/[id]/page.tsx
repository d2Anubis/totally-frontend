"use client";

import { Suspense } from "react";
import Breadcrumb from "@/app/components/common/Breadcrumb";
import Image from "next/image";
import { Product } from "@/app/components/common/ProductSection";
import CustomerReviews from "@/app/components/product/CustomerReviews";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faChevronDown,
  faCheck,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

function SellerPageContent({ id }: { id: string }) {
  // Sample seller data
  const sellerData = {
    id,
    name: "Loxpal",
    logo: "/images/brand/store.png",
    description: "Official store for authentic Ayurvedic products",
    categories: ["Health & Wellness", "Ayurveda"],
    rating: 4.5,
    reviewCount: 115,
  };

  // Sample brand filters
  const brands = [
    { name: "Dhootapapeshwar", count: 50 },
    { name: "Himalaya Wellness", count: 14 },
    { name: "Maharishi Ayurveda", count: 8 },
    { name: "Patanjali Ayurved Limited", count: 22 },
    { name: "Shree Baidyanath Ayurved", count: 29 },
  ];

  // Sample products
  const healthProducts: Product[] = [
    {
      id: 1,
      title: "Vridhavan Dhoop Sticks - Vrindavan",
      imageUrl: "/images/common/new_arrival.png",
      price: 150.0,
      originalPrice: 300.0,
      discount: 50,
      brand: "Vridhavan",
      rating: 4.8,
      url: "/products/dhoop-sticks",
      isQuickShip: true,
      isSale: true,
    },
    {
      id: 2,
      title: "Himalaya Triphala Guggulu Tablets",
      imageUrl: "/images/common/new_arrival.png",
      price: 450.0,
      originalPrice: 500.0,
      discount: 10,
      brand: "Himalaya Wellness",
      rating: 4.5,
      url: "/products/triphala-guggulu",
      isQuickShip: true,
      isSale: false,
    },
    {
      id: 3,
      title: "LIV.52 Tablets",
      imageUrl: "/images/common/new_arrival.png",
      price: 235.0,
      originalPrice: 280.0,
      discount: 16,
      brand: "Himalaya Wellness",
      rating: 4.7,
      url: "/products/liv-52",
      isQuickShip: false,
      isSale: true,
    },
    {
      id: 4,
      title: "Ayurveda Herbs Daily Support Capsules",
      imageUrl: "/images/common/new_arrival.png",
      price: 355.0,
      originalPrice: 420.0,
      discount: 15,
      brand: "Patanjali",
      rating: 4.3,
      url: "/products/daily-support",
      isQuickShip: true,
      isSale: false,
    },
    {
      id: 5,
      title: "Woolen Blanket - Handmade Cushion Cover",
      imageUrl: "/images/common/new_arrival.png",
      price: 449.0,
      originalPrice: 599.0,
      discount: 25,
      brand: "Ayuda Homes",
      rating: 4.6,
      url: "/products/woolen-blanket",
      isQuickShip: true,
      isSale: true,
    },
  ];

  // Duplicate the products to show more in the grid
  const allProducts = [
    ...healthProducts,
    ...healthProducts.map((p) => ({ ...p, id: p.id + 5 })),
    ...healthProducts.map((p) => ({ ...p, id: p.id + 10 })),
  ];

  return (
    <div className="py-6">
      <div className="main-container">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", url: "/" },
            { label: "Sellers", url: "/sellers" },
            { label: sellerData.name, url: `/seller/${id}` },
          ]}
        />

        <h1 className="title-1-bold mb-4 mt-4">
          Products Sold By {sellerData.name}
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="md:w-[250px] bg-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="title-4-semibold">Filter :</h2>
              <FontAwesomeIcon icon={faFilter} className="text-gray-80" />
            </div>

            {/* Brands Filter */}
            <div className="border-b border-gray-40 pb-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="title-4-semibold">Brands</h3>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-gray-80"
                />
              </div>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div key={brand.name} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`brand-${brand.name}`}
                      className="hidden"
                    />
                    <label
                      htmlFor={`brand-${brand.name}`}
                      className="flex items-center cursor-pointer"
                    >
                      <div className="w-4 h-4 border border-gray-40 rounded mr-2 flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faCheck}
                          className={`text-blue-00 text-xs ${
                            brand.name === "Dhootapapeshwar"
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                      </div>
                      <span className="small-medium text-gray-90">
                        {brand.name} ({brand.count})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <button className="small-medium text-blue-00 mt-2">
                Show more
              </button>
            </div>

            {/* Price Filter */}
            <div className="border-b border-gray-40 pb-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="title-4-semibold">Price</h3>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-gray-80"
                />
              </div>
              <p className="small-medium text-gray-90 mb-2">
                The highest price is Rs.8,025.00
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="From"
                    className="w-full py-2 px-3 border border-gray-40 rounded text-sm"
                  />
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="To"
                    className="w-full py-2 px-3 border border-gray-40 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Availability Filter */}
            <div className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="title-4-semibold">Availability</h3>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-gray-80"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="in-stock" className="hidden" />
                  <label
                    htmlFor="in-stock"
                    className="flex items-center cursor-pointer"
                  >
                    <div className="w-4 h-4 border border-gray-40 rounded mr-2 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-blue-00 text-xs opacity-100"
                      />
                    </div>
                    <span className="small-medium text-gray-90">
                      In Stock (36)
                    </span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="out-stock" className="hidden" />
                  <label
                    htmlFor="out-stock"
                    className="flex items-center cursor-pointer"
                  >
                    <div className="w-4 h-4 border border-gray-40 rounded mr-2 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-blue-00 text-xs opacity-0"
                      />
                    </div>
                    <span className="small-medium text-gray-90">
                      Out Stock (1)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden flex flex-col relative"
                >
                  <div className="relative top bg-blue-100 rounded-lg">
                    {/* Quick Ship Label */}
                    {product.isQuickShip && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-highlight-10 text-highlight-20 xsmall-semibold py-1 px-3 rounded-b-lg">
                        QuickShip
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-10 bg-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>

                    {/* Product Image */}
                    <Link href={product.url} className="block aspect-square">
                      <div className="relative w-full h-[180px]">
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-contain p-4"
                        />
                      </div>
                    </Link>

                    {/* Add to Cart Button */}
                    <button className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-blue-00 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                    {product.isSale && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-highlight-30 text-highlight-40 xsmall-semibold py-1 px-3 rounded-t-lg">
                        Sale
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    {/* Price and Rating */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-baseline">
                        <span className="title-4-semibold text-highlight-50">
                          ₹ {product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="ml-2 xsmall-medium text-gray-30 line-through">
                            ₹ {product.originalPrice.toFixed(2)}
                          </span>
                        )}
                        {product.discount && (
                          <span className="ml-1 xsmall-bold text-highlight-40">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faStar}
                          className="text-highlight-50 text-sm mr-1"
                        />
                        <span className="xsmall-semibold text-gray-10">
                          {product.rating}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <Link href={product.url} className="block">
                      <h3 className="small-semibold text-black line-clamp-2 hover:text-blue-00 transition-colors min-h-[40px]">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Brand */}
                    <p className="xsmall text-gray-20 mt-1">{product.brand}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button className="bg-white text-blue-00 border border-blue-00 px-4 py-2 rounded-lg button">
                View All
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <CustomerReviews productId={id} reviewCount={sellerData.reviewCount} />

        {/* Recommendations Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="title-2">Recommendation For You</h2>
            <button className="text-blue-00 small-medium">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {healthProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg overflow-hidden flex flex-col relative"
              >
                {product.isSale && (
                  <div className="absolute top-2 left-2 bg-highlight-50 text-white xxsmall-semibold py-0.5 px-2 rounded">
                    SALE
                  </div>
                )}
                {/* Product Image */}
                <Link href={product.url} className="block aspect-square">
                  <div className="relative w-full h-[180px]">
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-3">
                  <div className="flex items-baseline">
                    <span className="title-4-semibold text-highlight-50">
                      ₹ {product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="ml-2 xsmall-medium text-gray-30 line-through">
                        ₹ {product.originalPrice.toFixed(2)}
                      </span>
                    )}
                    {product.discount && (
                      <span className="ml-1 xsmall-bold text-highlight-40">
                        -{product.discount}%
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link href={product.url} className="block">
                    <h3 className="small-semibold text-black line-clamp-2 hover:text-blue-00 transition-colors mt-1">
                      {product.title}
                    </h3>
                  </Link>

                  <div className="flex items-center mt-1">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="text-highlight-50 text-sm mr-1"
                    />
                    <span className="xsmall-semibold text-gray-10">
                      {product.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Viewed Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="title-2">Recently Viewed Products</h2>
            <button className="text-blue-00 small-medium">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {healthProducts.map((product) => (
              <div
                key={product.id + "-recent"}
                className="bg-white rounded-lg overflow-hidden flex flex-col relative"
              >
                {product.isSale && (
                  <div className="absolute top-2 left-2 bg-highlight-50 text-white xxsmall-semibold py-0.5 px-2 rounded">
                    SALE
                  </div>
                )}
                {/* Product Image */}
                <Link href={product.url} className="block aspect-square">
                  <div className="relative w-full h-[180px]">
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-3">
                  <div className="flex items-baseline">
                    <span className="title-4-semibold text-highlight-50">
                      ₹ {product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="ml-2 xsmall-medium text-gray-30 line-through">
                        ₹ {product.originalPrice.toFixed(2)}
                      </span>
                    )}
                    {product.discount && (
                      <span className="ml-1 xsmall-bold text-highlight-40">
                        -{product.discount}%
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link href={product.url} className="block">
                    <h3 className="small-semibold text-black line-clamp-2 hover:text-blue-00 transition-colors mt-1">
                      {product.title}
                    </h3>
                  </Link>

                  <div className="flex items-center mt-1">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="text-highlight-50 text-sm mr-1"
                    />
                    <span className="xsmall-semibold text-gray-10">
                      {product.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SellerPageContent id={params.id} />
    </Suspense>
  );
}
