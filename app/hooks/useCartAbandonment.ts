import { useEffect, useRef, useCallback } from "react";
import { markCartAsAbandoned } from "@/app/lib/services/cartService";
import {
  CART_ABANDONMENT_TIMEOUT_MINUTES,
  API_BASE_URL,
} from "@/app/lib/config";

interface UseCartAbandonmentProps {
  cartId: string | null;
  isCheckoutPage?: boolean;
  onCartAbandoned?: () => void;
}

export const useCartAbandonment = ({
  cartId,
  isCheckoutPage = false,
  onCartAbandoned,
}: UseCartAbandonmentProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAbandonedRef = useRef(false);

  // Function to mark cart as abandoned
  const abandonCart = useCallback(async () => {
    if (!cartId || isAbandonedRef.current) return;

    try {
      console.log(`Marking cart ${cartId} as abandoned`);
      const result = await markCartAsAbandoned(cartId);

      if (result.success) {
        isAbandonedRef.current = true;
        onCartAbandoned?.();
      } else {
        console.error("Failed to mark cart as abandoned:", result.message);
      }
    } catch (error) {
      console.error("Error marking cart as abandoned:", error);
    }
  }, [cartId, onCartAbandoned]);

  // Start abandonment timer
  const startAbandonmentTimer = useCallback(() => {
    if (!cartId || !isCheckoutPage) return;

    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timer
    const timeoutMs = CART_ABANDONMENT_TIMEOUT_MINUTES * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      
      abandonCart();
    }, timeoutMs);
  }, [cartId, isCheckoutPage, abandonCart]);

  // Stop abandonment timer
  const stopAbandonmentTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Reset abandonment state (useful when payment is completed)
  const resetAbandonmentState = useCallback(() => {
    isAbandonedRef.current = false;
    stopAbandonmentTimer();
  }, [stopAbandonmentTimer]);

  // Handle page visibility change (tab switch, minimize, etc.)
  useEffect(() => {
    if (!isCheckoutPage || !cartId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - user switched tabs or minimized
        console.log("Page hidden - starting abandonment timer");
        startAbandonmentTimer();
      } else {
        // Page is visible again - stop timer
        console.log("Page visible - stopping abandonment timer");
        stopAbandonmentTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isCheckoutPage, cartId, startAbandonmentTimer, stopAbandonmentTimer]);

  // Handle page unload (tab close, navigation away)
  useEffect(() => {
    if (!isCheckoutPage || !cartId) return;

    const handleBeforeUnload = () => {
      // Mark cart as abandoned when user leaves the page
      console.log("Page unloading - marking cart as abandoned");
      // Use synchronous approach for page unload
      if (!isAbandonedRef.current) {
        // Use navigator.sendBeacon for reliable delivery during page unload
        const data = JSON.stringify({ status: "abandoned" });
        const token = localStorage.getItem("auth_token");

        if (token) {
          navigator.sendBeacon(
            `${API_BASE_URL}/user/cart/update-status/${cartId}`,
            new Blob([data], { type: "application/json" })
          );
        }
      }
    };

    const handleUnload = () => {
      // Fallback for older browsers
      abandonCart();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, [isCheckoutPage, cartId, abandonCart]);

  // Handle user activity to reset timer
  useEffect(() => {
    if (!isCheckoutPage || !cartId) return;

    const resetTimerOnActivity = () => {
      if (document.visibilityState === "visible") {
        console.log("User activity detected - resetting abandonment timer");
        startAbandonmentTimer();
      }
    };

    // Activity events to track
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners for user activity
    activityEvents.forEach((event) => {
      document.addEventListener(event, resetTimerOnActivity, { passive: true });
    });

    return () => {
      // Cleanup event listeners
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetTimerOnActivity);
      });
    };
  }, [isCheckoutPage, cartId, startAbandonmentTimer]);

  // Start timer when checkout page loads
  useEffect(() => {
    if (isCheckoutPage && cartId) {
      console.log("Checkout page loaded - starting abandonment timer");
      startAbandonmentTimer();
    }

    return () => {
      stopAbandonmentTimer();
    };
  }, [isCheckoutPage, cartId, startAbandonmentTimer, stopAbandonmentTimer]);

  return {
    startAbandonmentTimer,
    stopAbandonmentTimer,
    resetAbandonmentState,
    abandonCart,
  };
};
