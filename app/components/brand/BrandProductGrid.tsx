"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import Image from "next/image";
import Link from "next/link";

export interface Product {
  id: number;
  title: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  brand: string;
  rating: number;
  url: string;
  isQuickShip?: boolean;
  isSale?: boolean;
}

interface BrandProductGridProps {
  products: Product[];
}

export default function BrandProductGrid({ products }: BrandProductGridProps) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg overflow-hidden flex flex-col relative"
          >
            <div className="relative bg-blue-100 rounded-lg">
              {/* QuickShip Label */}
              {product.isQuickShip && (
                <div className="absolute top-0 left-0 right-0 bg-highlight-10 text-highlight-20 xsmall-semibold py-1 px-3 text-center z-10">
                  QuickShip
                </div>
              )}

              {/* Sale Label */}
              {product.isSale && (
                <div className="absolute top-2 left-2 bg-highlight-50 text-white xxsmall-semibold py-0.5 px-2 rounded z-10">
                  Sale
                </div>
              )}

              {/* Wishlist Button */}
              <button className="absolute top-2 right-2 z-10">
                <FontAwesomeIcon
                  icon={faHeartRegular}
                  className="text-gray-90 hover:text-highlight-20"
                  size="lg"
                />
              </button>

              {/* Product Image */}
              <Link href={product.url} className="block pt-8">
                <div className="relative h-40 w-full">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </Link>

              {/* Add to Cart Button */}
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-blue-00 rounded-full flex items-center justify-center text-white z-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            {/* Product Info */}
            <div className="p-3">
              {/* Price Information */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline">
                  <span className="title-4-semibold text-highlight-50">
                    ₹ {product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="ml-2 text-gray-20 line-through text-xs">
                      ₹ {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {product.discount && (
                    <span className="ml-1 text-highlight-40 text-xs font-semibold">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faStar}
                    className="text-highlight-50"
                    size="xs"
                  />
                  <span className="text-xs ml-1">{product.rating}</span>
                </div>
              </div>

              {/* Product Title */}
              <Link href={product.url}>
                <h3 className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2 min-h-[40px]">
                  {product.title}
                </h3>
              </Link>

              {/* Brand */}
              <div className="text-xs text-gray-20 mt-1">{product.brand}</div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-8">
        <button className="bg-white text-blue-00 border border-blue-00 px-5 py-2 rounded-lg button hover:bg-blue-00 hover:text-white transition-colors">
          View All
        </button>
      </div>
    </div>
  );
}
