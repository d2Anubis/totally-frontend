"use client";

import { useEffect, useState } from "react";
import ProductSection, { Product } from "../common/ProductSection";
import {
  getRecentlyViewedProducts,
  RecentlyViewedItem,
} from "@/app/lib/services/productService";
import { useAuth } from "@/app/context/AuthContext";

const RecentlyViewedSection = () => {
  const { isLoggedIn } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch recently viewed products if user is logged in
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    const fetchRecentlyViewed = async () => {
      try {
        setIsLoading(true);
        const recentlyViewedItems = await getRecentlyViewedProducts(10); // Get first 10 products

        if (recentlyViewedItems && recentlyViewedItems.length > 0) {
          // Transform API products to match the Product interface used in ProductSection
          const transformedProducts: Product[] = recentlyViewedItems.map(
            (item: RecentlyViewedItem) => {
              // The API now returns the product data in the correct format
              return {
                id: item.id.toString(), // Convert to string ID for consistency
                title: item.title,
                imageUrl: item.imageUrl, // Use imageUrl directly from backend
                price: item.price,
                originalPrice: item.originalPrice, // Use originalPrice from backend
                discount: item.discount || undefined, // Use discount from backend, convert null to undefined
                brand: item.brand,
                rating: item.rating,
                url: item.url,
                variant_id: item.variant_id || undefined, // Convert null to undefined
                option_values: item.option_values || undefined, // Include option_values for variant selection, convert null to undefined
                isQuickShip: item.isQuickShip,
                isSale: item.isSale,
              };
            }
          );

          console.log("transformedProducts", transformedProducts);

          setProducts(transformedProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError("Failed to fetch recently viewed products");
        console.error("Error fetching recently viewed products:", err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [isLoggedIn]);

  // Don't render anything if user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Recently Viewed Products
          </h2>
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading recently viewed products...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Recently Viewed Products
          </h2>
          <div className="flex items-center justify-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state with a nice message
  if (products.length === 0) {
    return null;
  }

  // Show products using ProductSection
  return (
    <ProductSection
      title="Recently Viewed Products"
      products={products}
      categoryUrl="/collections/recently-viewed"
    />
  );
};

export default RecentlyViewedSection;
