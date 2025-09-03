"use client";

import { useState, useEffect } from "react";
import { convertPrice } from "@/app/lib/services/locationPricingService";
import { ConvertedPrice } from "@/app/lib/services/currencyService";

interface PriceDisplayProps {
  /** Price in INR */
  inrPrice: number | null | undefined;
  /** Show original INR price alongside converted price */
  showOriginal?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Show loading state */
  showLoading?: boolean;
}

export default function PriceDisplay({
  inrPrice,
  showOriginal = false,
  className = "",
  showLoading = true,
}: PriceDisplayProps) {
  const [convertedPrice, setConvertedPrice] = useState<ConvertedPrice | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPrice = async () => {
      // Double-check inrPrice is valid before converting
      if (inrPrice === null || inrPrice === undefined || isNaN(inrPrice) || inrPrice <= 0) {
        if (mounted) {
          setError("Invalid price");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const converted = await convertPrice(inrPrice);

        if (mounted) {
          setConvertedPrice(converted);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to convert price:", err);
        if (mounted) {
          setError("Failed to load price");
          setLoading(false);
        }
      }
    };

    // Listen for currency change events (from manual selection)
    const handleCurrencyChange = () => {
      loadPrice();
    };

    loadPrice();

    // Add event listener for manual currency changes
    window.addEventListener("currencyChanged", handleCurrencyChange);

    return () => {
      mounted = false;
      window.removeEventListener("currencyChanged", handleCurrencyChange);
    };
  }, [inrPrice]);

  // Early return if price is invalid - moved after hooks
  if (inrPrice === null || inrPrice === undefined || isNaN(inrPrice) || inrPrice <= 0) {
    return (
      <span className={`text-gray-500 ${className}`}>Price not available</span>
    );
  }

  if (loading && showLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (error) {
    return (
      <span className={`text-red-500 ${className}`}>Price unavailable</span>
    );
  }

  if (!convertedPrice) {
    return <span className={className}>₹{(inrPrice || 0).toFixed(2)}</span>;
  }

  return (
    <span className={className}>
      {convertedPrice.formattedPrice}
      {showOriginal && convertedPrice.toCurrency !== "INR" && (
        <span className="text-sm text-gray-500 ml-2">
          (₹{(inrPrice || 0).toFixed(2)})
        </span>
      )}
    </span>
  );
}

// Utility component for product cards
export function ProductPrice({
  inrPrice,
  originalPrice,
  className = "",
}: {
  inrPrice: number | null | undefined;
  originalPrice?: number | null | undefined;
  className?: string;
}) {
  return (
    <div className={`product-price ${className}`}>
      <PriceDisplay
        inrPrice={inrPrice}
        className="text-lg font-bold text-green-600"
      />
      {originalPrice && 
       (inrPrice !== null && inrPrice !== undefined) && 
       originalPrice > inrPrice && (
        <PriceDisplay
          inrPrice={originalPrice}
          className="text-sm text-gray-500 line-through ml-2"
        />
      )}
    </div>
  );
}

// Utility component for cart/checkout totals
export function TotalPrice({
  inrTotal,
  className = "",
}: {
  inrTotal: number | null | undefined;
  className?: string;
}) {
  return (
    <PriceDisplay
      inrPrice={inrTotal}
      showOriginal={true}
      className={`total-price text-xl font-bold ${className}`}
    />
  );
}
