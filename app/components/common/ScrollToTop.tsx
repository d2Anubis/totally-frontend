"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Force scroll to top with multiple strategies
    const scrollToTop = () => {
      // Set scroll position to 0 for all possible scroll containers
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      // Force scroll on document element
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
      }

      // Force scroll on body
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      }

      // Find any other scrollable elements and reset them
      const scrollableElements = document.querySelectorAll(
        '[style*="overflow"]'
      );
      scrollableElements.forEach((element) => {
        const scrollableElement = element as HTMLElement;
        if (scrollableElement.scrollTop !== undefined) {
          scrollableElement.scrollTop = 0;
        }
      });
    };

    // Immediate scroll
    scrollToTop();

    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      scrollToTop();
    });

    // Additional delayed scrolls to handle any async content loading
    const timeouts = [
      setTimeout(scrollToTop, 0),
      setTimeout(scrollToTop, 10),
      setTimeout(scrollToTop, 100),
      setTimeout(scrollToTop, 300),
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}
