"use client";

import { useState, useEffect, ReactNode } from "react";
import ProductCard from "@/app/components/home/ProductCard";
import { CategoryProduct } from "@/app/data/categoryProducts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";

export interface FilterState {
  priceRange: string;
  rating: string;
  isSale: boolean;
  brands?: string[];
  priceFrom?: string;
  priceTo?: string;
  inStock?: boolean;
  outStock?: boolean;
}

interface CategoryProductGridProps {
  products: CategoryProduct[];
  filters: FilterState;
  sortOption: string;
  loading?: boolean;
}

export default function CategoryProductGrid({
  products,
  filters,
  sortOption,
  loading = false,
}: CategoryProductGridProps) {
  const [filteredProducts, setFilteredProducts] =
    useState<CategoryProduct[]>(products);

  // Apply filters and sorting whenever they change
  useEffect(() => {
    let result = [...products];

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange
        .split("-")
        .map((val) => parseInt(val));
      if (min && max) {
        result = result.filter(
          (product) => product.price >= min && product.price <= max
        );
      } else if (min) {
        // Handle ranges like "1000+"
        result = result.filter((product) => product.price >= min);
      }
    }

    // Apply rating filter
    if (filters.rating) {
      const minRating = parseInt(filters.rating);
      result = result.filter((product) => product.rating >= minRating);
    }

    // Apply brand filter
    if (filters.brands && filters.brands.length > 0) {
      result = result.filter((product) =>
        filters.brands?.includes(product.brand)
      );
    }

    // QuickShip filter removed - no longer supported

    // Apply Sale filter
    if (filters.isSale) {
      result = result.filter((product) => product.isSale);
    }

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      // Default is popularity (no sorting needed as data is already in this order)
    }

    setFilteredProducts(result);
  }, [products, filters, sortOption]);

  // Function to render products only (no ads)
  const renderProducts = (): ReactNode[] => {
    return filteredProducts.map((product) => (
      <ProductCard
        key={`product-${product.id}`}
        id={product.apiProductId || product.id.toString()}
        title={product.title}
        imageUrl={product.imageUrl}
        price={product.price}
        originalPrice={product.originalPrice}
        discount={product.discount}
        url={product.url}
        brand={product.brand}
        rating={product.rating}
        isSale={product.isSale}
        variant_id={product.variant_id}
        option_values={product.option_values}
      />
    ));
  };

  return (
    <div className="bg-white p-4 rounded-xl min-h-56">
      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-500">Loading products...</div>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
              {renderProducts()}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl text-center">
              <FontAwesomeIcon
                icon={faBoxOpen}
                className="text-gray-100 text-5xl"
              />
              <p className="heading-3-semibold text-gray-10">
                No products found
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
