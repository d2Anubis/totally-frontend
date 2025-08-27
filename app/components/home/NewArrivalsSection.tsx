"use client";

import { useEffect, useState } from "react";
import ProductSection from "../common/ProductSection";
import {
  getAllProducts,
  Product as ApiProduct,
} from "@/app/lib/services/productService";
import { Product } from "../common/ProductSection";

const NewArrivalsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiResponse = await getAllProducts({
          limit: 20,
          sort: "newest",
          status: "active",
        });

        if (apiResponse && apiResponse.products) {
          // Transform API products to match the Product interface used in ProductSection
          const transformedProducts: Product[] = apiResponse.products
            // Take only the first 5 products (already sorted by newest)
            .slice(0, 5)
            .map((product: ApiProduct) => {
              const slug =
                product.page_url ||
                product.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");

              return {
                id: product.id.toString(), // Convert to string ID for consistency
                title: product.title,
                imageUrl: product.image_url || "/images/common/new_arrival.png", // Backend now provides image_url directly
                price: product.price || 0, // Handle null price
                originalPrice: product.compare_price || undefined, // Backend handles compare_price logic
                discount: product.discount || undefined, // Backend calculates discount
                brand: product.brand,
                rating: product.rating || 0, // Default rating since API doesn't provide it
                url: `/product/${slug}/?productid=${product.id}`,
                isQuickShip: product.in_stock, // Backend calculates in_stock
                isSale: product.is_sale, // Backend calculates is_sale
                variant_id: product.variant_id || undefined, // Include variant_id from backend
                option_values:
                  (
                    product as ApiProduct & {
                      option_values?: { [key: string]: string };
                    }
                  ).option_values || undefined, // Include variant option values
              };
            });

          setProducts(transformedProducts);
        }
      } catch (err) {
        setError("Failed to fetch new arrivals");
        console.error("Error fetching new arrivals:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading new arrivals...</div>;
  }

  return (
    <ProductSection
      title="New Arrivals"
      products={products}
      categoryUrl="/category/new-arrivals"
    />
  );
};

export default NewArrivalsSection;
