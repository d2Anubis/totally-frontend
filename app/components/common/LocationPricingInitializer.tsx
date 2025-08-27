"use client";

import { useEffect, useState } from "react";
import locationPricingService from "@/app/lib/services/locationPricingService";

interface PricingStatus {
  isReady: boolean;
  userCountry: string;
  userCurrency: string;
  error?: string;
}

export default function LocationPricingInitializer() {
  const [, setStatus] = useState<PricingStatus>({
    isReady: false,
    userCountry: "",
    userCurrency: "",
  });

  useEffect(() => {
    let mounted = true;

    const initializePricing = async () => {
      try {

        // Clear any existing cache on page load to ensure fresh data
        if (typeof window !== "undefined") {
          await locationPricingService.refresh();
        }
        const success = await locationPricingService.initialize();

        if (mounted) {
          const context = locationPricingService.getContext();

          setStatus({
            isReady: true,
            userCountry: context?.userCountry || "United States",
            userCurrency: context?.userCurrency || "USD",
            error: success ? undefined : "Using fallback pricing (USD)",
          });

          window.dispatchEvent(
            new CustomEvent("locationPricingReady", {
              detail: {
                country: context?.userCountry || "United States",
                currency: context?.userCurrency || "USD",
                success,
              },
            })
          );
        }
      } catch (error) {

        if (mounted) {
          setStatus({
            isReady: true,
            userCountry: "United States",
            userCurrency: "USD",
            error: "Failed to detect location, using USD pricing",
          });

          // Still notify with fallback data
          window.dispatchEvent(
            new CustomEvent("locationPricingReady", {
              detail: {
                country: "United States",
                currency: "USD",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              },
            })
          );
        }
      }
    };

    // Start initialization immediately
    initializePricing();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  // This component doesn't render anything visible
  // It just handles the initialization in the background
  return null;
}

// Hook for components to check if pricing is ready
export function usePricingStatus() {
  const [isReady, setIsReady] = useState(false);
  const [userCurrency, setUserCurrency] = useState("USD");
  const [userCountry, setUserCountry] = useState("United States");

  useEffect(() => {
    const handlePricingReady = (event: CustomEvent) => {
      setIsReady(true);
      setUserCurrency(event.detail.currency);
      setUserCountry(event.detail.country);
    };

    // Check if already ready
    if (locationPricingService.isReady()) {
      const context = locationPricingService.getContext();
      setIsReady(true);
      setUserCurrency(context?.userCurrency || "USD");
      setUserCountry(context?.userCountry || "United States");
    }

    // Listen for pricing ready event
    window.addEventListener(
      "locationPricingReady",
      handlePricingReady as EventListener
    );

    return () => {
      window.removeEventListener(
        "locationPricingReady",
        handlePricingReady as EventListener
      );
    };
  }, []);

  return { isReady, userCurrency, userCountry };
}
