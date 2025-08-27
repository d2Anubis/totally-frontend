"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PriceDisplay from "@/app/components/common/PriceDisplay";
import {
  faTrash,
  faPlus,
  faMinus,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useShop, CartItemUnion } from "@/app/context/ShopContext";
import { useAuth } from "@/app/context/AuthContext";
import CartRecentlyViewedSection from "@/app/components/cart/CartRecentlyViewedSection";

// Cart Item Component
const CartItem = ({ item }: { item: CartItemUnion }) => {
  const { removeFromCart, increaseQuantity, decreaseQuantity } = useShop();
  const [quantity, setQuantity] = useState(item.quantity);

  // Sync local quantity state with cart item quantity
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  // Handle both server cart items (with Variant) and guest cart items (with Product)
  const isServerCartItem = "Variant" in item;

  // Helper function to create a slug from title (same as RecentlyViewedSection)
  const createSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Get the product URL for redirection (following RecentlyViewedSection pattern)
  const getProductUrl = () => {
    if (isServerCartItem) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const serverItem = item as any;
      const product = serverItem.Variant?.Product;

      if (!product) return "#";

      // Use the saved URL if available, otherwise construct it
      if (product.url) {
        return product.url;
      }

      // Construct URL like RecentlyViewedSection
      const slug = product.page_url || createSlug(product.title);
      return `/product/${slug}/?productid=${product.id}`;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const guestItem = item as any;
      const product = guestItem.Product;

      if (!product) {
        console.warn("Guest cart item missing Product data:", guestItem);
        return "#";
      }

      // Debug logging to see what's available
      console.log("Guest cart product data:", {
        id: product.id,
        title: product.title,
        url: product.url,
        page_url: product.page_url,
      });

      // Use the saved URL if available
      if (product.url) {
        console.log("Using saved URL:", product.url);
        return product.url;
      }

      // For guest cart items, if we don't have url or page_url,
      // construct a basic product URL using the product title
      if (product.page_url) {
        const constructedUrl = `/product/${product.page_url}/?productid=${product.id}`;
        console.log("Using page_url to construct:", constructedUrl);
        return constructedUrl;
      }

      // Fallback: construct URL using slug from title
      const slug = createSlug(product.title || "product");
      const fallbackUrl = `/product/${slug}/?productid=${product.id}`;
      console.log("Using fallback URL construction:", fallbackUrl);
      return fallbackUrl;
    }
  };

  // Use compare_price as the original price, fallback to price if not available
  const originalPrice = isServerCartItem
    ? (() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serverItem = item as any; // Server cart item with Variant
        return (
          (serverItem.Variant?.compare_price
            ? Number(serverItem.Variant.compare_price)
            : 0) || Number(serverItem.Variant?.price || item.price)
        );
      })()
    : (() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const guestItem = item as any; // Guest cart item with Product
        return (
          (guestItem.Product?.compare_price
            ? Number(guestItem.Product.compare_price)
            : 0) || Number(guestItem.Product?.price || item.price)
        );
      })();

  const currentPrice = Number(item.price);

  // Get the first image URL
  const getProductImageUrl = () => {
    if (isServerCartItem) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const serverItem = item as any; // Server cart item with Variant
      // Server cart item: try variant images first, then product default images
      if (
        serverItem.Variant?.image_urls &&
        serverItem.Variant.image_urls.length > 0
      ) {
        return serverItem.Variant.image_urls[0].url;
      }
      if (
        serverItem.Variant?.Product?.default_image_urls &&
        serverItem.Variant.Product.default_image_urls.length > 0
      ) {
        return serverItem.Variant.Product.default_image_urls[0].url;
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const guestItem = item as any; // Guest cart item with Product
      // Guest cart item: use product images
      if (
        guestItem.Product?.image_urls &&
        guestItem.Product.image_urls.length > 0
      ) {
        return guestItem.Product.image_urls[0].url;
      }
    }
    return undefined;
  };

  const handleDecreaseQuantity = async () => {
    if (quantity > 1) {
      await decreaseQuantity(item.id, 1);
    } else {
      // If quantity is 1, remove the item entirely
      await removeFromCart(item.id);
    }
  };

  const handleIncreaseQuantity = async () => {
    await increaseQuantity(item.id, 1);
  };

  const handleRemoveItem = async () => {
    await removeFromCart(item.id);
  };

  // Calculate discount percentage
  const discountPercentage =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  return (
    <div className="flex items-start border-t border-gray-200 py-5">
      <div className="relative flex-shrink-0 bg-blue-100 rounded-lg w-[100px] h-[100px] md:w-[150px] md:h-[150px]">
        <Image
          src={getProductImageUrl() || "/images/product-placeholder.jpg"}
          alt={
            isServerCartItem
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (item as any).Variant?.Product?.title || "Product"
              : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (item as any).Product?.title || "Product"
          }
          fill
          className="object-cover rounded-md"
        />
      </div>

      <div className="ml-4 flex-grow">
        <div className="flex justify-between items-start">
          <div className="w-full">
            <h3 className="title-2 md:heading-2-semibold text-gray-900 flex justify-between">
              <Link
                href={getProductUrl()}
                className="hover:text-blue-600 transition-colors duration-200"
              >
                {isServerCartItem
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (item as any).Variant?.Product?.title || "Product"
                  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (item as any).Product?.title || "Product"}
              </Link>
              <PriceDisplay
                inrPrice={item.quantity * currentPrice}
                className=""
              />
            </h3>
            <div className="mt-1 flex items-end">
              <PriceDisplay
                inrPrice={currentPrice}
                className="title-2 md:heading-3 text-highlight-50"
              />
              {discountPercentage > 0 && (
                <PriceDisplay
                  inrPrice={originalPrice}
                  className="ml-2 body-medium md:body-large line-through text-gray-80"
                />
              )}
              {discountPercentage > 0 && (
                <p className="ml-0.5 body-bold md:body-large text-highlight-40">
                  -{discountPercentage}%
                </p>
              )}
            </div>
            {/* Display variant options for both server and guest cart items */}
            {(() => {
              let optionValues: Record<string, string> | undefined;

              if (isServerCartItem) {
                // Server cart item: get option_values from Variant
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const serverItem = item as any;
                optionValues = serverItem.Variant?.option_values;
              } else {
                // Guest cart item: get option_values from Product (if available)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const guestItem = item as any;
                optionValues =
                  guestItem.Product?.option_values || guestItem.option_values;
              }

              if (optionValues && Object.keys(optionValues).length > 0) {
                return (
                  <div className="w-fit body-semibold text-black bg-gray-100 rounded-lg px-3 py-1 mt-2">
                    {Object.entries(optionValues)
                      .map(([, value]) => `${value}`)
                      .join(", ")}
                  </div>
                );
              }
              return null;
            })()}
            {/* {savings > 0 && (
              <div className="w-fit body-semibold text-highlight-40 bg-highlight-60 rounded-lg px-2 py-1 mt-2">
                SAVE <PriceDisplay inrPrice={savings} className="" />
              </div>
            )} */}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center w-20 md:w-24 title-4-semibold bg-blue-100 rounded-md px-2">
            <button
              onClick={handleDecreaseQuantity}
              className="w-8 h-8 flex items-center justify-center text-gray-80"
            >
              <FontAwesomeIcon icon={faMinus} className="text-sm md:text-md" />
            </button>
            <div className="w-12 h-8 md:h-10 flex items-center justify-center text-blue-00 title-2 md:heading-3">
              {quantity}
            </div>
            <button
              onClick={handleIncreaseQuantity}
              className="w-8 h-8 flex items-center justify-center text-blue-00"
            >
              <FontAwesomeIcon icon={faPlus} className="text-sm md:text-md" />
            </button>
          </div>
          <button
            onClick={handleRemoveItem}
            className=" bg-blue-100 rounded-md hover:text-red-500 transition h-8 w-8 md:h-10 md:w-10 flex items-center justify-center text-blue-00"
          >
            <FontAwesomeIcon icon={faTrash} className="h-3 w-3 md:h-4 md:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Cart Totals Component
const CartTotals = () => {
  const { cart } = useShop();

  // Calculate the actual price total (after discounts)
  const subtotal = cart.reduce((total, item) => {
    return total + Number(item.price) * item.quantity;
  }, 0);

  // Coupon code
  const [couponCode, setCouponCode] = useState("");
  const [couponExpanded, setCouponExpanded] = useState(false);

  // Apply coupon function
  const applyCoupon = () => {
    if (couponCode) {
      // Apply coupon logic would go here
      console.log(`Applying coupon: ${couponCode}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <h2 className="title-1 md:heading-3 mb-4 text-gray-10">Cart Totals</h2>

      <div className="space-y-3">
        {/* Coupon Section */}
        <div className="mb-3">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setCouponExpanded(!couponExpanded)}
          >
            <h3 className="body-large-semibold">Add a coupon</h3>
            <FontAwesomeIcon
              icon={couponExpanded ? faChevronUp : faChevronDown}
              className="text-blue-00 transform transition-transform duration-300"
            />
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out mt-3 ${
              couponExpanded ? "max-h-[100px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-grow input-field"
              />
              <button
                onClick={applyCoupon}
                className="bg-blue-00 text-white py-2.5 px-4 rounded-md small-semibold hover:bg-blue-10 transition-colors duration-300"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <p className="body-large-semibold md:title-2-medium text-black">
            Subtotal
          </p>
          <PriceDisplay
            inrPrice={subtotal}
            className="body-large-semibold md:title-2-semibold"
          />
        </div>
        <p className="body-medium text-black">
          Taxes and Shipping calculated at checkout
        </p>

        <Link href="/checkout">
          <button className="w-full bg-blue-00 text-white py-2.5 px-4 rounded-md title-2-semibold hover:bg-blue-10 transition-colors duration-300 mt-3">
            Proceed to Checkout
          </button>
        </Link>
      </div>
    </div>
  );
};

// Cart Page Component
export default function CartPage() {
  const { cart, isCartLoading } = useShop();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Load cart data when component mounts
    const initPage = async () => {
      if (user?.id) {
        try {
          // Wait for any cart loading to complete
          await new Promise((resolve) => {
            // Check if cart is already loaded
            if (!isCartLoading) {
              resolve(true);
              return;
            }

            // If not, check every 100ms until it's no longer loading
            const checkInterval = setInterval(() => {
              if (!isCartLoading) {
                clearInterval(checkInterval);
                resolve(true);
              }
            }, 100);
          });
        } catch (error) {
          console.error("Error initializing cart page:", error);
        }
      }

      // Only set loading to false after a minimum delay (for UI purposes)
      setTimeout(() => {
        setIsPageLoading(false);
      }, 500);
    };

    initPage();
  }, [user, isCartLoading]);

  // Show loading indicator while cart or auth is loading
  if (isPageLoading || isCartLoading || isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-00 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 body-large text-gray-60">Loading your cart...</p>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <h2 className="heading-1-semibold text-gray-900 mb-4">
          Your cart is empty
        </h2>
        <p className="body-large-medium text-gray-500 mb-6">
          Looks like you haven&apos;t added any products to your cart yet.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-00 text-white font-medium px-6 py-3 rounded-md hover:bg-blue-10 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mx-auto py-8">
      <h1 className="text-center md:text-left title-2 md:heading-2-semibold mb-4 md:mb-8 bg-white rounded-lg p-4">
        Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-4 md:p-6">
            <div className="flex justify-between items-center">
              <h1 className="title-1-semibold text-black mb-6"> Product </h1>
              <h1 className="title-1-semibold text-black mb-6"> Total </h1>
            </div>
            {cart.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Cart Totals */}
        <div className="lg:col-span-1">
          <CartTotals />
        </div>
      </div>

      {/* Recently Viewed Products */}
      <div className="mt-12">
        <CartRecentlyViewedSection />
      </div>
    </div>
  );
}
