import React from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import PriceDisplay from "../components/common/PriceDisplay";

// Toast ID for consistent notifications
export const PRODUCT_TOAST_ID = "product-notification";

// Product interface for toast notifications
export interface ProductForToast {
  id: string;
  name?: string;
  title?: string;
  imageUrl?: string;
  image?: string;
  price: number;
  variant_id?: string;
  option_values?: { [key: string]: string };
}

/**
 * Shows a custom toast notification with product details
 * @param product - Product data to display in the toast
 * @param action - Action text to display (e.g., "Added to cart", "Removed from cart")
 */
export const showProductToast = (product: ProductForToast, action: string) => {
  // Dismiss any existing product toast first
  toast.dismiss(PRODUCT_TOAST_ID);

  console.log("showProductToast", product, action);

  // Get variant information if available
  let variantInfo = "";

  // Try to get variant info from option_values first (passed as prop)
  if (product.option_values && Object.keys(product.option_values).length > 0) {
    variantInfo = Object.entries(product.option_values)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  }
  // Then try from variant_id (fallback)
  else if (product.variant_id && product.variant_id.includes(":")) {
    variantInfo = product.variant_id
      .split(",")
      .map((part) => {
        const [key, value] = part.split(":");
        return value ? `${key}: ${value}` : null;
      })
      .filter(Boolean)
      .join(", ");
  }

  // Increased delay to ensure DOM updates before showing new toast
  setTimeout(() => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible
              ? "animate-enter translate-y-0 opacity-100"
              : "animate-leave translate-y-full opacity-0"
          } transform transition-all duration-500 ease-in-out max-w-md w-full bg-white rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <Image
                  src={
                    product.imageUrl ||
                    product.image ||
                    "/images/placeholder.jpg"
                  }
                  alt={product.name || product.title || "Product"}
                  width={50}
                  height={50}
                  className="h-12 w-12 rounded-md object-cover"
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="small-semibold text-gray-10">{action}</p>
                <p className="xsmall-medium text-black mt-1 line-clamp-1">
                  {product.name || product.title || "Product"}
                </p>
                {variantInfo && (
                  <p className="xsmall-regular text-gray-10 mt-0.5">
                    {variantInfo}
                  </p>
                )}
                <div className="flex items-center mt-1">
                  <PriceDisplay
                    inrPrice={product.price}
                    className="md:xsmall-bold text-highlight-50"
                    showLoading={false}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Close button removed */}
        </div>
      ),
      {
        id: PRODUCT_TOAST_ID,
        position: "top-right",
        duration: 2000,
      }
    );
  }, 300); // Increased delay for better animation
};
