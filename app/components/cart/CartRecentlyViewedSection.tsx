"use client";

import { useEffect, useState, useMemo } from "react";
import ProductSection, { Product } from "../common/ProductSection";
import {
  getRecentlyViewedProducts,
  removeFromRecentlyViewed,
  RecentlyViewedItem,
} from "@/app/lib/services/productService";
import { useAuth } from "@/app/context/AuthContext";
import { useShop, CartItemUnion } from "@/app/context/ShopContext";

const CartRecentlyViewedSection = () => {
  const { isLoggedIn } = useAuth();
  const { cart } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize cart product IDs to avoid unnecessary re-renders
  const cartProductIds = useMemo(() => {
    return new Set(cart.map((item: CartItemUnion) => {
      // Handle both server cart items (with Variant) and guest cart items (with Product)
      if ('Variant' in item && item.Variant?.Product?.id) {
        return item.Variant.Product.id;
      } else if ('Product' in item && item.Product?.id) {
        return item.Product.id;
      }
      return null;
    }).filter(Boolean)); // Filter out null values
  }, [cart]);

  useEffect(() => {
    // Only fetch recently viewed products if user is logged in
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    const fetchRecentlyViewed = async () => {
      try {
        setIsLoading(true);
        const recentlyViewedItems = await getRecentlyViewedProducts(20); // Get more items initially to account for filtering

        if (recentlyViewedItems && recentlyViewedItems.length > 0) {
          // Filter out products that are in the cart and collect their IDs for removal
          const productsToRemove: string[] = [];
          const filteredItems = recentlyViewedItems.filter(
            (item: RecentlyViewedItem) => {
              if (cartProductIds.has(item.id)) {
                productsToRemove.push(item.id);
                return false; // Filter out this product
              }
              return true; // Keep this product
            }
          );

          // Remove cart products from recently viewed list via API (in background)
          if (productsToRemove.length > 0) {
            console.log(
              `Removing ${productsToRemove.length} products from recently viewed (already in cart)`
            );
            // Remove in background without waiting or showing errors to user
            productsToRemove.forEach((productId) => {
              removeFromRecentlyViewed(productId, true).catch((error) => {
                console.warn(
                  `Failed to remove product ${productId} from recently viewed:`,
                  error
                );
              });
            });
          }

          // Transform remaining API products to match the Product interface used in ProductSection
          const transformedProducts: Product[] = filteredItems
            .slice(0, 10) // Limit to 10 products after filtering
            .map((item: RecentlyViewedItem) => {
              // The API now returns the product data directly, not nested under Product
              const product = item;

              // Create slug from product title
              const createSlug = (title: string): string => {
                return title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
              };

              const slug = product.page_url || createSlug(product.title);

              // Handle null price by providing a default value
              const price = product.price || 0;
              const comparePrice = product.compare_price || null;

              return {
                id: product.id.toString(), // Convert to string ID for consistency
                title: product.title,
                imageUrl:
                  product.image_urls && product.image_urls.length > 0
                    ? product.image_urls[0].url
                    : "/images/common/product.png", // Use first image or fallback
                price: price,
                originalPrice:
                  comparePrice && comparePrice > price
                    ? comparePrice
                    : undefined, // Only show original price if it's actually higher
                discount:
                  comparePrice && comparePrice > price
                    ? Math.round(
                        ((comparePrice - price) / comparePrice) * 100
                      )
                    : undefined, // Only calculate discount if compare_price is actually higher
                brand: product.brand || "Unknown Brand", // Use actual brand field
                rating: product.rating || 0, // Default rating since API doesn't provide it
                url: `/product/${slug}/?productid=${product.id}`, // Use slug in URL path and productid in query
                variant_id: product.variant_id || undefined, // Include variant_id for cart operations
                isQuickShip: product.stock_qty > 0, // Use stock_qty field
                isSale: !!(comparePrice && comparePrice > price), // Only mark as sale if there's actually a discount
              };
            });

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
  }, [isLoggedIn, cartProductIds]); // Include cartProductIds as dependency

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
    return null; // Don't show anything if no products
  }

  // Show products using ProductSection
  return (
    <ProductSection
      title="You Might Also Like"
      products={products}
      categoryUrl="/collections/recently-viewed"
    />
  );
};

export default CartRecentlyViewedSection;
